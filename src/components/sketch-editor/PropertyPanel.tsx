"use client";

import type { EditorState, EditorAction } from "@/types/canvas";

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

interface PropertyPanelProps {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  isMobile: boolean;
  onDeleteSelected: () => void;
}

export default function PropertyPanel({ state, dispatch, isMobile, onDeleteSelected }: PropertyPanelProps) {
  const showFill = ["rectangle", "ellipse"].includes(state.activeTool) || state.activeTool === "select";
  const showFontSize = state.activeTool === "text";
  const showDelete = state.selectedIds.length > 0;

  const containerClass = isMobile
    ? "flex items-center gap-2 px-3 py-1.5 bg-white border-t border-gray-200 overflow-x-auto"
    : "flex items-center gap-3 px-3 py-1.5 bg-white border-t border-gray-200";

  return (
    <div className={containerClass}>
      {/* Stroke color */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-gray-400 uppercase">Stroke</span>
        <div className="flex items-center gap-0.5">
          {PRESET_COLORS.slice(0, isMobile ? 6 : 10).map((c) => (
            <button
              key={c}
              onClick={() => dispatch({ type: "SET_STROKE_COLOR", color: c })}
              className={`w-5 h-5 rounded-full border transition-transform ${
                state.strokeColor === c ? "border-gray-800 scale-110 ring-1 ring-blue-400" : "border-gray-300"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Stroke color ${c}`}
            />
          ))}
          <input
            type="color"
            value={state.strokeColor}
            onChange={(e) => dispatch({ type: "SET_STROKE_COLOR", color: e.target.value })}
            className="w-5 h-5 cursor-pointer rounded border-0 p-0"
            aria-label="Custom stroke color"
          />
        </div>
      </div>

      {/* Fill color */}
      {showFill && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-gray-400 uppercase">Fill</span>
          <button
            onClick={() => dispatch({ type: "SET_FILL_COLOR", color: state.fillColor ? null : state.strokeColor })}
            className={`w-5 h-5 rounded border text-[8px] flex items-center justify-center ${
              state.fillColor ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
            }`}
            aria-label="Toggle fill"
          >
            {state.fillColor ? "F" : ""}
          </button>
          {state.fillColor && (
            <input
              type="color"
              value={state.fillColor}
              onChange={(e) => dispatch({ type: "SET_FILL_COLOR", color: e.target.value })}
              className="w-5 h-5 cursor-pointer rounded border-0 p-0"
              aria-label="Fill color"
            />
          )}
        </div>
      )}

      {/* Stroke width */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-gray-400 uppercase">Size</span>
        <input
          type="range"
          min={1}
          max={24}
          value={state.strokeWidth}
          onChange={(e) => dispatch({ type: "SET_STROKE_WIDTH", width: Number(e.target.value) })}
          className="w-16 accent-blue-500"
          aria-label="Stroke width"
        />
        <span className="text-[10px] text-gray-500 w-4">{state.strokeWidth}</span>
      </div>

      {/* Font size */}
      {showFontSize && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-gray-400 uppercase">Font</span>
          <input
            type="range"
            min={10}
            max={64}
            value={state.fontSize}
            onChange={(e) => dispatch({ type: "SET_FONT_SIZE", size: Number(e.target.value) })}
            className="w-16 accent-blue-500"
            aria-label="Font size"
          />
          <span className="text-[10px] text-gray-500 w-4">{state.fontSize}</span>
        </div>
      )}

      {/* Delete */}
      {showDelete && (
        <button
          onClick={onDeleteSelected}
          className="ml-auto px-2 py-0.5 rounded text-xs text-red-600 hover:bg-red-50 border border-red-200 shrink-0"
          aria-label="Delete selected"
        >
          Delete
        </button>
      )}
    </div>
  );
}
