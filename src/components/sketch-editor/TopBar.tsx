"use client";

import Link from "next/link";
import type { EditorAction } from "@/types/canvas";
import type { ModeConfig } from "@/types";

interface TopBarProps {
  modeConfig: ModeConfig;
  dispatch: (action: EditorAction) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCapture: () => void;
  onTogglePrompt: () => void;
  showGrid: boolean;
  loading: boolean;
}

export default function TopBar({
  modeConfig,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCapture,
  onTogglePrompt,
  dispatch,
  showGrid,
  loading,
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between h-11 px-3 bg-white border-b border-gray-200 shrink-0 select-none">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-1"
          aria-label="Back to home"
        >
          &larr;
        </Link>
        <span className="text-sm font-semibold text-gray-800 hidden sm:inline">
          {modeConfig.label} Vision
        </span>
      </div>

      {/* Center - actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          onClick={() => dispatch({ type: "TOGGLE_GRID" })}
          className={`p-1.5 rounded text-xs font-medium ${showGrid ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
          aria-label="Toggle grid"
          title="Toggle grid"
        >
          Grid
        </button>

        <button
          onClick={onTogglePrompt}
          className="p-1.5 rounded text-xs font-medium text-gray-500 hover:bg-gray-100"
          aria-label="Edit prompt"
          title="Edit prompt & comment"
        >
          Prompt
        </button>
      </div>

      {/* Right */}
      <button
        onClick={onCapture}
        disabled={loading}
        className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold
                   hover:bg-blue-700 disabled:opacity-50 transition-colors"
        aria-label="Refine with AI"
      >
        {loading ? "Refining..." : "Refine with AI"}
      </button>
    </div>
  );
}
