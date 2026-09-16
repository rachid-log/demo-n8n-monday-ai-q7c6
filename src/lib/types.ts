export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  service: string;
  icon: string;
  endpoint?: string;
  status: "idle" | "running" | "completed" | "failed" | "skipped";
  latencyMs: number;
  config?: Record<string, unknown>;
}

export interface WorkflowItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  triggerType: string;
  status: string;
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  nodesConfig: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NodeSnapshot {
  nodeId: string;
  status: "completed" | "failed" | "skipped" | "running";
  durationMs: number;
  message: string;
}

export interface WorkflowExecutionItem {
  id: string;
  workflowId: string;
  workflow?: {
    name: string;
    slug: string;
  };
  status: "SUCCESS" | "FAILED" | "RUNNING" | "RETRYING";
  triggeredBy: string;
  durationMs: number;
  errorStep?: string | null;
  errorMsg?: string | null;
  retryCount: number;
  payloadIn?: string | null;
  payloadOut?: string | null;
  nodeSnapshots?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface ExtractedInvoiceSchema {
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  taxId?: string;
  lineItems?: Array<{ description: string; amount: number }>;
  confidenceScore: number;
}

export interface DocumentRecordItem {
  id: string;
  title: string;
  documentType: string;
  fileType: string;
  status: string;
  rawText: string;
  extractedJson: string;
  ocrConfidence: number;
  tokensUsed: number;
  syncStatus: string;
  mondayItemId?: string | null;
  mondayBoardId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MondayColumnConfig {
  key: string;
  title: string;
  type: "text" | "badge" | "status" | "currency" | "date" | "score" | "priority" | "email";
  width: string;
}

export interface MondayItemRecord {
  id: string;
  boardId: string;
  name: string;
  status: string;
  priority: string;
  columnValues: string;
  syncSource: string;
  createdAt: string;
  updatedAt: string;
}

export interface MondayBoardItem {
  id: string;
  name: string;
  boardType: string;
  workspaceName: string;
  columnsConfig: string;
  items: MondayItemRecord[];
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationMetricItem {
  id: string;
  metricKey: string;
  label: string;
  value: string;
  numericValue: number;
  changePct: number;
  category: string;
  updatedAt?: string;
}
