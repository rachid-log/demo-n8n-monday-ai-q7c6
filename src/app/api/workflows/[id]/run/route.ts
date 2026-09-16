import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { simulateError = false, errorStep = "Monday.com AP Board Sync", samplePayload } = body;

    const workflow = await db.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 }
      );
    }

    const isFailure = Boolean(simulateError);

    // Node execution snapshots simulating real n8n engine steps
    const nodeSnapshots = [
      {
        nodeId: "node_1",
        name: "Webhook Intake",
        status: "completed",
        durationMs: 74,
        message: "HTTP 200: Raw document payload received and validated",
      },
      {
        nodeId: "node_2",
        name: "Document OCR Parser",
        status: "completed",
        durationMs: 620,
        message: "Tesseract OCR extracted 1,842 characters with 99.2% confidence",
      },
      {
        nodeId: "node_3",
        name: "Structured LLM Extractor",
        status: isFailure && errorStep.includes("LLM") ? "failed" : "completed",
        durationMs: isFailure && errorStep.includes("LLM") ? 340 : 780,
        message:
          isFailure && errorStep.includes("LLM")
            ? "SchemaValidationError: OCR confidence 62.4% below safety threshold"
            : "GPT-4o successfully parsed invoice schema into structured JSON",
      },
      {
        nodeId: "node_4",
        name: "Monday.com AP Board Sync",
        status:
          isFailure && errorStep.includes("Monday")
            ? "failed"
            : isFailure && errorStep.includes("LLM")
            ? "skipped"
            : "completed",
        durationMs: isFailure && errorStep.includes("Monday") ? 48 : 280,
        message:
          isFailure && errorStep.includes("Monday")
            ? "RateLimitError: Monday.com API GraphQL complexity budget exceeded (reset in 4.2s)"
            : "GraphQL mutation create_item executed. Monday item ID generated.",
      },
      {
        nodeId: "node_5",
        name: "Slack Operations Alert",
        status: isFailure ? "skipped" : "completed",
        durationMs: isFailure ? 0 : 110,
        message: isFailure
          ? "Skipped due to upstream node failure"
          : "Dispatched operational notification to #finance-ops-feed",
      },
    ];

    const totalDuration = nodeSnapshots.reduce((acc, n) => acc + n.durationMs, 0);

    const payloadIn = samplePayload
      ? JSON.stringify(samplePayload)
      : JSON.stringify({
          source: "n8n_live_trigger",
          triggeredAt: new Date().toISOString(),
          file: "Acme_Invoice_AutoRun.pdf",
          fileSizeBytes: 312000,
        });

    let payloadOut = "";
    let errorMsg: string | null = null;
    let failedStepName: string | null = null;

    if (isFailure) {
      if (errorStep.includes("Monday")) {
        failedStepName = "Monday.com AP Board Sync";
        errorMsg = "RateLimitError: Monday.com API GraphQL complexity budget exceeded (reset in 4.2s)";
      } else {
        failedStepName = "Structured LLM Extractor";
        errorMsg = "SchemaValidationError: Document OCR confidence 62.4% below safety threshold (90.0%)";
      }
      payloadOut = JSON.stringify({
        status: "FAILED",
        failedAtStep: failedStepName,
        error: errorMsg,
        suggestedAction: "Retry with exponential backoff strategy",
      });
    } else {
      payloadOut = JSON.stringify({
        vendorName: "Acme Corp",
        invoiceNumber: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount: 14250.0,
        dueDate: "2024-12-15",
        mondayItemId: `item_${Math.floor(100000 + Math.random() * 900000)}`,
        status: "SYNCED_TO_MONDAY",
      });
    }

    const execution = await db.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: isFailure ? "FAILED" : "SUCCESS",
        triggeredBy: "Manual Canvas Trigger",
        durationMs: totalDuration,
        errorStep: failedStepName,
        errorMsg: errorMsg,
        payloadIn,
        payloadOut,
        nodeSnapshots: JSON.stringify(nodeSnapshots),
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Update workflow stats
    const totalRuns = workflow.totalRuns + 1;
    const newSuccessRate = isFailure
      ? Math.max(90, Math.round(((workflow.successRate * workflow.totalRuns) / totalRuns) * 10) / 10)
      : Math.min(99.9, Math.round(((workflow.successRate * workflow.totalRuns + 100) / totalRuns) * 10) / 10);

    await db.workflow.update({
      where: { id: workflow.id },
      data: {
        totalRuns,
        successRate: newSuccessRate,
      },
    });

    // If successful and it's the invoice workflow, optionally append an item to Monday.com AP Board
    if (!isFailure && workflow.slug === "invoice-processing") {
      const apBoard = await db.mondayBoard.findFirst({
        where: { boardType: "ACCOUNTS_PAYABLE" },
      });
      if (apBoard) {
        const randId = Math.floor(1000 + Math.random() * 9000);
        await db.mondayItem.create({
          data: {
            boardId: apBoard.id,
            name: `INV-2024-${randId} - Acme Corp Cloud Ingestion`,
            status: "Approved",
            priority: "High",
            syncSource: "n8n_live_run",
            columnValues: JSON.stringify({
              vendor: "Acme Corp",
              status: "Approved",
              amount: 14250.0,
              invoiceDate: new Date().toISOString().split("T")[0],
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
              confidence: "99.4%",
              priority: "High",
              taxId: "US-94-3829104",
              lineItemCount: 3,
            }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        execution,
        nodeSnapshots,
      },
    });
  } catch (error) {
    console.error("Workflow run execution failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute workflow simulation" },
      { status: 500 }
    );
  }
}
