# Technical Blueprint: n8n AI Automation & Monday.com Integration Hub

## 1. Executive Summary & Problem Framing
- **Client Problem**: Operational friction caused by manual invoice processing, lead qualification, and contract reviews. Disconnected systems (email, file storage, Monday.com, Slack) require human intervention, resulting in high latency, human error, and lack of real-time visibility.
- **Solution**: A production-grade prototype demonstrating an automated pipeline hub combining:
  1. **Visual n8n Workflow Engine Simulator**: Node-by-node canvas execution with payload inspection and fault tolerance.
  2. **AI Document Processing & Monday.com Sync Playground**: Multi-modal OCR/LLM document parsing with structured JSON schema output and real-time Monday.com item creation.
  3. **BI Automation Analytics & Error Recovery**: Comprehensive KPI dashboard with automated dead-letter queues and one-click backoff retries.
  4. **Monday.com Enterprise Board Mirror**: Interactive replica of live synced Monday.com boards (Accounts Payable, CRM Leads, Legal Review).

---

## 2. Architecture & Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19 and Server Actions / API Routes.
- **Database & ORM**: PostgreSQL via Prisma ORM (`@prisma/client` v6.19).
- **Styling**: Tailwind CSS v4 with custom dark-mode operations center aesthetics, Lucide React icons, and keyframe animations.
- **Deployment & Ingress**: Traefik v2+ reverse proxy on `root_default` network with automatic Let's Encrypt TLS challenge.

---

## 3. Database Schema (`prisma/schema.prisma`)

### Models:
1. **`Workflow`**:
   - `id`: String (cuid)
   - `name`: String (e.g., "Enterprise Invoice Intake & AP Sync")
   - `slug`: String (@unique)
   - `category`: String ("Finance / AP", "Sales / CRM", "Legal / Compliance")
   - `triggerType`: String ("Webhook", "Schedule", "Event")
   - `status`: String ("active", "paused", "draft")
   - `totalRuns`: Int
   - `successRate`: Float
   - `avgDurationMs`: Int
   - `nodesConfig`: String (JSON representation of workflow canvas nodes and edges)
   - `executions`: Relation to `WorkflowExecution`
   - `createdAt`, `updatedAt`: DateTime

2. **`WorkflowExecution`**:
   - `id`: String (cuid)
   - `workflowId`: String (FK -> Workflow)
   - `status`: String ("SUCCESS", "FAILED", "RUNNING", "RETRYING")
   - `triggeredBy`: String ("Webhook (Invoice Upload)", "Monday.com Automation", "Manual Run")
   - `durationMs`: Int
   - `errorStep`: String?
   - `errorMsg`: String?
   - `retryCount`: Int (default 0)
   - `payloadIn`: String (JSON)
   - `payloadOut`: String (JSON)
   - `nodeSnapshots`: String (JSON of node states during execution)
   - `startedAt`: DateTime
   - `completedAt`: DateTime?

3. **`DocumentRecord`**:
   - `id`: String (cuid)
   - `title`: String (e.g., "Acme Corp Enterprise Invoice #8891")
   - `documentType`: String ("INVOICE", "CONTRACT", "RECEIPT", "LEAD_INTAKE")
   - `fileType`: String ("pdf", "png", "jpg")
   - `status`: String ("PROCESSED", "PROCESSING", "FAILED", "PENDING_SYNC")
   - `rawText`: String
   - `extractedJson`: String (Structured schema: vendor, total, tax, line items, confidence)
   - `ocrConfidence`: Float
   - `tokensUsed`: Int
   - `syncStatus`: String ("SYNCED", "PENDING", "FAILED")
   - `mondayItemId`: String?
   - `mondayBoardId`: String?
   - `createdAt`, `updatedAt`: DateTime

4. **`MondayBoard`**:
   - `id`: String (cuid)
   - `name`: String ("Accounts Payable", "CRM Inbound Leads", "Legal Review")
   - `boardType`: String ("ACCOUNTS_PAYABLE", "CRM_LEADS", "LEGAL_REVIEW")
   - `workspaceName`: String ("Global Operations")
   - `columnsConfig`: String (JSON column schemas: title, type, width, colors)
   - `items`: Relation to `MondayItem`
   - `lastSyncAt`: DateTime
   - `createdAt`, `updatedAt`: DateTime

5. **`MondayItem`**:
   - `id`: String (cuid)
   - `boardId`: String (FK -> MondayBoard)
   - `name`: String
   - `status`: String ("Approved", "Needs Review", "Pending OCR", "Synced", "Paid", "Rejected")
   - `priority`: String ("Critical", "High", "Medium", "Low")
   - `columnValues`: String (JSON key-value mapping matching board schema)
   - `syncSource`: String ("n8n_webhook", "ocr_pipeline", "direct")
   - `createdAt`, `updatedAt`: DateTime

6. **`AutomationMetric`**:
   - `id`: String (cuid)
   - `metricKey`: String (@unique)
   - `label`: String
   - `value`: String
   - `numericValue`: Float
   - `changePct`: Float
   - `category`: String ("kpi", "efficiency", "reliability")
   - `updatedAt`: DateTime

---

## 4. Realistic Domain Mock Datasets
- **Sample Invoices & Receipts**:
  - Acme Corp Enterprise Services ($14,250.00, Net 30, Oct 24, 2023, Line items: Cloud Hosting, SLA Guarantee, Migration Services)
  - Globex Industrial Maintenance ($6,430.20, Due Nov 15, 2023)
  - Apex Logistics Global Freight ($3,420.50, Fuel Surcharge, Handling Fee)
  - TechStart Software SaaS Agreement ($48,000.00/yr, signed by Sarah Jenkins)
- **Monday.com Items**:
  - 12+ pre-populated items across Accounts Payable, CRM Leads, and Legal Review boards with colored status tags, assignee avatars, dates, and amounts.
- **Execution Logs**:
  - 10+ recent executions including 2 failed executions with realistic error diagnostics:
    - `RateLimitError: Monday.com API GraphQL complexity budget exceeded (reset in 4.2s)`
    - `SchemaValidationError: Document OCR confidence 62.4% below safety threshold (90%)`
- **Global Metrics**:
  - 14,230 successful runs
  - 99.4% success rate
  - 420.5 manual hours saved
  - $14,700 labor cost reduction
  - 1.82s average workflow latency

---

## 5. Page Routes & API Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root dark-mode layout with fonts and metadata
│   ├── page.tsx                # Master Command Center with dynamic tab switching
│   ├── api/
│   │   ├── healthz/route.ts    # Liveness & database connectivity endpoint
│   │   ├── workflows/route.ts  # Workflow listing & trigger execution
│   │   ├── workflows/[id]/run/route.ts # Execute step-by-step workflow simulation
│   │   ├── documents/route.ts  # Document intake & OCR simulation
│   │   ├── documents/extract/route.ts # LLM structured extraction & Monday.com sync
│   │   ├── monday/boards/route.ts # Monday.com board retrieval & item updates
│   │   ├── executions/route.ts # Execution history and error retry handler
│   │   └── reset/route.ts      # One-click demo state reset & re-seed
├── components/
│   ├── WorkflowCanvas.tsx      # Interactive n8n visual canvas with glowing nodes & drawer
│   ├── DocumentPlayground.tsx  # Document selector, OCR scanner animation & JSON extractor
│   ├── MondayBoardView.tsx     # Pixel-perfect Monday.com board mirror with status dropdowns
│   ├── AnalyticsDashboard.tsx  # High-impact BI metrics, charts, and Error Recovery Studio
│   ├── ExecutionDrawer.tsx     # Payload in/out inspector & execution step timeline
│   └── HeaderNav.tsx           # Status indicators (Traefik, n8n, Monday.com, OpenAI)
└── lib/
    ├── db.ts                   # Prisma client singleton
    ├── mock-data.ts            # Realistic fallback data & document templates
    └── types.ts                # TypeScript interfaces for workflows, nodes, documents
```

---

## 6. Implementation & Verification Plan
1. **Prisma Update**: Update `prisma/schema.prisma` with the 6 models.
2. **Schema Push**: Run `npx prisma db push` to synchronize Postgres.
3. **Database Seeding**: Implement `prisma/seed.ts` with comprehensive domain records.
4. **API Endpoints**: Build robust API handlers supporting both real database queries and live state updates.
5. **Interactive UI Components**:
   - Implement live node-by-node execution animation with configurable delays.
   - Implement OCR extraction scanning line with JSON inspector.
   - Implement real-time Monday.com board appending and inline cell updates.
   - Implement Error Retry button with animated backoff countdown.
6. **Verification**: Run `npm run build` and test all API routes and interactive flows to guarantee zero lint/build errors and 100% production readiness.
