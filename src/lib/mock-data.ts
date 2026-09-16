import {
  WorkflowItem,
  DocumentRecordItem,
  MondayBoardItem,
  WorkflowExecutionItem,
} from "./types";

export const FALLBACK_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf_invoice_01",
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
  {
    id: "wf_lead_02",
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
      },
      {
        id: "node_l2",
        name: "Clearbit Firmographic Lookup",
        type: "enrichment",
        service: "Clearbit API",
        icon: "Search",
        status: "idle",
        latencyMs: 420,
      },
      {
        id: "node_l3",
        name: "GPT-4o Intent & Score",
        type: "ai_llm",
        service: "OpenAI GPT-4o",
        icon: "Sparkles",
        status: "idle",
        latencyMs: 680,
      },
      {
        id: "node_l4",
        name: "Monday CRM Deal Ingestion",
        type: "integration",
        service: "Monday.com API v2024",
        icon: "LayoutGrid",
        status: "idle",
        latencyMs: 290,
      },
    ]),
  },
  {
    id: "wf_contract_03",
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
      },
      {
        id: "node_c2",
        name: "Clause Extraction Engine",
        type: "ai_llm",
        service: "Claude 3.5 Sonnet",
        icon: "FileCheck",
        status: "idle",
        latencyMs: 1450,
      },
      {
        id: "node_c3",
        name: "Monday Legal Review Board",
        type: "integration",
        service: "Monday.com API v2024",
        icon: "LayoutGrid",
        status: "idle",
        latencyMs: 340,
      },
    ]),
  },
];

export const FALLBACK_SAMPLE_DOCS: DocumentRecordItem[] = [
  {
    id: "doc_1",
    title: "Acme Corp Enterprise Invoice #8891",
    documentType: "INVOICE",
    fileType: "pdf",
    status: "PROCESSED",
    ocrConfidence: 99.4,
    tokensUsed: 1420,
    syncStatus: "SYNCED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
TOTAL AMOUNT DUE: $14,250.00`,
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
    id: "doc_2",
    title: "Globex Industrial Maintenance Invoice",
    documentType: "INVOICE",
    fileType: "png",
    status: "PROCESSED",
    ocrConfidence: 96.1,
    tokensUsed: 1180,
    syncStatus: "SYNCED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    id: "doc_3",
    title: "Apex Logistics Global Freight Receipt",
    documentType: "RECEIPT",
    fileType: "jpg",
    status: "PROCESSED",
    ocrConfidence: 98.7,
    tokensUsed: 980,
    syncStatus: "SYNCED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
];

export const FALLBACK_MONDAY_BOARDS: MondayBoardItem[] = [
  {
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
    lastSyncAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: "item_1",
        boardId: "board_ap_01",
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "item_2",
        boardId: "board_ap_01",
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "item_3",
        boardId: "board_ap_01",
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

export const FALLBACK_EXECUTIONS: WorkflowExecutionItem[] = [
  {
    id: "exec_1",
    workflowId: "wf_invoice_01",
    workflow: { name: "Enterprise Invoice Processing", slug: "invoice-processing" },
    status: "SUCCESS",
    triggeredBy: "Webhook (Invoice Upload)",
    durationMs: 1855,
    retryCount: 0,
    startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 12 + 1855).toISOString(),
    payloadIn: JSON.stringify({ fileName: "Acme_Invoice_Oct2023.pdf", sizeBytes: 245080 }),
    payloadOut: JSON.stringify({ vendor: "Acme Corp", totalAmount: 14250.0, status: "SYNCED" }),
    nodeSnapshots: JSON.stringify([
      { nodeId: "node_1", status: "completed", durationMs: 82, message: "Webhook payload validated" },
      { nodeId: "node_2", status: "completed", durationMs: 645, message: "OCR completed with 99.4% confidence" },
      { nodeId: "node_3", status: "completed", durationMs: 798, message: "GPT-4o extracted 4 fields & 3 line items" },
      { nodeId: "node_4", status: "completed", durationMs: 215, message: "Created Monday.com item in board_ap_01" },
      { nodeId: "node_5", status: "completed", durationMs: 115, message: "Slack notification posted successfully" },
    ]),
  },
  {
    id: "exec_2",
    workflowId: "wf_invoice_01",
    workflow: { name: "Enterprise Invoice Processing", slug: "invoice-processing" },
    status: "FAILED",
    triggeredBy: "Webhook (Invoice Upload)",
    durationMs: 1420,
    errorStep: "Monday.com AP Board Sync",
    errorMsg: "RateLimitError: Monday.com API GraphQL complexity budget exceeded (reset in 4.2s)",
    retryCount: 0,
    startedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 25 + 1420).toISOString(),
    payloadIn: JSON.stringify({ fileName: "Globex_Invoice_Nov2023.pdf", sizeBytes: 512900 }),
    payloadOut: JSON.stringify({ status: "FAILED", error: "Monday.com API rate limit exceeded" }),
    nodeSnapshots: JSON.stringify([
      { nodeId: "node_1", status: "completed", durationMs: 78, message: "Payload received" },
      { nodeId: "node_2", status: "completed", durationMs: 590, message: "OCR text extracted" },
      { nodeId: "node_3", status: "completed", durationMs: 710, message: "GPT-4o JSON generated" },
      { nodeId: "node_4", status: "failed", durationMs: 42, message: "HTTP 429: Monday.com API rate limited" },
      { nodeId: "node_5", status: "skipped", durationMs: 0, message: "Skipped due to upstream node failure" },
    ]),
  },
];
