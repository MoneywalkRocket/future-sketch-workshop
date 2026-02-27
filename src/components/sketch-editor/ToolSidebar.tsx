"use client";

import type { ToolType, EditorAction } from "@/types/canvas";

interface ToolSidebarProps {
  activeTool: ToolType;
  dispatch: (action: EditorAction) => void;
  onImageUpload: () => void;
  onAIGenerate: () => void;
  isMobile: boolean;
}

interface ToolDef {
  type: ToolType;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const tools: ToolDef[] = [
  {
    type: "select",
    label: "Select",
    shortcut: "V",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      </svg>
    ),
  },
  {
    type: "brush",
    label: "Brush",
    shortcut: "B",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      </svg>
    ),
  },
  {
    type: "rectangle",
    label: "Rectangle",
    shortcut: "R",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    type: "ellipse",
    label: "Ellipse",
    shortcut: "O",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="10" ry="8" />
      </svg>
    ),
  },
  {
    type: "line",
    label: "Line",
    shortcut: "L",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="5" y1="19" x2="19" y2="5" />
      </svg>
    ),
  },
  {
    type: "arrow",
    label: "Arrow",
    shortcut: "A",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="19" x2="19" y2="5" />
        <polyline points="10 5 19 5 19 14" />
      </svg>
    ),
  },
  {
    type: "text",
    label: "Text",
    shortcut: "T",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="8" y1="20" x2="16" y2="20" />
      </svg>
    ),
  },
  {
    type: "eraser",
    label: "Eraser",
    shortcut: "E",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20H7L3 16l9-9 8 8-4 4" />
        <path d="M6.5 13.5l5-5" />
      </svg>
    ),
  },
  {
    type: "hand",
    label: "Hand",
    shortcut: "H",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-4 0v6" />
        <path d="M14 10V4a2 2 0 0 0-4 0v7" />
        <path d="M10 10.5V5a2 2 0 0 0-4 0v9" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.7 16.6a2 2 0 0 1 3-2.6l.6.7" />
      </svg>
    ),
  },
];

export default function ToolSidebar({ activeTool, dispatch, onImageUpload, onAIGenerate, isMobile }: ToolSidebarProps) {
  const containerClass = isMobile
    ? "flex items-center gap-0.5 px-2 py-1 bg-white border-t border-gray-200 overflow-x-auto"
    : "flex flex-col items-center gap-0.5 py-2 px-1 bg-white border-r border-gray-200 w-11";

  return (
    <div className={containerClass}>
      {tools.map((t) => (
        <button
          key={t.type}
          onClick={() => dispatch({ type: "SET_TOOL", tool: t.type })}
          className={`p-1.5 rounded transition-colors shrink-0 ${
            activeTool === t.type
              ? "bg-blue-100 text-blue-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
          aria-label={`${t.label} (${t.shortcut})`}
          title={`${t.label} (${t.shortcut})`}
        >
          {t.icon}
        </button>
      ))}

      <div className={isMobile ? "w-px h-5 bg-gray-200 mx-0.5 shrink-0" : "w-5 h-px bg-gray-200 my-0.5"} />

      {/* Image upload */}
      <button
        onClick={onImageUpload}
        className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
        aria-label="Upload image"
        title="Upload image"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>

      <div className={isMobile ? "w-px h-5 bg-gray-200 mx-0.5 shrink-0" : "w-5 h-px bg-gray-200 my-0.5"} />

      {/* AI Generate */}
      <button
        onClick={onAIGenerate}
        className="p-1.5 rounded text-violet-500 hover:bg-violet-50 hover:text-violet-700 transition-colors shrink-0"
        aria-label="AI Generate asset"
        title="AI Generate asset"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
        </svg>
      </button>
    </div>
  );
}
