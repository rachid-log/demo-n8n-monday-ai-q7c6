# n8n AI Automation & Monday.com Integration Hub - Product & Prototype Brief

## 1. Client Problem & Context
- **Client Problem**: The client is seeking an expert AI Automation Engineer to design, build, and maintain scalable n8n workflows, implement AI/LLM pipelines (OCR, structured data extraction), integrate Monday.com boards, and build BI dashboards to eliminate manual operations.
- **Target Users**: Operations Managers, BI Analysts, and Automation Engineers who need to monitor, configure, and audit automated pipelines.
- **Why this wins**: This prototype directly demonstrates Rachid's ability to build complex, production-ready automation architectures. It features a live interactive n8n-style canvas, an AI-powered OCR extraction playground, and a real-time BI dashboard syncing with Monday.com, proving technical mastery and business-value focus.

## 2. Core Value Proposition
- **The "Aha!" Feature**: A live, interactive **n8n Workflow Simulator** side-by-side with a **Monday.com Live Board Sync** and an **AI Extraction Playground**. Users can trigger a mock OCR invoice processing run, watch the n8n nodes light up in sequence (Webhook -> OCR -> LLM Extraction -> Monday.com API), and instantly see the extracted structured data populate a simulated Monday.com board and BI dashboard.

## 3. Top 3 Clickable Demo Flows (Must be interactive!)
- **Flow 1 (Interactive n8n Workflow Canvas & Monitor)**: A visual, node-based canvas representing the core pipeline (Webhook -> Document Parser -> OpenAI LLM -> Monday.com Sync -> Slack Notification). Users can click "Run Workflow" or toggle nodes to see live execution paths, execution times, payload inputs/outputs, and error-handling states.
- **Flow 2 (AI Document Processing & Monday.com Sync Playground)**: Users select a sample document (e.g., "Acme Corp Invoice.pdf", "Contract_v2.png", "Receipt_109.jpg") or paste raw text. They click "Extract & Sync". The UI shows a simulated OCR scanning animation, displays the extracted JSON schema (using structured LLM prompting), and instantly appends the record to a live-updating "Monday.com Board View" on the same screen.
- **Flow 3 (BI Automation Dashboard & Error Logs)**: A rich analytics dashboard displaying key performance indicators (KPIs): Total Runs, Success Rate (e.g., 99.4%), Manual Hours Saved, and API Cost. Includes an interactive "Error Log & Retry" panel where users can inspect a failed run (e.g., "Monday.com API Rate Limit Exceeded"), click "Retry with Backoff", and watch it successfully resolve.

## 4. Mock Data & Domain Realism
- **Entities**: Workflows (Invoice Processing, Lead Enrichment, Contract Analyzer), Monday.com Boards (Accounts Payable, CRM Leads, Legal Review), Execution Logs, and Extracted Fields (Vendor, Invoice Date, Total Amount, Tax ID, Line Items).
- **Sample Records**:
  - Invoice: Acme Corp, $14,250.00, dated Oct 24, 2023.
  - Contract: NDA with Globex Corp, signed by John Doe.
  - Lead: Sarah Jenkins, CTO at TechStart, email sarah@techstart.io.
- **Metrics**: 14,230 successful runs, 420 hours saved this month, $1,240 saved in manual labor costs, average execution time of 1.8s.

## 5. Scope Boundaries & Constraints
- **Mocking**: Mock all external APIs (n8n webhook endpoints, OpenAI GPT-4o extraction, Monday.com GraphQL API, Slack webhooks).
- **UI/UX**: Modern dark-mode dashboard with Tailwind CSS, Lucide icons, and smooth CSS transitions for node execution animations.
- **Next.js**: Fully compatible with App Router, static/dynamic rendering, zero external runtime dependencies except standard UI libraries.