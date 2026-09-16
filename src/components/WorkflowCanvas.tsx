"use client";

import React, { useState } from "react";
import {
  WorkflowItem,
  WorkflowNode,
} from "@/lib/types";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Code2,
  Webhook,
  ScanLine,
  Sparkles,
  LayoutGrid,
  BellRing,
  Search,
  FolderSync,
  FileCheck,
  Sliders,
  ShieldCheck,
  Check,
  Workflow,
  Copy,
} from "lucide-react";

interface WorkflowCanvasProps {
  workflows: WorkflowItem[];
  selectedWorkflow: WorkflowItem | null;
  onSelectWorkflow: (wf: WorkflowItem) => void;
  onExecutionCompleted: () => void;
}

export function WorkflowCanvas({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  onExecutionCompleted,
}: WorkflowCanvasProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [nodeStates, setNodeStates] = useState<Record<string, { status: "idle" | "running" | "completed" | "failed" | "skipped"; latencyMs: number; message?: string }>>({});
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [simulateError, setSimulateError] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Parse nodes from config
  const nodes: WorkflowNode[] = React.useMemo(() => {
    if (!selectedWorkflow) return [];
    try {
      return JSON.parse(selectedWorkflow.nodesConfig);
    } catch {
      return [];
    }
  }, [selectedWorkflow]);

  // Node icon helper
  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case "Webhook":
        return <Webhook className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case "ScanLine":
        return <ScanLine className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case "LayoutGrid":
        return <LayoutGrid className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      case "BellRing":
        return <BellRing className="w-5 h-5 text-pink-500 dark:text-pink-400" />;
      case "Search":
        return <Search className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case "FolderSync":
        return <FolderSync className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case "FileCheck":
        return <FileCheck className="w-5 h-5 text-teal-500 dark:text-teal-400" />;
      default:
        return <Code2 className="w-5 h-5 text-slate-500 dark:text-neutral-400" />;
    }
  };

  // Run sequential workflow animation and sync with server
  const handleRunWorkflow = async () => {
    if (!selectedWorkflow || isRunning) return;

    setIsRunning(true);
    setRunLogs([]);
    const initialStates: Record<string, { status: "idle" | "running" | "completed" | "failed" | "skipped"; latencyMs: number }> = {};
    nodes.forEach((n) => {
      initialStates[n.id] = { status: "idle", latencyMs: n.latencyMs };
    });
    setNodeStates(initialStates);

    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setRunLogs([...logs]);
    };

    addLog(`Initiating pipeline: "${selectedWorkflow.name}"...`);

    let failureOccurred = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      setActiveStepIndex(i);

      setNodeStates((prev) => ({
        ...prev,
        [node.id]: { status: "running", latencyMs: node.latencyMs },
      }));

      addLog(`[Node ${i + 1}/${nodes.length}] Executing "${node.name}" (${node.service})...`);

      const shouldFailThisNode =
        simulateError &&
        (node.name.toLowerCase().includes("monday") || node.name.toLowerCase().includes("llm"));

      await new Promise((resolve) => setTimeout(resolve, 550));

      if (shouldFailThisNode && !failureOccurred) {
        failureOccurred = true;
        const errDesc = node.name.toLowerCase().includes("monday")
          ? "RateLimitError: Monday.com API GraphQL complexity quota 5,000,000 exceeded. Resets in 4.2s."
          : "SchemaValidationError: Document OCR confidence below safety threshold (90.0%).";

        setNodeStates((prev) => ({
          ...prev,
          [node.id]: {
            status: "failed",
            latencyMs: 140,
            message: errDesc,
          },
        }));

        addLog(`❌ ERROR at "${node.name}": ${errDesc}`);

        for (let j = i + 1; j < nodes.length; j++) {
          setNodeStates((prev) => ({
            ...prev,
            [nodes[j].id]: { status: "skipped", latencyMs: 0, message: "Skipped due to upstream failure" },
          }));
        }
        break;
      } else {
        setNodeStates((prev) => ({
          ...prev,
          [node.id]: {
            status: "completed",
            latencyMs: node.latencyMs,
            message: `Completed successfully in ${node.latencyMs}ms`,
          },
        }));
        addLog(`✓ "${node.name}" finished in ${node.latencyMs}ms`);
      }
    }

    try {
      addLog("Synchronizing execution telemetry to PostgreSQL...");
      const res = await fetch(`/api/workflows/${selectedWorkflow.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulateError,
          errorStep: "Monday.com AP Board Sync",
        }),
      });
      if (res.ok) {
        addLog("Telemetry recorded. Database synchronized.");
        onExecutionCompleted();
      }
    } catch (e) {
      console.error("Failed to commit execution:", e);
    } finally {
      setIsRunning(false);
      setActiveStepIndex(null);
    }
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
        {/* Workflow Preset Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
            Active Pipeline:
          </span>
          {workflows.map((wf) => {
            const isSelected = selectedWorkflow?.id === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => {
                  onSelectWorkflow(wf);
                  setNodeStates({});
                  setSelectedNode(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                    : "bg-slate-100 dark:bg-neutral-950/60 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-800"
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>{wf.name.split("(")[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Execution Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Error Injection Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800 text-xs">
            <span className="text-slate-500 dark:text-neutral-400">Chaos Testing:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-slate-300 dark:border-neutral-700 text-amber-500 focus:ring-0"
              />
              <span className={simulateError ? "text-amber-600 dark:text-amber-400 font-medium" : "text-slate-600 dark:text-neutral-400"}>
                Simulate Monday.com 429 Rate Limit
              </span>
            </label>
          </div>

          <button
            onClick={handleRunWorkflow}
            disabled={isRunning || !selectedWorkflow}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Play className={`w-4 h-4 fill-white ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Simulating Execution..." : "Run Workflow"}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Node Graph Canvas */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 p-6 min-h-[440px] flex flex-col justify-between relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-200">
          {/* Dot Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-25 dark:opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #64748b 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Canvas Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedWorkflow?.name || "Pipeline Flow"}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700 font-semibold">
                  {nodes.length} Nodes
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Click any node card to inspect its payload, authentication headers, and JSON schemas.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Canvas Active</span>
            </div>
          </div>

          {/* Nodes Pipeline */}
          <div className="relative z-10 my-8 flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto py-4">
            {nodes.map((node, index) => {
              const state = nodeStates[node.id] || { status: "idle", latencyMs: node.latencyMs };
              const isSelected = selectedNode?.id === node.id;
              const isStepRunning = activeStepIndex === index;

              return (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`relative cursor-pointer transition-all duration-300 w-full md:w-44 p-4 rounded-xl border flex-shrink-0 flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-white dark:bg-neutral-900 shadow-md ring-2 ring-emerald-500/20"
                        : state.status === "failed"
                        ? "border-rose-400 dark:border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/20 shadow-md shadow-rose-500/10"
                        : state.status === "running"
                        ? "border-amber-400 bg-amber-50/70 dark:bg-neutral-900 shadow-md shadow-amber-500/20 scale-105"
                        : state.status === "completed"
                        ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-neutral-900/90 shadow-sm"
                        : state.status === "skipped"
                        ? "border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/30 opacity-60"
                        : "border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/50 hover:border-slate-300 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 shadow-sm"
                    }`}
                  >
                    {isStepRunning && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-sm">
                          {getNodeIcon(node.icon)}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-500 font-semibold">
                          #{index + 1}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                          {node.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5 truncate">
                          {node.service}
                        </div>
                      </div>
                    </div>

                    {/* Status Footer */}
                    <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-neutral-800/80 flex items-center justify-between text-[11px]">
                      {state.status === "running" ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>Running...</span>
                        </span>
                      ) : state.status === "completed" ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{state.latencyMs}ms</span>
                        </span>
                      ) : state.status === "failed" ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Failed (429)</span>
                        </span>
                      ) : state.status === "skipped" ? (
                        <span className="text-slate-400 dark:text-neutral-500 font-mono text-[10px]">Skipped</span>
                      ) : (
                        <span className="text-slate-500 dark:text-neutral-500 font-mono text-[10px]">
                          ~{node.latencyMs}ms
                        </span>
                      )}

                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-neutral-600" />
                    </div>
                  </div>

                  {/* Connecting Arrow between nodes */}
                  {index < nodes.length - 1 && (
                    <div className="hidden md:flex items-center justify-center flex-shrink-0 text-slate-400 dark:text-neutral-600">
                      <div
                        className={`h-0.5 w-6 transition-colors duration-300 ${
                          state.status === "completed"
                            ? "bg-emerald-500"
                            : isStepRunning
                            ? "bg-amber-400"
                            : "bg-slate-300 dark:bg-neutral-800"
                        }`}
                      />
                      <ChevronRight
                        className={`w-4 h-4 -ml-1 ${
                          state.status === "completed"
                            ? "text-emerald-500"
                            : isStepRunning
                            ? "text-amber-400"
                            : "text-slate-400 dark:text-neutral-700"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Canvas Bottom Live Console */}
          <div className="relative z-10 border-t border-slate-200 dark:border-neutral-800/80 pt-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                <span>Execution Terminal &amp; Logs</span>
              </span>
              <span>{runLogs.length} events logged</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 max-h-24 overflow-y-auto space-y-1 shadow-inner">
              {runLogs.length === 0 ? (
                <div className="text-slate-500 italic">
                  Canvas ready. Click &quot;Run Workflow&quot; to begin event-driven execution cycle.
                </div>
              ) : (
                runLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes("❌")
                        ? "text-rose-400 font-semibold"
                        : log.includes("✓")
                        ? "text-emerald-300"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Node Inspector Drawer */}
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-5 flex flex-col justify-between shadow-sm dark:shadow-xl transition-colors duration-200">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                    {getNodeIcon(selectedNode.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedNode.name}</h3>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                      {selectedNode.service}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-mono font-medium">
                  {selectedNode.type}
                </span>
              </div>

              {/* Node Properties */}
              <div className="space-y-2 text-xs">
                <div className="text-slate-500 dark:text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
                  Node Configuration
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 font-mono text-[11px] space-y-1 text-slate-700 dark:text-neutral-300">
                  {selectedNode.endpoint && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-neutral-500">Endpoint:</span>
                      <span className="text-cyan-700 dark:text-cyan-300 truncate max-w-[170px] font-semibold">
                        {selectedNode.endpoint}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-neutral-500">Expected Latency:</span>
                    <span>{selectedNode.latencyMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-neutral-500">Retry Strategy:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Exponential (3x)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-neutral-500">Timeout Ceiling:</span>
                    <span>30,000ms</span>
                  </div>
                </div>
              </div>

              {/* Input & Output Schema Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
                    Simulated Payload In/Out
                  </span>
                  <button
                    onClick={() =>
                      handleCopyPayload(
                        JSON.stringify(
                          {
                            node: selectedNode.name,
                            input: { source: "webhook", format: "application/json" },
                            output: { status: "OK", mondayItemSynced: true },
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="text-[10px] text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-mono transition"
                  >
                    {copiedPayload ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-200 border border-slate-800 overflow-x-auto max-h-48 leading-relaxed shadow-inner">
{JSON.stringify(
  {
    nodeId: selectedNode.id,
    service: selectedNode.service,
    inputPayload: {
      documentType: "INVOICE",
      mimeType: "application/pdf",
      authHeader: "Bearer eyJhbGciOi...",
    },
    outputPayload: {
      status: "SUCCESS_200",
      targetMondayBoard: "board_ap_01",
      latencyMs: selectedNode.latencyMs,
    },
  },
  null,
  2
)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-neutral-500 space-y-3">
              <Sliders className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300">Inspector Idle</p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1 max-w-[200px]">
                  Select any node in the pipeline canvas to inspect live schema parameters and payloads.
                </p>
              </div>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950/60 border border-slate-200 dark:border-neutral-800 text-[11px] text-slate-600 dark:text-neutral-400 flex items-start gap-2 mt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-neutral-200">Fault Tolerant Architecture:</span>
              <p className="mt-0.5">
                Every node executes under n8n&apos;s dead-letter queue with exponential retry backoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
