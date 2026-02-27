"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Mode, ModeConfig } from "@/types";
import type { SceneObject, TextObject } from "@/types/canvas";
import { useEditorState } from "./hooks/useEditorState";
import { useHistory } from "./hooks/useHistory";
import EditorCanvas from "./EditorCanvas";
import TopBar from "./TopBar";
import ToolSidebar from "./ToolSidebar";
import PropertyPanel from "./PropertyPanel";
import PromptPanel from "./PromptPanel";
import TextInputOverlay from "./TextInputOverlay";
import { flattenToDataUrl } from "./utils/canvas-export";
import { generateId } from "./utils/id-generator";

interface SketchEditorProps {
  mode: Mode;
  modeConfig: ModeConfig;
  prompt: string;
  comment: string;
  onPromptChange: (v: string) => void;
  onCommentChange: (v: string) => void;
  onCapture: (dataUrl: string) => void;
  loading: boolean;
}

const CANVAS_BASE_W = 1200;
const CANVAS_BASE_H = 800;

export default function SketchEditor({
  modeConfig,
  prompt,
  comment,
  onPromptChange,
  onCommentChange,
  onCapture,
  loading,
}: SketchEditorProps) {
  const [state, dispatch] = useEditorState();
  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory();
  const [previewObject, setPreviewObject] = useState<SceneObject | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: CANVAS_BASE_W, h: CANVAS_BASE_H });
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Responsive layout
  useEffect(() => {
    function update() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (ctrlOrMeta && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
          return;
        }
      }
      if (e.key === "Escape") {
        dispatch({ type: "CLEAR_SELECTION" });
        setTextInput(null);
        return;
      }

      // Tool shortcuts (only single letter, no modifiers)
      if (ctrlOrMeta || e.altKey) return;
      const shortcuts: Record<string, () => void> = {
        v: () => dispatch({ type: "SET_TOOL", tool: "select" }),
        b: () => dispatch({ type: "SET_TOOL", tool: "brush" }),
        r: () => dispatch({ type: "SET_TOOL", tool: "rectangle" }),
        o: () => dispatch({ type: "SET_TOOL", tool: "ellipse" }),
        l: () => dispatch({ type: "SET_TOOL", tool: "line" }),
        a: () => dispatch({ type: "SET_TOOL", tool: "arrow" }),
        t: () => dispatch({ type: "SET_TOOL", tool: "text" }),
        e: () => dispatch({ type: "SET_TOOL", tool: "eraser" }),
        h: () => dispatch({ type: "SET_TOOL", tool: "hand" }),
      };
      const handler = shortcuts[e.key.toLowerCase()];
      if (handler) handler();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedIds]);

  const handleUndo = useCallback(() => {
    const snapshot = undo();
    if (snapshot) dispatch({ type: "SET_OBJECTS", objects: snapshot });
  }, [undo, dispatch]);

  const handleRedo = useCallback(() => {
    const snapshot = redo();
    if (snapshot) dispatch({ type: "SET_OBJECTS", objects: snapshot });
  }, [redo, dispatch]);

  const handleDeleteSelected = useCallback(() => {
    if (state.selectedIds.length === 0) return;
    pushSnapshot(state.objects);
    dispatch({ type: "DELETE_OBJECTS", ids: state.selectedIds });
  }, [state.selectedIds, state.objects, pushSnapshot, dispatch]);

  const handleCapture = useCallback(() => {
    const dataUrl = flattenToDataUrl(state.objects, CANVAS_BASE_W, CANVAS_BASE_H);
    onCapture(dataUrl);
  }, [state.objects, onCapture]);

  const openTextInput = useCallback((x: number, y: number) => {
    setTextInput({ x, y });
  }, []);

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!textInput) return;
      pushSnapshot(state.objects);
      const textObj: TextObject = {
        id: generateId(),
        type: "text",
        x: textInput.x,
        y: textInput.y,
        opacity: 1,
        content: text,
        fontSize: state.fontSize,
        color: state.strokeColor,
      };
      dispatch({ type: "ADD_OBJECT", object: textObj });
      setTextInput(null);
    },
    [textInput, state.objects, state.fontSize, state.strokeColor, pushSnapshot, dispatch]
  );

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) {
        alert("Image too large. Please use images under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 400;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > maxDim || h > maxDim) {
            const scale = maxDim / Math.max(w, h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }

          pushSnapshot(state.objects);
          dispatch({
            type: "ADD_OBJECT",
            object: {
              id: generateId(),
              type: "image",
              x: 50,
              y: 50,
              opacity: 1,
              src: dataUrl,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              displayWidth: w,
              displayHeight: h,
            },
          });
          // Switch to select tool for positioning
          dispatch({ type: "SET_TOOL", tool: "select" });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be uploaded again
      e.target.value = "";
    },
    [state.objects, pushSnapshot, dispatch]
  );

  const canvasRect = canvasContainerRef.current?.querySelector("canvas")?.getBoundingClientRect() ?? null;

  return (
    <div ref={containerRef} className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top bar */}
      <TopBar
        modeConfig={modeConfig}
        dispatch={dispatch}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onCapture={handleCapture}
        onTogglePrompt={() => setPromptOpen((v) => !v)}
        showGrid={state.showGrid}
        loading={loading}
      />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tool sidebar (desktop) */}
        {!isMobile && (
          <ToolSidebar
            activeTool={state.activeTool}
            dispatch={dispatch}
            onImageUpload={handleImageUpload}
            isMobile={false}
          />
        )}

        {/* Canvas */}
        <div ref={canvasContainerRef} className="flex-1 overflow-hidden bg-gray-50">
          {canvasSize.w > 0 && canvasSize.h > 0 && (
            <EditorCanvas
              state={state}
              dispatch={dispatch}
              previewObject={previewObject}
              setPreviewObject={setPreviewObject}
              pushSnapshot={pushSnapshot}
              openTextInput={openTextInput}
              canvasWidth={canvasSize.w}
              canvasHeight={canvasSize.h}
            />
          )}
        </div>
      </div>

      {/* Property panel */}
      <PropertyPanel
        state={state}
        dispatch={dispatch}
        isMobile={isMobile}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Tool bar (mobile) */}
      {isMobile && (
        <ToolSidebar
          activeTool={state.activeTool}
          dispatch={dispatch}
          onImageUpload={handleImageUpload}
          isMobile={true}
        />
      )}

      {/* Prompt panel overlay */}
      <PromptPanel
        isOpen={promptOpen}
        onClose={() => setPromptOpen(false)}
        prompt={prompt}
        comment={comment}
        onPromptChange={onPromptChange}
        onCommentChange={onCommentChange}
      />

      {/* Text input overlay */}
      {textInput && (
        <TextInputOverlay
          x={textInput.x}
          y={textInput.y}
          fontSize={state.fontSize}
          color={state.strokeColor}
          onSubmit={handleTextSubmit}
          onCancel={() => setTextInput(null)}
          canvasRect={canvasRect}
          zoom={state.zoom}
          panOffset={state.panOffset}
        />
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white p-8 shadow-xl text-center max-w-xs">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-gray-700">Refining your sketch...</p>
            <p className="mt-1 text-xs text-gray-400">This may take 10-30 seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}
