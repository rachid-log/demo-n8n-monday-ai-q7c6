import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding n8n AI Automation & Monday.com Integration Hub database...");

  // 1. Clean existing records to ensure fresh, deterministic seed state
  await prisma.mondayItem.deleteMany();
  await prisma.mondayBoard.deleteMany();
  await prisma.workflowExecution.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.documentRecord.deleteMany();
  await prisma.automationMetric.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 2. Default User
  const demoUser = await prisma.user.create({
    data: {
      email: "rachid@automation-mastery.io",
      name: "Rachid (Lead Automation Engineer)",
      role: "admin",
      projects: {
        create: [
          {
            name: "Enterprise n8n Orchestrator",
            description: "Production event-driven automation cluster with Monday.com bi-directional sync",
            status: "active",
          },
          {
            name: "AI Document Intelligence Hub",
            description: "OCR & LLM extraction microservice with strict schema enforcement",
            status: "active",
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded User: ${demoUser.name}`);

  // 3. Workflows
  const invoiceWorkflow = await prisma.workflow.create({
    data: {
      name: "Enterprise Invoice Processing (OCR -> GPT-4o -> Monday.com)",
      slug: "invoice-processing",
      category: "Finance / AP",
      triggerType: "Webhook",
      status: "active",
      totalRuns: 8420,
      successRate: 99.4,
      avgDurationMs: 1820,
      nodesConfig: JSON.stringify([
        {
          id: "node_1",
          name: "Webhook Intake",
          type: "webhook",
          service: "n8n-core",
          icon: "Webhook",
          endpoint: "POST /webhook/v1/invoice-intake",
          status: "idle",
          latencyMs: 85,
          config: { auth: "Bearer Token", maxPayloadMb: 25 },
        },
        {
          id: "node_2",
          name: "Document OCR Parser",
          type: "ocr",
          service: "Tesseract / Vision AI",
          icon: "ScanLine",
          status: "idle",
          latencyMs: 640,
          config: { engine: "tesseract-v5-neural", autoDeskew: true, dpi: 300 },
        },
        {
          id: "node_3",
          name: "Structured LLM Extractor",
          type: "ai_llm",
          service: "OpenAI GPT-4o",
          icon: "Sparkles",
          status: "idle",
          latencyMs: 820,
          config: { model: "gpt-4o-2024-08-06", temperature: 0.0, response_format: "json_schema" },
        },
        {
          id: "node_4",
          name: "Monday.com AP Board Sync",
          type: "integration",
          service: "Monday.com API v2024",
          icon: "LayoutGrid",
          status: "idle",
          latencyMs: 310,
          config: { boardId: "board_ap_01", mutation: "create_item_with_column_values", retryBackoff: "exponential" },
        },
        {
          id: "node_5",
          name: "Slack Operations Alert",
          type: "notification",
          service: "Slack Webhook",
          icon: "BellRing",
          status: "idle",
          latencyMs: 120,
          config: { channel: "#finance-ops-feed", notifyOn: "always" },
        },
      ]),
    },
  });

  const leadWorkflow = await prisma.workflow.create({
    data: {
      name: "B2B Lead Enrichment & Monday CRM Sync",
      slug: "lead-enrichment",
      category: "Sales / CRM",
      triggerType: "Webhook",
      status: "active",
      totalRuns: 3410,
      successRate: 99.8,
      avgDurationMs: 1450,
      nodesConfig: JSON.stringify([
        {
          id: "node_l1",
          name: "Inbound Lead Webhook",
          type: "webhook",
          service: "n8n-core",
          icon: "Webhook",
          endpoint: "POST /webhook/crm/lead-intake",
          status: "idle",
          latencyMs: 60,
          config: { source: "Typeform / Webflow" },
        },
        {
          id: "node_l2",
          name: "Clearbit Firmographic Lookup",
          type: "enrichment",
          service: "Clearbit API",
          icon: "Search",
          status: "idle",
          latencyMs: 420,
          config: { matchFields: ["domain", "companyName", "employeeCount"] },
        },
        {
          id: "node_l3",
          name: "GPT-4o Intent & Score",
          type: "ai_llm",
          service: "OpenAI GPT-4o",
          icon: "Sparkles",
          status: "idle",
          latencyMs: 680,
          config: { scoringCriteria: "B2B ARR > $50k", outputRange: "1-100" },
        },
        {
          id: "node_l4",
          name: "Monday CRM Deal Ingestion",
          type: "integration",
          service: "Monday.com API v2024",
          icon: "LayoutGrid",
          status: "idle",
          latencyMs: 290,
          config: { boardId: "board_crm_02", autoAssignRep: true },
        },
      ]),
    },
  });

  const contractWorkflow = await prisma.workflow.create({
    data: {
      name: "Legal Contract Clause & Risk Analyzer",
      slug: "contract-analyzer",
      category: "Legal / Compliance",
      triggerType: "Schedule",
      status: "active",
      totalRuns: 2400,
      successRate: 98.9,
      avgDurationMs: 2900,
      nodesConfig: JSON.stringify([
        {
          id: "node_c1",
          name: "Google Drive Folder Poller",
          type: "poller",
          service: "Google Drive API",
          icon: "FolderSync",
          status: "idle",
          latencyMs: 190,
          config: { folder: "Incoming-Contracts-2024", checkInterval: "5m" },
        },
        {
          id: "node_c2",
          name: "Clause Extraction Engine",
          type: "ai_llm",
          service: "Claude 3.5 Sonnet",
          icon: "FileCheck",
          status: "idle",
          latencyMs: 1450,
          config: { clauses: ["indemnity", "governing_law", "auto_renewal", "liability_cap"] },
        },
        {
          id: "node_c3",
          name: "Monday Legal Review Board",
          type: "integration",
          service: "Monday.com API v2024",
          icon: "LayoutGrid",
          status: "idle",
          latencyMs: 340,
          config: { boardId: "board_legal_03" },
        },
      ]),
    },
  });

  console.log("✅ Seeded Workflows");

  // 4. Monday Boards
  const apBoard = await prisma.mondayBoard.create({
    data: {
      id: "board_ap_01",
      name: "Accounts Payable Hub",
      boardType: "ACCOUNTS_PAYABLE",
      workspaceName: "Global Finance & Operations",
      columnsConfig: JSON.stringify([
        { key: "item", title: "Invoice Reference", type: "text", width: "240px" },
        { key: "vendor", title: "Vendor", type: "badge", width: "160px" },
        { key: "status", title: "Approval Status", type: "status", width: "140px" },
        { key: "amount", title: "Total (USD)", type: "currency", width: "130px" },
        { key: "invoiceDate", title: "Invoice Date", type: "date", width: "120px" },
        { key: "dueDate", title: "Due Date", type: "date", width: "120px" },
        { key: "confidence", title: "AI Confidence", type: "score", width: "120px" },
        { key: "priority", title: "Priority", type: "priority", width: "110px" },
      ]),
    },
  });

  const crmBoard = await prisma.mondayBoard.create({
    data: {
      id: "board_crm_02",
      name: "CRM Inbound Leads",
      boardType: "CRM_LEADS",
      workspaceName: "Enterprise Revenue Pipeline",
      columnsConfig: JSON.stringify([
        { key: "item", title: "Lead Contact", type: "text", width: "220px" },
        { key: "company", title: "Company", type: "badge", width: "160px" },
        { key: "status", title: "Pipeline Stage", type: "status", width: "140px" },
        { key: "estValue", title: "Est. Deal Value", type: "currency", width: "130px" },
        { key: "leadScore", title: "AI Score", type: "score", width: "110px" },
        { key: "email", title: "Direct Email", type: "email", width: "200px" },
        { key: "priority", title: "Urgency", type: "priority", width: "110px" },
      ]),
    },
  });

  const legalBoard = await prisma.mondayBoard.create({
    data: {
      id: "board_legal_03",
      name: "Legal & Contract Risk Analyzer",
      boardType: "LEGAL_REVIEW",
      workspaceName: "Legal & Compliance",
      columnsConfig: JSON.stringify([
        { key: "item", title: "Contract Document", type: "text", width: "240px" },
        { key: "party", title: "Counterparty", type: "badge", width: "160px" },
        { key: "status", title: "Review State", type: "status", width: "140px" },
        { key: "riskLevel", title: "Risk Rating", type: "status", width: "130px" },
        { key: "signee", title: "Signee", type: "text", width: "140px" },
        { key: "term", title: "Agreement Term", type: "text", width: "120px" },
        { key: "priority", title: "Priority", type: "priority", width: "110px" },
      ]),
    },
  });

  console.log("✅ Seeded Monday Boards");

  // 5. Monday Items
  await prisma.mondayItem.createMany({
    data: [
      // AP Board
      {
        boardId: apBoard.id,
        name: "INV-2023-8891 - Acme Corp Enterprise Suite",
        status: "Approved",
        priority: "High",
        syncSource: "ocr_pipeline",
        columnValues: JSON.stringify({
          vendor: "Acme Corp",
          status: "Approved",
          amount: 14250.0,
          invoiceDate: "2023-10-24",
          dueDate: "2023-11-23",
          confidence: "99.4%",
          priority: "High",
          taxId: "US-94-3829104",
          lineItemCount: 3,
        }),
      },
      {
        boardId: apBoard.id,
        name: "INV-2023-7412 - Globex Server Infrastructure",
        status: "Needs Review",
        priority: "Medium",
        syncSource: "ocr_pipeline",
        columnValues: JSON.stringify({
          vendor: "Globex Corp",
          status: "Needs Review",
          amount: 6430.2,
          invoiceDate: "2023-11-02",
          dueDate: "2023-12-02",
          confidence: "94.8%",
          priority: "Medium",
          taxId: "US-88-2910492",
          lineItemCount: 2,
        }),
      },
      {
        boardId: apBoard.id,
        name: "INV-2023-9904 - Apex Logistics Global Freight",
        status: "Paid",
        priority: "Low",
        syncSource: "ocr_pipeline",
        columnValues: JSON.stringify({
          vendor: "Apex Logistics",
          status: "Paid",
          amount: 3420.5,
          invoiceDate: "2023-10-28",
          dueDate: "2023-11-12",
          confidence: "98.7%",
          priority: "Low",
          taxId: "US-12-9938104",
          lineItemCount: 4,
        }),
      },
      {
        boardId: apBoard.id,
        name: "INV-2023-1024 - SaaSify AI Inference Clusters",
        status: "Pending OCR",
        priority: "Critical",
        syncSource: "n8n_webhook",
        columnValues: JSON.stringify({
          vendor: "SaaSify Cloud",
          status: "Pending OCR",
          amount: 8890.0,
          invoiceDate: "2023-11-12",
          dueDate: "2023-11-26",
          confidence: "Pending",
          priority: "Critical",
          taxId: "US-77-3819203",
          lineItemCount: 1,
        }),
      },
      {
        boardId: apBoard.id,
        name: "INV-2023-1101 - Stripe Automated Billing Fees",
        status: "Synced",
        priority: "Low",
        syncSource: "n8n_webhook",
        columnValues: JSON.stringify({
          vendor: "Stripe Inc",
          status: "Synced",
          amount: 1240.8,
          invoiceDate: "2023-10-31",
          dueDate: "2023-10-31",
          confidence: "99.9%",
          priority: "Low",
          taxId: "US-36-4829101",
          lineItemCount: 5,
        }),
      },
      // CRM Board
      {
        boardId: crmBoard.id,
        name: "Sarah Jenkins (CTO)",
        status: "Qualified",
        priority: "High",
        syncSource: "n8n_webhook",
        columnValues: JSON.stringify({
          company: "TechStart Inc",
          status: "Qualified",
          estValue: 85000,
          leadScore: "94 / 100",
          email: "sarah@techstart.io",
          priority: "High",
        }),
      },
      {
        boardId: crmBoard.id,
        name: "Marcus Vance (VP Ops)",
        status: "Demo Scheduled",
        priority: "Critical",
        syncSource: "n8n_webhook",
        columnValues: JSON.stringify({
          company: "Omnicorp Global",
          status: "Demo Scheduled",
          estValue: 120000,
          leadScore: "88 / 100",
          email: "m.vance@omnicorpglobal.com",
          priority: "Critical",
        }),
      },
      {
        boardId: crmBoard.id,
        name: "Elena Rostova (Head of AI)",
        status: "Contacted",
        priority: "Medium",
        syncSource: "n8n_webhook",
        columnValues: JSON.stringify({
          company: "FinEdge Systems",
          status: "Contacted",
          estValue: 45000,
          leadScore: "78 / 100",
          email: "elena@finedge.tech",
          priority: "Medium",
        }),
      },
      // Legal Board
      {
        boardId: legalBoard.id,
        name: "Mutual NDA Agreement v2.4",
        status: "Executed",
        priority: "Low",
        syncSource: "n8n_webhook",
        columnValues: JSON.stringify({
          party: "Globex Corp",
          status: "Executed",
          riskLevel: "Low Risk (12%)",
          signee: "John Doe (CEO)",
          term: "3 Years",
          priority: "Low",
        }),
      },
      {
        boardId: legalBoard.id,
        name: "Master Services Agreement (MSA)",
        status: "Under Review",
        priority: "High",
        syncSource: "ocr_pipeline",
        columnValues: JSON.stringify({
          party: "TechStart Inc",
          status: "Under Review",
          riskLevel: "Moderate (38%)",
          signee: "Sarah Jenkins",
          term: "1 Year",
          priority: "High",
        }),
      },
    ],
  });

  console.log("✅ Seeded Monday Items");

  // 6. Workflow Executions (History & Failure for Flow 3 Error Recovery)
  await prisma.workflowExecution.createMany({
    data: [
      {
        workflowId: invoiceWorkflow.id,
        status: "SUCCESS",
        triggeredBy: "Webhook (Invoice Upload)",
        durationMs: 1855,
        retryCount: 0,
        payloadIn: JSON.stringify({
          source: "email_attachment",
          fileName: "Acme_Invoice_Oct2023.pdf",
          fileSizeBytes: 245080,
          mimeType: "application/pdf",
        }),
        payloadOut: JSON.stringify({
          vendor: "Acme Corp",
          invoiceNumber: "INV-2023-8891",
          totalAmount: 14250.0,
          taxAmount: 1140.0,
          mondayItemId: "item_acme_8891",
          slackChannelSent: "#finance-ops-feed",
        }),
        nodeSnapshots: JSON.stringify([
          { nodeId: "node_1", status: "completed", durationMs: 82, message: "Webhook payload validated" },
          { nodeId: "node_2", status: "completed", durationMs: 645, message: "OCR completed with 99.4% confidence" },
          { nodeId: "node_3", status: "completed", durationMs: 798, message: "GPT-4o extracted 4 fields & 3 line items" },
          { nodeId: "node_4", status: "completed", durationMs: 215, message: "Created Monday.com item in board_ap_01" },
          { nodeId: "node_5", status: "completed", durationMs: 115, message: "Slack notification posted successfully" },
        ]),
        startedAt: new Date(Date.now() - 1000 * 60 * 12),
        completedAt: new Date(Date.now() - 1000 * 60 * 12 + 1855),
      },
      {
        workflowId: invoiceWorkflow.id,
        status: "FAILED",
        triggeredBy: "Webhook (Invoice Upload)",
        durationMs: 1420,
        errorStep: "Monday.com AP Board Sync",
        errorMsg: "RateLimitError: Monday.com API GraphQL complexity budget exceeded (reset in 4.2s)",
        retryCount: 0,
        payloadIn: JSON.stringify({
          source: "sftp_drop",
          fileName: "Globex_Invoice_Nov2023.pdf",
          fileSizeBytes: 512900,
        }),
        payloadOut: JSON.stringify({
          ocrCompleted: true,
          llmExtractionCompleted: true,
          syncAttemptFailed: true,
          suggestedRemedy: "Execute retry with exponential backoff strategy",
        }),
        nodeSnapshots: JSON.stringify([
          { nodeId: "node_1", status: "completed", durationMs: 78, message: "Payload received" },
          { nodeId: "node_2", status: "completed", durationMs: 590, message: "OCR text extracted" },
          { nodeId: "node_3", status: "completed", durationMs: 710, message: "GPT-4o JSON generated" },
          { nodeId: "node_4", status: "failed", durationMs: 42, message: "HTTP 429: Monday.com API rate limited" },
          { nodeId: "node_5", status: "skipped", durationMs: 0, message: "Skipped due to upstream node failure" },
        ]),
        startedAt: new Date(Date.now() - 1000 * 60 * 25),
        completedAt: new Date(Date.now() - 1000 * 60 * 25 + 1420),
      },
      {
        workflowId: invoiceWorkflow.id,
        status: "FAILED",
        triggeredBy: "SFTP Batch Listener",
        durationMs: 910,
        errorStep: "Structured LLM Extractor",
        errorMsg: "SchemaValidationError: Document OCR confidence 62.4% below safety threshold (90.0%)",
        retryCount: 0,
        payloadIn: JSON.stringify({
          fileName: "Blurry_Scan_Receipt_004.jpg",
          scanResolutionDpi: 72,
        }),
        payloadOut: JSON.stringify({
          ocrWarning: "Low contrast scan detected",
          humanInTheLoopFlagged: true,
        }),
        nodeSnapshots: JSON.stringify([
          { nodeId: "node_1", status: "completed", durationMs: 55, message: "File ingested" },
          { nodeId: "node_2", status: "completed", durationMs: 480, message: "Low confidence OCR: 62.4%" },
          { nodeId: "node_3", status: "failed", durationMs: 375, message: "Schema guard aborted processing" },
        ]),
        startedAt: new Date(Date.now() - 1000 * 60 * 55),
        completedAt: new Date(Date.now() - 1000 * 60 * 55 + 910),
      },
      {
        workflowId: leadWorkflow.id,
        status: "SUCCESS",
        triggeredBy: "Typeform Webhook",
        durationMs: 1420,
        retryCount: 0,
        payloadIn: JSON.stringify({ leadName: "Sarah Jenkins", domain: "techstart.io" }),
        payloadOut: JSON.stringify({ company: "TechStart Inc", dealSize: 85000, status: "Created in CRM" }),
        startedAt: new Date(Date.now() - 1000 * 60 * 70),
        completedAt: new Date(Date.now() - 1000 * 60 * 70 + 1420),
      },
      {
        workflowId: contractWorkflow.id,
        status: "SUCCESS",
        triggeredBy: "Google Drive Watcher",
        durationMs: 2950,
        retryCount: 0,
        payloadIn: JSON.stringify({ file: "Globex_NDA_v2.pdf", sizeKb: 890 }),
        payloadOut: JSON.stringify({ riskRating: "Low Risk (12%)", boardItemCreated: true }),
        startedAt: new Date(Date.now() - 1000 * 60 * 120),
        completedAt: new Date(Date.now() - 1000 * 60 * 120 + 2950),
      },
    ],
  });

  console.log("✅ Seeded Workflow Executions");

  // 7. Sample Documents for AI Playground
  await prisma.documentRecord.createMany({
    data: [
      {
        title: "Acme Corp Enterprise Invoice #8891",
        documentType: "INVOICE",
        fileType: "pdf",
        status: "PROCESSED",
        ocrConfidence: 99.4,
        tokensUsed: 1420,
        syncStatus: "SYNCED",
        rawText: `ACME CORPORATION
100 Innovation Way, Suite 400
San Francisco, CA 94105
Tax ID: US-94-3829104

INVOICE #: INV-2023-8891
DATE: October 24, 2023
PAYMENT TERMS: Net 30
DUE DATE: November 23, 2023

BILL TO:
Global Operations Hub Inc.
500 Tech Parkway, Floor 12
Austin, TX 78701

ITEMS & SERVICES:
1. Enterprise Cloud Infrastructure Cluster (Oct 2023) - $8,500.00
2. 24/7 Dedicated SRE & Automation Support - $3,750.00
3. Multi-Region Failover Architecture Consulting - $2,000.00

SUBTOTAL: $14,250.00
TAX (0.0% Exempt): $0.00
TOTAL AMOUNT DUE: $14,250.00

Remit payment via ACH / Wire Transfer to Silicon Valley Bank.`,
        extractedJson: JSON.stringify({
          vendorName: "Acme Corp",
          invoiceNumber: "INV-2023-8891",
          invoiceDate: "2023-10-24",
          dueDate: "2023-11-23",
          subtotal: 14250.0,
          taxAmount: 0.0,
          totalAmount: 14250.0,
          currency: "USD",
          taxId: "US-94-3829104",
          lineItems: [
            { description: "Enterprise Cloud Infrastructure Cluster (Oct 2023)", amount: 8500.0 },
            { description: "24/7 Dedicated SRE & Automation Support", amount: 3750.0 },
            { description: "Multi-Region Failover Architecture Consulting", amount: 2000.0 },
          ],
          confidenceScore: 99.4,
        }),
      },
      {
        title: "Globex Industrial Maintenance Invoice",
        documentType: "INVOICE",
        fileType: "png",
        status: "PROCESSED",
        ocrConfidence: 96.1,
        tokensUsed: 1180,
        syncStatus: "SYNCED",
        rawText: `GLOBEX CORPORATION
Global Facility Management Division
New York, NY 10001
Tax ID: US-88-2910492

INVOICE #: INV-2023-7412
Date: 2023-11-02
Due Date: 2023-12-02

Client: Global Operations Hub
Description:
1. Data Center HVAC & Backup Generator Maintenance - $4,800.00
2. Emergency Power Transfer Switch Certification - $1,630.20

Total: $6,430.20 USD`,
        extractedJson: JSON.stringify({
          vendorName: "Globex Corp",
          invoiceNumber: "INV-2023-7412",
          invoiceDate: "2023-11-02",
          dueDate: "2023-12-02",
          subtotal: 6430.2,
          taxAmount: 0.0,
          totalAmount: 6430.2,
          currency: "USD",
          taxId: "US-88-2910492",
          lineItems: [
            { description: "Data Center HVAC & Backup Generator Maintenance", amount: 4800.0 },
            { description: "Emergency Power Transfer Switch Certification", amount: 1630.2 },
          ],
          confidenceScore: 96.1,
        }),
      },
      {
        title: "Apex Logistics Global Freight Receipt",
        documentType: "RECEIPT",
        fileType: "jpg",
        status: "PROCESSED",
        ocrConfidence: 98.7,
        tokensUsed: 980,
        syncStatus: "SYNCED",
        rawText: `APEX LOGISTICS & SUPPLY CHAIN
Express Air Freight Delivery Confirmation
Chicago O'Hare Int'l Cargo Hub

RECEIPT / WAYBILL: INV-2023-9904
Date: 2023-10-28
Shipper: Silicon Hardware Solutions
Consignee: Global Operations Hub

Freight Charges: $2,850.00
Jet Fuel Surcharge (15%): $427.50
Customs Clearance & Handling: $143.00
TOTAL CHARGE: $3,420.50`,
        extractedJson: JSON.stringify({
          vendorName: "Apex Logistics",
          invoiceNumber: "INV-2023-9904",
          invoiceDate: "2023-10-28",
          dueDate: "2023-11-12",
          subtotal: 3277.5,
          taxAmount: 143.0,
          totalAmount: 3420.5,
          currency: "USD",
          taxId: "US-12-9938104",
          lineItems: [
            { description: "Express Air Freight Delivery", amount: 2850.0 },
            { description: "Jet Fuel Surcharge (15%)", amount: 427.5 },
            { description: "Customs Clearance & Handling", amount: 143.0 },
          ],
          confidenceScore: 98.7,
        }),
      },
      {
        title: "TechStart Enterprise Software Lead Intake",
        documentType: "LEAD_INTAKE",
        fileType: "pdf",
        status: "PROCESSED",
        ocrConfidence: 99.8,
        tokensUsed: 820,
        syncStatus: "SYNCED",
        rawText: `INBOUND LEAD SUBMISSION
Source: High-Intent Pricing Calculator
Timestamp: 2023-11-14 09:32:15 UTC

Contact Name: Sarah Jenkins
Role: Chief Technology Officer
Organization: TechStart Inc (500-1000 employees)
Email: sarah@techstart.io
Estimated Annual ARR Budget: $85,000
Pain Point: Manual workflow bottlenecks across finance and sales CRM`,
        extractedJson: JSON.stringify({
          leadName: "Sarah Jenkins",
          jobTitle: "Chief Technology Officer",
          companyName: "TechStart Inc",
          companySize: "500-1000 employees",
          contactEmail: "sarah@techstart.io",
          estimatedDealValue: 85000,
          intentScore: 94,
          confidenceScore: 99.8,
        }),
      },
    ],
  });

  console.log("✅ Seeded Sample Documents");

  // 8. Automation Metrics
  await prisma.automationMetric.createMany({
    data: [
      {
        metricKey: "total_runs",
        label: "Total Pipeline Executions",
        value: "14,230",
        numericValue: 14230,
        changePct: 18.4,
        category: "kpi",
      },
      {
        metricKey: "success_rate",
        label: "Pipeline Success Rate",
        value: "99.4%",
        numericValue: 99.4,
        changePct: 0.6,
        category: "reliability",
      },
      {
        metricKey: "hours_saved",
        label: "Manual Hours Saved",
        value: "420.5 hrs",
        numericValue: 420.5,
        changePct: 24.1,
        category: "efficiency",
      },
      {
        metricKey: "cost_savings",
        label: "Manual Labor Cost Saved",
        value: "$14,700",
        numericValue: 14700,
        changePct: 19.5,
        category: "efficiency",
      },
      {
        metricKey: "avg_latency",
        label: "Average End-to-End Latency",
        value: "1.82s",
        numericValue: 1.82,
        changePct: -12.0,
        category: "performance",
      },
      {
        metricKey: "active_boards",
        label: "Live Synced Monday.com Boards",
        value: "3 Boards",
        numericValue: 3,
        changePct: 100.0,
        category: "integration",
      },
    ],
  });

  console.log("✅ Seeded Automation Metrics");
  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
