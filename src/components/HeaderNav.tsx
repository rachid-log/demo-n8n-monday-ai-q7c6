"use client";

import React from "react";
import {
  Workflow,
  Sparkles,
  BarChart3,
  LayoutGrid,
  History,
  RotateCcw,
  Zap,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";

interface HeaderNavProps {
  activeTab: "canvas" | "playground" | "analytics" | "monday" | "audit";
  setActiveTab: (tab: "canvas" | "playground" | "analytics" | "monday" | "audit") => void;
  onQuickRun: () => void;
  onResetDemo: () => void;
  isQuickRunning: boolean;
  isResetting: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export function HeaderNav({
  activeTab,
  setActiveTab,
  onQuickRun,
  onResetDemo,
  isQuickRunning,
  isResetting,
  theme,
  toggleTheme,
}: HeaderNavProps) {
  const isLight = theme === "light";

  return (
    <header className="border-b border-slate-200 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      {/* Top Banner */}
      <div className="border-b border-slate-200 dark:border-neutral-800/50 px-4 py-1.5 text-[11px] bg-slate-100 dark:bg-neutral-900/40 text-slate-600 dark:text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Traefik Ingress: <code className="text-slate-800 dark:text-neutral-200">*.creabeast.com</code>
          </span>
          <span className="text-slate-300 dark:text-neutral-700">|</span>
          <span className="hidden sm:inline">Engine: <span className="text-slate-800 dark:text-neutral-200">n8n v1.82 Core Cluster</span></span>
          <span className="text-slate-300 dark:text-neutral-700 hidden sm:inline">|</span>
          <span className="hidden md:inline">Integration: <span className="text-amber-600 dark:text-amber-300">Monday.com GraphQL v2024</span></span>
          <span className="text-slate-300 dark:text-neutral-700 hidden md:inline">|</span>
          <span className="hidden lg:inline">AI Pipeline: <span className="text-cyan-600 dark:text-cyan-300">OpenAI GPT-4o Strict Schema</span></span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-semibold">
            Engineered by Rachid
          </span>
          <a
            href="/api/healthz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900 dark:hover:text-neutral-200 flex items-center gap-1 text-[10px] font-mono transition"
          >
            <span>Health Check</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500/20 via-emerald-500/20 to-cyan-500/20 border border-slate-300 dark:border-neutral-700/80 flex items-center justify-center text-lg shadow-sm">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                n8n Automation Hub
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                Monday.com Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 hidden sm:block">
              Event-Driven Workflows • Vision OCR • LLM Structured Extraction • BI Observability
            </p>
          </div>
        </div>

        {/* Global Action CTAs & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button (White Mode / Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-neutral-200"
            title={isLight ? "Switch to Dark Mode" : "Switch to White Mode"}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">White Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={onQuickRun}
            disabled={isQuickRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition active:scale-95"
            title="Execute Master Invoice Processing Pipeline"
          >
            <Zap className={`w-3.5 h-3.5 ${isQuickRunning ? "animate-spin" : "fill-white"}`} />
            <span>{isQuickRunning ? "Running Pipeline..." : "⚡ Run Pipeline"}</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 disabled:opacity-60 text-xs font-medium text-slate-700 dark:text-neutral-300 border border-slate-300 dark:border-neutral-800 transition"
            title="Reset All Mock Data to Fresh Seed State"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-slate-500 dark:text-neutral-400" : ""}`} />
            <span className="hidden md:inline">{isResetting ? "Resetting..." : "Reset Demo"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 border-t border-slate-200 dark:border-neutral-800/60 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "canvas"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/5 font-semibold"
              : "border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:border-slate-300 dark:hover:border-neutral-700"
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>Flow 1: n8n Workflow Canvas &amp; Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab("playground")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "playground"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/5 font-semibold"
              : "border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:border-slate-300 dark:hover:border-neutral-700"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Flow 2: AI Document OCR &amp; Live Sync</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/5 font-semibold"
              : "border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:border-slate-300 dark:hover:border-neutral-700"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Flow 3: BI Analytics &amp; Error Recovery</span>
        </button>

        <button
          onClick={() => setActiveTab("monday")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "monday"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/5 font-semibold"
              : "border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:border-slate-300 dark:hover:border-neutral-700"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Monday.com Board Mirror</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "audit"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/5 font-semibold"
              : "border-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:border-slate-300 dark:hover:border-neutral-700"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log &amp; Payloads</span>
        </button>
      </div>
    </header>
  );
}
