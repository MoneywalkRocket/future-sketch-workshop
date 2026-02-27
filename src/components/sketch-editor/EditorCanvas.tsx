"use client";

import { useRef, useEffect, useCallback } from "react";
import type { SceneObject, EditorState, EditorAction } from "@/types/canvas";
import { renderObject } from "./rendering/scene-renderer";
import { renderGrid } from "./rendering/grid-renderer";
import { renderSelectionHandles } from "./rendering/selection-renderer";
import { getTool } from "./tools/tool-registry";
import type { ToolContext } from "./tools/BaseTool";

interface EditorCanvasProps {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  previewObject: SceneObject | null;
  setPreviewObject: (obj: SceneObject | null) => void;
  pushSnapshot: (objects: SceneObject[]) => void;
  openTextInput: (x: number, y: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function EditorCanvas({
  state,
  dispatch,
  previewObject,
  setPreviewObject,
  pushSnapshot,
  openTextInput,
  canvasWidth,
  canvasHeight,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const isPointerDown = useRef(false);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX / state.zoom - state.panOffset.x / state.zoom,
        y: (clientY - rect.top) * scaleY / state.zoom - state.panOffset.y / state.zoom,
      };
    },
    [state.zoom, state.panOffset]
  );

  const toolCtx: ToolContext = {
    state,
    dispatch,
    getCanvasPoint,
    pushSnapshot,
    setPreviewObject,
    openTextInput,
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function render() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Apply pan and zoom
      ctx.translate(state.panOffset.x, state.panOffset.y);
      ctx.scale(state.zoom, state.zoom);

      // Grid
      if (state.showGrid) {
        renderGrid(ctx, canvasWidth / state.zoom, canvasHeight / state.zoom, 1);
      }

      // Scene objects
      for (const obj of state.objects) {
        renderObject(ctx, obj);
      }

      // Preview (in-progress drawing)
      if (previewObject) {
        renderObject(ctx, previewObject);
      }

      // Selection handles
      if (state.selectedIds.length > 0) {
        renderSelectionHandles(ctx, state.objects, state.selectedIds);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    }

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, previewObject, canvasWidth, canvasHeight]);

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
  }, [canvasWidth, canvasHeight]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isPointerDown.current = true;
      const tool = getTool(state.activeTool);
      tool.onPointerDown(e.nativeEvent, toolCtx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.activeTool, state.strokeColor, state.fillColor, state.strokeWidth, state.fontSize, state.objects, state.selectedIds, state.zoom, state.panOffset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current) return;
      e.preventDefault();
      const tool = getTool(state.activeTool);
      tool.onPointerMove(e.nativeEvent, toolCtx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.activeTool, state.strokeColor, state.fillColor, state.strokeWidth, state.objects, state.selectedIds, state.zoom, state.panOffset]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current) return;
      isPointerDown.current = false;
      const tool = getTool(state.activeTool);
      tool.onPointerUp(e.nativeEvent, toolCtx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.activeTool, state.objects, state.zoom, state.panOffset]
  );

  const activeTool = getTool(state.activeTool);

  return (
    <canvas
      ref={canvasRef}
      className="block touch-none bg-white"
      style={{ cursor: activeTool.cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
