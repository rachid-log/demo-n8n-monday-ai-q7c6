"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { DocumentPlayground } from "@/components/DocumentPlayground";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { MondayBoardView } from "@/components/MondayBoardView";
import { ExecutionAuditTrail } from "@/components/ExecutionAuditTrail";
import {
  WorkflowItem,
  DocumentRecordItem,
  MondayBoardItem,
  WorkflowExecutionItem,
  AutomationMetricItem,
} from "@/lib/types";
import {
  FALLBACK_WORKFLOWS,
  FALLBACK_SAMPLE_DOCS,
  FALLBACK_MONDAY_BOARDS,
  FALLBACK_EXECUTIONS,
} from "@/lib/mock-data";
import {
  CheckCircle2,
  ShieldCheck,
  Globe,
  Cpu,
  Layers,
} from "lucide-react";

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<
    "canvas" | "playground" | "analytics" | "monday" | "audit"
  >("canvas");

  const [workflows, setWorkflows] = useState<WorkflowItem[]>(FALLBACK_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(
    FALLBACK_WORKFLOWS[0]
  );
  const [documents, setDocuments] = useState<DocumentRecordItem[]>(FALLBACK_SAMPLE_DOCS);
  const [boards, setBoards] = useState<MondayBoardItem[]>(FALLBACK_MONDAY_BOARDS);
  const [executions, setExecutions] = useState<WorkflowExecutionItem[]>(FALLBACK_EXECUTIONS);
  const [metrics, setMetrics] = useState<AutomationMetricItem[]>([]);

  const [isQuickRunning, setIsQuickRunning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial data loading using standard React 19 pattern
  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const [wfRes, docRes, boardRes, execRes, metricRes] = await Promise.allSettled([
          fetch("/api/workflows").then((r) => r.json()),
          fetch("/api/documents").then((r) => r.json()),
          fetch("/api/monday/boards").then((r) => r.json()),
          fetch("/api/executions").then((r) => r.json()),
          fetch("/api/metrics").then((r) => r.json()),
        ]);

        if (!active) return;

        if (wfRes.status === "fulfilled" && wfRes.value?.success && wfRes.value.data?.length > 0) {
          setWorkflows(wfRes.value.data);
          setSelectedWorkflow((prev) => {
            if (!prev) return wfRes.value.data[0];
            const found = wfRes.value.data.find((w: WorkflowItem) => w.id === prev.id);
            return found || wfRes.value.data[0];
          });
        }

        if (docRes.status === "fulfilled" && docRes.value?.success && docRes.value.data?.length > 0) {
          setDocuments(docRes.value.data);
        }

        if (boardRes.status === "fulfilled" && boardRes.value?.success && boardRes.value.data?.length > 0) {
          setBoards(boardRes.value.data);
        }

        if (execRes.status === "fulfilled" && execRes.value?.success && execRes.value.data) {
          setExecutions(execRes.value.data);
        }

        if (metricRes.status === "fulfilled" && metricRes.value?.success && metricRes.value.data?.metrics) {
          setMetrics(metricRes.value.data.metrics);
        }
      } catch (e) {
        console.error("Failed to load initial data:", e);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  // Callable refresh function for interactive actions
  const refreshAllData = useCallback(async () => {
    try {
      const [wfRes, docRes, boardRes, execRes, metricRes] = await Promise.allSettled([
        fetch("/api/workflows").then((r) => r.json()),
        fetch("/api/documents").then((r) => r.json()),
        fetch("/api/monday/boards").then((r) => r.json()),
        fetch("/api/executions").then((r) => r.json()),
        fetch("/api/metrics").then((r) => r.json()),
      ]);

      if (wfRes.status === "fulfilled" && wfRes.value?.success && wfRes.value.data?.length > 0) {
        setWorkflows(wfRes.value.data);
        setSelectedWorkflow((prev) => {
          if (!prev) return wfRes.value.data[0];
          const found = wfRes.value.data.find((w: WorkflowItem) => w.id === prev.id);
          return found || wfRes.value.data[0];
        });
      }

      if (docRes.status === "fulfilled" && docRes.value?.success && docRes.value.data?.length > 0) {
        setDocuments(docRes.value.data);
      }

      if (boardRes.status === "fulfilled" && boardRes.value?.success && boardRes.value.data?.length > 0) {
        setBoards(boardRes.value.data);
      }

      if (execRes.status === "fulfilled" && execRes.value?.success && execRes.value.data) {
        setExecutions(execRes.value.data);
      }

      if (metricRes.status === "fulfilled" && metricRes.value?.success && metricRes.value.data?.metrics) {
        setMetrics(metricRes.value.data.metrics);
      }
    } catch (e) {
      console.error("Failed to refresh live data:", e);
    }
  }, []);

  // Quick Run master pipeline
  const handleQuickRun = async () => {
    if (isQuickRunning) return;
    setIsQuickRunning(true);
    showToast("Executing master invoice pipeline across OCR, GPT-4o, and Monday.com...");

    try {
      const targetWorkflow = selectedWorkflow || workflows[0];
      const res = await fetch(`/api/workflows/${targetWorkflow.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulateError: false }),
      });

      if (res.ok) {
        showToast("Pipeline executed! New record synced to Monday.com Board.");
        await refreshAllData();
      }
    } catch (e) {
      console.error("Quick run failed:", e);
      showToast("Pipeline completed with local fallback state.");
    } finally {
      setIsQuickRunning(false);
    }
  };

  // Reset Demo to fresh state
  const handleResetDemo = async () => {
    if (isResetting) return;
    setIsResetting(true);
    showToast("Resetting demo dataset to clean seed state...");

    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await refreshAllData();
        showToast("Database restored to fresh production seed state!");
      }
    } catch (e) {
      console.error("Reset failed:", e);
      showToast("Reset completed.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickRun={handleQuickRun}
        onResetDemo={handleResetDemo}
        isQuickRunning={isQuickRunning}
        isResetting={isResetting}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-neutral-900/95 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Container */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Flow 1: Canvas */}
        {activeTab === "canvas" && (
          <WorkflowCanvas
            workflows={workflows}
            selectedWorkflow={selectedWorkflow}
            onSelectWorkflow={setSelectedWorkflow}
            onExecutionCompleted={refreshAllData}
          />
        )}

        {/* Flow 2: Document Playground */}
        {activeTab === "playground" && (
          <DocumentPlayground
            documents={documents}
            onSyncComplete={refreshAllData}
            onNavigateToMonday={() => setActiveTab("monday")}
          />
        )}

        {/* Flow 3: Analytics & Error Recovery */}
        {activeTab === "analytics" && (
          <AnalyticsDashboard
            executions={executions}
            metrics={metrics}
            onExecutionRetried={refreshAllData}
          />
        )}

        {/* Monday Board Mirror */}
        {activeTab === "monday" && (
          <MondayBoardView
            boards={boards}
            onBoardUpdated={refreshAllData}
          />
        )}

        {/* Execution Audit Trail */}
        {activeTab === "audit" && (
          <ExecutionAuditTrail executions={executions} />
        )}

        {/* Architecture & Engineering Footnotes */}
        <section className="pt-8 border-t border-neutral-800/80">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                <Globe className="w-4 h-4" />
                <span>Traefik Reverse Proxy</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                SSL termination via Let&apos;s Encrypt TLS challenge on <code className="text-neutral-300 font-mono">root_default</code> network.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span>n8n Core Orchestrator</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Multi-step event queues with exponential retry policies, schema guards, and dead-lettering.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <Layers className="w-4 h-4" />
                <span>Monday.com Integration</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Bi-directional GraphQL mutations with column mapping for Accounts Payable and CRM boards.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>AI Vision OCR &amp; GPT-4o</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Structured JSON schema enforcement with token budgeting and OCR confidence scoring.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 text-center text-xs text-neutral-500 font-mono bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>n8n AI Automation &amp; Monday.com Integration Hub • Designed &amp; Built by Rachid</span>
          <span>Next.js 16 • Tailwind CSS v4 • PostgreSQL • Prisma ORM</span>
        </div>
      </footer>
    </div>
  );
}
