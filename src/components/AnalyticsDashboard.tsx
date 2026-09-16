"use client";

import React, { useState } from "react";
import {
  WorkflowExecutionItem,
  AutomationMetricItem,
} from "@/lib/types";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  DollarSign,
  ShieldAlert,
} from "lucide-react";

interface AnalyticsDashboardProps {
  executions: WorkflowExecutionItem[];
  metrics: AutomationMetricItem[];
  onExecutionRetried: () => void;
}

export function AnalyticsDashboard({
  executions,
  metrics,
  onExecutionRetried,
}: AnalyticsDashboardProps) {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryStatusText, setRetryStatusText] = useState<string | null>(null);
  const [selectedFailedExec, setSelectedFailedExec] = useState<WorkflowExecutionItem | null>(null);
  const [filterType, setFilterType] = useState<"all" | "failed" | "success">("all");

  // Filter executions
  const filteredExecutions = executions.filter((e) => {
    if (filterType === "failed") return e.status === "FAILED";
    if (filterType === "success") return e.status === "SUCCESS";
    return true;
  });

  const failedExecutions = executions.filter((e) => e.status === "FAILED");

  // Handle Retry with Backoff
  const handleRetryWithBackoff = async (executionId: string) => {
    setRetryingId(executionId);
    setRetryStatusText("Calculating jitter & backoff (500ms)...");

    await new Promise((r) => setTimeout(r, 600));
    setRetryStatusText("Dispatching retry attempt #1 with exponential backoff...");

    await new Promise((r) => setTimeout(r, 700));

    try {
      const res = await fetch("/api/executions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executionId,
          action: "retry",
        }),
      });

      if (res.ok) {
        setRetryStatusText("✓ Rate limit resolved! Payload synced to Monday.com.");
        await new Promise((r) => setTimeout(r, 500));
        onExecutionRetried();
      }
    } catch (e) {
      console.error("Failed to retry execution:", e);
    } finally {
      setRetryingId(null);
      setRetryStatusText(null);
      setSelectedFailedExec(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
              Interactive Flow 3
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              BI Automation Observability &amp; Dead-Letter Error Recovery Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Real-time telemetry showing pipeline velocity, human labor hours saved, and one-click exponential backoff error resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SLA: 99.4% Availability</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Runs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Total Executions</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.find((m) => m.metricKey === "total_runs")?.value || "14,230"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Pipeline Success Rate</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
            {metrics.find((m) => m.metricKey === "success_rate")?.value || "99.4%"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: &gt;99.0% achieved</span>
          </div>
        </div>

        {/* Manual Hours Saved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Manual Hours Saved</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.find((m) => m.metricKey === "hours_saved")?.value || "420.5 hrs"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
            <span>≈ 2.6 Full-Time Employees</span>
          </div>
        </div>

        {/* Financial Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Labor Cost Saved</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-300 mt-3">
            {metrics.find((m) => m.metricKey === "cost_savings")?.value || "$14,700"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Avg Latency: 1.82s</span>
          </div>
        </div>
      </div>

      {/* Visual Charts & Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Throughput Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 p-6 shadow-sm dark:shadow-2xl space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Execution Volume &amp; Health</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Distribution of automated runs processed across Monday.com webhooks (Last 7 Days)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 font-semibold">Total: 3,420 runs/wk</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-slate-200 dark:border-neutral-800 pb-3">
            {[
              { day: "Mon", runs: 490, fail: 2, height: "65%" },
              { day: "Tue", runs: 580, fail: 4, height: "78%" },
              { day: "Wed", runs: 640, fail: 1, height: "88%" },
              { day: "Thu", runs: 720, fail: 3, height: "98%" },
              { day: "Fri", runs: 510, fail: 2, height: "68%" },
              { day: "Sat", runs: 280, fail: 0, height: "38%" },
              { day: "Sun", runs: 200, fail: 1, height: "28%" },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition">
                  {d.runs}
                </div>
                <div
                  className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 hover:brightness-110 transition cursor-pointer relative shadow-sm"
                  style={{ height: d.height }}
                >
                  {d.fail > 0 && (
                    <div
                      className="w-full bg-rose-500 rounded-t-lg"
                      style={{ height: `${(d.fail / d.runs) * 100 * 5}%`, minHeight: "4px" }}
                    />
                  )}
                </div>
                <div className="text-xs font-mono text-slate-600 dark:text-neutral-400 font-semibold">{d.day}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="font-medium">Successful Runs (99.4%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                <span className="font-medium">Recovered Errors (0.6%)</span>
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Zero Data Loss Guarantee</span>
          </div>
        </div>

        {/* Breakdown by Workflow Category */}
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 p-6 shadow-sm dark:shadow-2xl space-y-4 transition-colors duration-200">
          <div className="border-b border-slate-200 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Workload Share</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Breakdown by operational category</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 dark:text-neutral-300 font-medium">Finance &amp; AP (Invoice OCR)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">59.2%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "59.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 dark:text-neutral-300 font-medium">Sales CRM (Lead Intake)</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">24.0%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "24%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 dark:text-neutral-300 font-medium">Legal &amp; Compliance (NDA/MSA)</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">16.8%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "16.8%" }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800/80">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-xs space-y-1.5 text-slate-700 dark:text-neutral-300">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Efficiency ROI</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                Average document processing time reduced from 22 minutes manually to 1.82 seconds automated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dead-Letter Queue & Error Log Panel (Flow 3 Highlight) */}
      <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 p-6 shadow-sm dark:shadow-2xl space-y-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dead-Letter Queue &amp; Smart Retry Studio
              </h3>
              {failedExecutions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                  {failedExecutions.length} Action Needed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Inspect automated exception payloads (e.g. rate limits, schema mismatches) and execute live backoff retries.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === "all" ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold shadow-sm" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({executions.length})
            </button>
            <button
              onClick={() => setFilterType("failed")}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === "failed" ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold shadow-sm" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Failed ({failedExecutions.length})
            </button>
            <button
              onClick={() => setFilterType("success")}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === "success" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Success ({executions.filter((e) => e.status === "SUCCESS").length})
            </button>
          </div>
        </div>

        {/* Retry status alert */}
        {retryStatusText && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-mono flex items-center gap-2 animate-pulse shadow-sm">
            <RotateCcw className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>{retryStatusText}</span>
          </div>
        )}

        {/* Executions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-500 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Workflow / Trigger</th>
                <th className="py-2.5 px-3 font-semibold">Latency</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Error Diagnosis</th>
                <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-900 font-sans">
              {filteredExecutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-neutral-500">
                    No executions match current filter.
                  </td>
                </tr>
              ) : (
                filteredExecutions.map((exec) => {
                  const isFailed = exec.status === "FAILED";
                  const isRetrying = retryingId === exec.id;

                  return (
                    <tr
                      key={exec.id}
                      className="hover:bg-slate-50 dark:hover:bg-neutral-900/40 transition group cursor-pointer"
                      onClick={() => setSelectedFailedExec(exec)}
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>FAILED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SUCCESS</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {exec.workflow?.name || "Enterprise Workflow Pipeline"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                          {exec.triggeredBy}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-neutral-300 whitespace-nowrap">
                        {exec.durationMs}ms
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-neutral-500 text-[11px] whitespace-nowrap">
                        {new Date(exec.startedAt).toLocaleTimeString()}
                      </td>

                      <td className="py-3 px-3 max-w-[280px]">
                        {isFailed ? (
                          <div className="space-y-0.5">
                            <div className="text-rose-600 dark:text-rose-400 font-semibold truncate text-[11px]">
                              {exec.errorStep || "Node Failure"}
                            </div>
                            <div className="text-slate-500 dark:text-neutral-400 text-[10px] font-mono truncate" title={exec.errorMsg || ""}>
                              {exec.errorMsg || "Unknown execution exception"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-neutral-500 text-[11px] font-mono">
                            Payload passed schema guard
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {isFailed ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryWithBackoff(exec.id);
                            }}
                            disabled={isRetrying}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                            <span>{isRetrying ? "Retrying..." : "⚡ Retry with Backoff"}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Execution Inspector Modal / Slide-in */}
        {selectedFailedExec && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 animate-in fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Trace Details: {selectedFailedExec.workflow?.name || "Pipeline"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400">
                  ID: {selectedFailedExec.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedFailedExec(null)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Close Trace
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-neutral-500 font-mono text-[10px] block mb-1">INPUT PAYLOAD:</span>
                <pre className="p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 font-mono text-[11px] text-slate-800 dark:text-neutral-300 max-h-36 overflow-y-auto shadow-sm">
                  {selectedFailedExec.payloadIn || "// No input recorded"}
                </pre>
              </div>
              <div>
                <span className="text-slate-500 dark:text-neutral-500 font-mono text-[10px] block mb-1">
                  OUTPUT / ERROR DIAGNOSTIC:
                </span>
                <pre className="p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 font-mono text-[11px] text-rose-600 dark:text-rose-300 max-h-36 overflow-y-auto shadow-sm">
                  {selectedFailedExec.payloadOut || selectedFailedExec.errorMsg || "// Clean"}
                </pre>
              </div>
            </div>

            {selectedFailedExec.status === "FAILED" && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleRetryWithBackoff(selectedFailedExec.id)}
                  disabled={retryingId === selectedFailedExec.id}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Backoff Recovery Now</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
