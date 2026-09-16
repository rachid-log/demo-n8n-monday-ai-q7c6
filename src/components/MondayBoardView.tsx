"use client";

import React, { useState } from "react";
import { MondayBoardItem, MondayItemRecord } from "@/lib/types";
import {
  LayoutGrid,
  Search,
  Plus,
  MoreHorizontal,
} from "lucide-react";

interface MondayBoardViewProps {
  boards: MondayBoardItem[];
  onBoardUpdated: () => void;
}

export function MondayBoardView({ boards, onBoardUpdated }: MondayBoardViewProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    boards[0]?.id || "board_ap_01"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemVendor, setNewItemVendor] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const activeBoard = boards.find((b) => b.id === selectedBoardId) || boards[0];

  // Status color pill mapper matching Monday.com design
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
      case "Paid":
      case "Executed":
      case "Qualified":
        return "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold";
      case "Needs Review":
      case "Under Review":
      case "Demo Scheduled":
        return "bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold";
      case "Pending OCR":
      case "Contacted":
        return "bg-cyan-600 hover:bg-cyan-700 text-white font-semibold";
      case "Synced":
        return "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold";
      case "Critical":
      case "High":
      case "Rejected":
        return "bg-rose-500 hover:bg-rose-600 text-white font-semibold";
      default:
        return "bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400 dark:hover:bg-neutral-600 text-slate-800 dark:text-neutral-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold";
      case "High":
        return "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold";
      case "Medium":
        return "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-semibold";
      case "Low":
      default:
        return "bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-800";
    }
  };

  // Filter items
  const items = (activeBoard?.items || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.columnValues.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Inline Status update
  const handleUpdateStatus = async (item: MondayItemRecord, newStatus: string) => {
    try {
      const res = await fetch("/api/monday/boards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        onBoardUpdated();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setEditingItemId(null);
    }
  };

  // Create new item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeBoard) return;

    setIsCreating(true);
    try {
      const colValues =
        activeBoard.boardType === "ACCOUNTS_PAYABLE"
          ? {
              vendor: newItemVendor || "Acme Corp",
              amount: parseFloat(newItemAmount) || 12500,
              invoiceDate: new Date().toISOString().split("T")[0],
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
              confidence: "99.2%",
            }
          : {
              company: newItemVendor || "Prospect Inc",
              estValue: parseFloat(newItemAmount) || 50000,
              leadScore: "92 / 100",
              email: "contact@prospect.io",
            };

      const res = await fetch("/api/monday/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: activeBoard.id,
          name: newItemName,
          status: "Needs Review",
          priority: "High",
          columnValues: colValues,
        }),
      });

      if (res.ok) {
        setNewItemName("");
        setNewItemVendor("");
        setNewItemAmount("");
        setShowAddModal(false);
        onBoardUpdated();
      }
    } catch (e) {
      console.error("Failed to add item:", e);
    } finally {
      setIsCreating(false);
    }
  };

  const formattedSyncTime = activeBoard?.lastSyncAt
    ? new Date(activeBoard.lastSyncAt).toLocaleTimeString()
    : "Live Connected";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Enterprise Integration Mirror
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monday.com Live Board Sync &amp; Mutation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Bi-directional synchronization layer. Records processed by the n8n OCR pipeline instantly append here with full column schema mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Board Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          {boards.map((b) => {
            const isSelected = b.id === activeBoard?.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBoardId(b.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                  isSelected
                    ? "bg-white dark:bg-neutral-800 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm"
                    : "bg-slate-100 dark:bg-neutral-950/60 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-neutral-700"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{b.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-neutral-900 text-slate-700 dark:text-neutral-400 font-semibold">
                  {b.items?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search board items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition w-48 sm:w-60 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-neutral-300 focus:outline-none transition shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Paid">Paid</option>
            <option value="Synced">Synced</option>
            <option value="Pending OCR">Pending OCR</option>
          </select>
        </div>
      </div>

      {/* Monday.com Grid Table Mirror */}
      <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/90 shadow-sm dark:shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Table Banner Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white tracking-wide">
              {activeBoard?.name || "Monday Board"}
            </span>
            <span className="text-slate-500 dark:text-neutral-500 font-mono text-[11px]">
              (Workspace: {activeBoard?.workspaceName})
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
            Last Synced: {formattedSyncTime}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-100/70 dark:bg-neutral-900/40 text-slate-600 dark:text-neutral-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4 font-semibold">Item / Entity</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold">Priority</th>
                <th className="py-3 px-3 font-semibold">Vendor / Party</th>
                <th className="py-3 px-3 font-semibold">Amount / Value</th>
                <th className="py-3 px-3 font-semibold">Due / Term</th>
                <th className="py-3 px-3 font-semibold">Source</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-900 font-sans">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-neutral-500">
                    No items in this view. Use the &quot;Add Item&quot; button or execute an OCR sync in Flow 2.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  let colVals: Record<string, unknown> = {};
                  try {
                    colVals = JSON.parse(item.columnValues);
                  } catch {
                    colVals = {};
                  }

                  const isEditing = editingItemId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-900/50 transition group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-[260px] truncate">
                        {item.name}
                      </td>

                      {/* Clickable Status Pill (Monday.com style) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            {["Approved", "Needs Review", "Paid"].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateStatus(item, st)}
                                className={`px-2 py-1 rounded text-[10px] ${getStatusBadge(
                                  st
                                )}`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingItemId(item.id)}
                            title="Click to update status"
                            className={`px-3 py-1 rounded-md text-[11px] transition shadow-sm ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getPriorityBadge(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-neutral-300 whitespace-nowrap">
                        {String(colVals.vendor || colVals.company || colVals.party || "—")}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {colVals.amount !== undefined
                          ? `$${Number(colVals.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}`
                          : colVals.estValue !== undefined
                          ? `$${Number(colVals.estValue).toLocaleString()}`
                          : "—"}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">
                        {String(colVals.dueDate || colVals.term || colVals.invoiceDate || "—")}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-mono text-slate-600 dark:text-neutral-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                          {item.syncSource}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingItemId(isEditing ? null : item.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-300 transition"
                          title="Toggle Quick Edit"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Append Item to {activeBoard?.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:text-neutral-500 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2024-9982 - Data Cloud Cluster"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Vendor / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Omnicorp Global"
                  value={newItemVendor}
                  onChange={(e) => setNewItemVendor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Amount / Est. Value (USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 14250.00"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newItemName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm"
                >
                  {isCreating ? "Saving..." : "Save to Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
