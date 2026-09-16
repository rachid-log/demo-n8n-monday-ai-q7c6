"use client";

import React, { useState } from "react";
import { WorkflowExecutionItem } from "@/lib/types";
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ExecutionAuditTrailProps {
  executions: WorkflowExecutionItem[];
}

export function ExecutionAuditTrail({ executions }: ExecutionAuditTrailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(executions[0]?.id || null);
  const [filter, setFilter] = useState<"all" | "SUCCESS" | "FAILED">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = executions.filter((e) => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              Audit &amp; Telemetry Log
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Immutable Execution Audit Trail &amp; Payload Inspector
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Complete cryptographic audit trail for compliance, debugging, and verification of all incoming webhooks and outgoing Monday.com mutations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs flex shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition ${
                filter === "all" ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold shadow-sm" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({executions.length})
            </button>
            <button
              onClick={() => setFilter("SUCCESS")}
              className={`px-3 py-1 rounded-lg transition ${
                filter === "SUCCESS" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter("FAILED")}
              className={`px-3 py-1 rounded-lg transition ${
                filter === "FAILED" ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold shadow-sm" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-800 text-center text-slate-400 dark:text-neutral-500 text-xs">
            No audit logs found for the selected filter.
          </div>
        ) : (
          filtered.map((exec) => {
            const isExpanded = expandedId === exec.id;
            const isSuccess = exec.status === "SUCCESS";

            return (
              <div
                key={exec.id}
                className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 shadow-sm dark:shadow-xl overflow-hidden transition"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exec.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900/40 transition gap-4"
                >
                  <div className="flex items-center gap-3">
                    {isSuccess ? (
                      <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {exec.workflow?.name || "Automated Workflow"}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            isSuccess
                              ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20"
                              : "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20"
                          }`}
                        >
                          {exec.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                        <span>Trigger: {exec.triggeredBy}</span>
                        <span>•</span>
                        <span>Duration: {exec.durationMs}ms</span>
                        <span>•</span>
                        <span>{new Date(exec.startedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 hidden sm:inline font-semibold">
                      ID: {exec.id.slice(0, 10)}...
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Payload Section */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-4 text-xs animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Inbound Payload */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400 font-mono text-[11px] font-semibold">
                          <span>INBOUND PAYLOAD (WEBHOOK):</span>
                          <button
                            onClick={() => handleCopy(`in_${exec.id}`, exec.payloadIn || "{}")}
                            className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
                          >
                            {copiedId === `in_${exec.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === `in_${exec.id}` ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                          {exec.payloadIn || "// No input payload recorded"}
                        </pre>
                      </div>

                      {/* Outbound Payload */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400 font-mono text-[11px] font-semibold">
                          <span>OUTBOUND MUTATION (MONDAY.COM &amp; SLACK):</span>
                          <button
                            onClick={() => handleCopy(`out_${exec.id}`, exec.payloadOut || "{}")}
                            className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
                          >
                            {copiedId === `out_${exec.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === `out_${exec.id}` ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre
                          className={`p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed shadow-inner ${
                            isSuccess ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {exec.payloadOut || exec.errorMsg || "// No outbound payload"}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
