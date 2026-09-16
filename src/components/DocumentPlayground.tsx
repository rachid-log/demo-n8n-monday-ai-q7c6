"use client";

import React, { useState } from "react";
import { DocumentRecordItem, MondayItemRecord } from "@/lib/types";
import {
  FileText,
  Sparkles,
  ScanLine,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  Coins,
  ShieldCheck,
  Check,
  Copy,
  DollarSign,
  Calendar,
  Building,
} from "lucide-react";

interface DocumentPlaygroundProps {
  documents: DocumentRecordItem[];
  onSyncComplete: () => void;
  onNavigateToMonday: () => void;
}

export function DocumentPlayground({
  documents,
  onSyncComplete,
  onNavigateToMonday,
}: DocumentPlaygroundProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents[0]?.id || "doc_1"
  );
  const [activeDoc, setActiveDoc] = useState<DocumentRecordItem | null>(
    documents[0] || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(() => {
    if (documents[0]?.extractedJson) {
      try {
        return JSON.parse(documents[0].extractedJson);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [syncedMondayItem, setSyncedMondayItem] = useState<MondayItemRecord | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number>(99.4);
  const [tokensUsed, setTokensUsed] = useState<number>(1420);
  const [activeTab, setActiveTab] = useState<"preview" | "raw" | "json">("preview");
  const [copiedJson, setCopiedJson] = useState(false);

  // Switch document
  const handleSelectDoc = (doc: DocumentRecordItem) => {
    setSelectedDocId(doc.id);
    setActiveDoc(doc);
    try {
      setExtractedData(JSON.parse(doc.extractedJson));
    } catch {
      setExtractedData(null);
    }
    setOcrConfidence(doc.ocrConfidence);
    setTokensUsed(doc.tokensUsed);
    setSyncedMondayItem(null);
  };

  // Run OCR & LLM extraction sequence with laser scanning animation
  const handleExtractAndSync = async () => {
    if (!activeDoc || isProcessing) return;

    setIsProcessing(true);
    setScanProgress(0);
    setSyncedMondayItem(null);

    // Laser scan animation progression
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(scanInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: activeDoc.id,
          rawText: activeDoc.rawText,
          documentType: activeDoc.documentType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearInterval(scanInterval);
        setScanProgress(100);
        setExtractedData(data.data.extractedJson);
        setSyncedMondayItem(data.data.mondayItem);
        setOcrConfidence(data.data.confidence);
        setTokensUsed(data.data.tokensUsed);
        onSyncComplete();
      }
    } catch (error) {
      console.error("Extraction error:", error);
    } finally {
      clearInterval(scanInterval);
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleCopyJson = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Description */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Flow 2
            </span>
            <h2 className="text-base font-bold text-white">
              AI Document OCR &amp; Monday.com Live Sync Playground
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pick a sample document, simulate neural OCR parsing + GPT-4o structured extraction, and watch it populate the live Monday.com board view.
          </p>
        </div>

        <button
          onClick={handleExtractAndSync}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-xl shadow-cyan-950/40 transition active:scale-95 flex-shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
          <span>{isProcessing ? "Extracting & Syncing..." : "⚡ Extract & Sync to Monday.com"}</span>
        </button>
      </div>

      {/* Document Picker Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {documents.map((doc) => {
          const isSelected = selectedDocId === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => handleSelectDoc(doc)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                isSelected
                  ? "bg-neutral-800 border-cyan-500/50 text-white shadow-md shadow-cyan-950/20"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              <FileText className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-neutral-500"}`} />
              <span>{doc.title}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400">
                {doc.fileType}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Dual-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Document Preview & Scanner Animation */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Document Scanner Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  activeTab === "preview"
                    ? "bg-neutral-800 text-cyan-300"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Rendered Preview
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  activeTab === "raw"
                    ? "bg-neutral-800 text-cyan-300"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Raw OCR Text
              </button>
            </div>
          </div>

          {/* Scanner View Area */}
          <div className="relative rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-5 min-h-[360px] flex flex-col justify-between overflow-hidden">
            {/* Laser Scanning Animation Bar */}
            {isProcessing && (
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none transition-all duration-150 z-20"
                style={{ top: `${scanProgress}%` }}
              />
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 space-y-2">
                <div className="p-3 rounded-full bg-neutral-900/90 border border-cyan-500/40 text-cyan-400 animate-pulse">
                  <ScanLine className="w-8 h-8 animate-bounce" />
                </div>
                <div className="text-xs font-mono text-cyan-300 font-semibold">
                  Neural Vision OCR Scanning... ({scanProgress}%)
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Extracting bounding boxes &amp; tabular entities
                </div>
              </div>
            )}

            {/* Document Render Body */}
            {activeTab === "preview" ? (
              <div className="space-y-4 font-sans text-xs text-neutral-300">
                <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeDoc?.title}</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Type: {activeDoc?.documentType} • File: {activeDoc?.fileType.toUpperCase()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    High Fidelity (300 DPI)
                  </span>
                </div>

                <pre className="font-mono text-[11px] leading-relaxed text-neutral-300 whitespace-pre-wrap max-h-60 overflow-y-auto p-3 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  {activeDoc?.rawText}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-neutral-400 font-mono">
                  Direct OCR Output Stream (Tesseract v5.0):
                </div>
                <textarea
                  readOnly
                  value={activeDoc?.rawText}
                  className="w-full h-64 p-3 rounded-lg bg-neutral-950 font-mono text-[11px] text-emerald-300 border border-neutral-800 resize-none focus:outline-none"
                />
              </div>
            )}

            {/* Scanner Metrics Footer */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confidence: {ocrConfidence}%</span>
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Tokens: {tokensUsed}</span>
                </span>
              </div>
              <span className="text-neutral-500">Model: GPT-4o-2024-08</span>
            </div>
          </div>

          {/* Prompt & Config Card */}
          <div className="mt-4 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-[11px]">System: Strict JSON Schema Guard</span>
            <span className="text-emerald-400 font-medium text-[11px]">Auto-Validating Fields</span>
          </div>
        </div>

        {/* Right Panel: Structured Extraction & Live Monday.com Sync */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 flex flex-col justify-between shadow-2xl space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Structured Schema &amp; Monday.com Sync
              </span>
            </div>
            <button
              onClick={handleCopyJson}
              disabled={!extractedData}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition disabled:opacity-40"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
            </button>
          </div>

          {/* Structured Key Entities View */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Extracted Entities
            </div>

            {extractedData ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase font-medium flex items-center gap-1">
                    <Building className="w-3 h-3 text-cyan-400" />
                    <span>Vendor / Org</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1 truncate">
                    {String(extractedData.vendorName || extractedData.companyName || "N/A")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase font-medium flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>Total Amount</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {extractedData.totalAmount !== undefined
                      ? `$${Number(extractedData.totalAmount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}`
                      : extractedData.estimatedDealValue
                      ? `$${Number(extractedData.estimatedDealValue).toLocaleString()}`
                      : "N/A"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>Due / Event Date</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {String(extractedData.dueDate || extractedData.invoiceDate || "2023-11-23")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                No extracted entities yet. Click &quot;Extract &amp; Sync&quot; above.
              </div>
            )}
          </div>

          {/* JSON Schema Code Box */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Structured JSON Schema Output</span>
              <span className="text-[10px] font-mono text-emerald-400">Validated</span>
            </div>
            <pre className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-cyan-300 max-h-44 overflow-y-auto leading-relaxed">
              {extractedData ? JSON.stringify(extractedData, null, 2) : "// Awaiting extraction run..."}
            </pre>
          </div>

          {/* Live Monday.com Sync Card Reflection */}
          <div className="p-4 rounded-xl bg-gradient-to-tr from-neutral-900 via-neutral-900/90 to-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                <span>Live Monday.com Reflection</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Synced via GraphQL</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-semibold">
                  {syncedMondayItem?.name ||
                    (extractedData
                      ? `${extractedData.invoiceNumber || "INV-2023-8891"} - ${
                          extractedData.vendorName || "Acme Corp"
                        }`
                      : "INV-2023-8891 - Acme Corp Enterprise Suite")}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Approved
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-2 border-t border-neutral-800">
                <span>Target: Accounts Payable Hub</span>
                <span>Audit: Auto-Approved (AI &gt; 98%)</span>
              </div>
            </div>

            <button
              onClick={onNavigateToMonday}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold py-1 transition"
            >
              <span>View in Monday.com Board Mirror</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
