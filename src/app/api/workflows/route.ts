import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const workflows = await db.workflow.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        executions: {
          take: 5,
          orderBy: { startedAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: workflows });
  } catch (error) {
    console.error("Failed to fetch workflows:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}
