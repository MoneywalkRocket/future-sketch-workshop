"use client";

import { useState, useCallback, useRef } from "react";
import type { EditorAction, RefineRegion } from "@/types/canvas";

interface RefineSelectionOverlayProps {
  dispatch: (action: EditorAction) => void;
  refineRegion: RefineRegion | null;
  onRefineRegion: () => void;
  onRefineFullCanvas: () => void;
  loading: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function RefineSelectionOverlay({
  dispatch,
  refineRegion,
  onRefineRegion,
  onRefineFullCanvas,
  loading,
  zoom,
  panOffset,
  canvasWidth,
  canvasHeight,
  containerRef,
}: RefineSelectionOverlayProps) {
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragCurrent = useRef({ x: 0, y: 0 });
  const [dragRect, setDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Convert screen coords to scene coords
  const screenToScene = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      // Scale factor: how the canvas maps to the container
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const sx = (clientX - rect.left) * scaleX / zoom - panOffset.x / zoom;
      const sy = (clientY - rect.top) * scaleY / zoom - panOffset.y / zoom;
      return { x: Math.round(sx), y: Math.round(sy) };
    },
    [containerRef, canvasWidth, canvasHeight, zoom, panOffset]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (refineRegion) return; // Already have a region, don't start new drag
      e.preventDefault();
      e.stopPropagation();
      const pt = screenToScene(e.clientX, e.clientY);
      dragStart.current = pt;
      dragCurrent.current = pt;
      setDragging(true);
      setDragRect(null);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [screenToScene, refineRegion]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const pt = screenToScene(e.clientX, e.clientY);
      dragCurrent.current = pt;
      const x = Math.min(dragStart.current.x, pt.x);
      const y = Math.min(dragStart.current.y, pt.y);
      const w = Math.abs(pt.x - dragStart.current.x);
      const h = Math.abs(pt.y - dragStart.current.y);
      setDragRect({ x, y, w, h });
    },
    [dragging, screenToScene]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);

    const x = Math.min(dragStart.current.x, dragCurrent.current.x);
    const y = Math.min(dragStart.current.y, dragCurrent.current.y);
    const w = Math.abs(dragCurrent.current.x - dragStart.current.x);
    const h = Math.abs(dragCurrent.current.y - dragStart.current.y);

    // Minimum selection size of 30px
    if (w > 30 && h > 30) {
      // Clamp to canvas bounds
      const cx = Math.max(0, x);
      const cy = Math.max(0, y);
      const cw = Math.min(w, canvasWidth - cx);
      const ch = Math.min(h, canvasHeight - cy);
      dispatch({ type: "SET_REFINE_REGION", region: { x: cx, y: cy, w: cw, h: ch } });
    }
    setDragRect(null);
  }, [dragging, canvasWidth, canvasHeight, dispatch]);

  const handleCancel = useCallback(() => {
    dispatch({ type: "EXIT_REFINE_MODE" });
  }, [dispatch]);

  // Convert scene coords to screen percentage for overlay positioning
  const sceneToOverlayStyle = useCallback(
    (region: { x: number; y: number; w: number; h: number }) => {
      return {
        left: `${(region.x / canvasWidth) * 100}%`,
        top: `${(region.y / canvasHeight) * 100}%`,
        width: `${(region.w / canvasWidth) * 100}%`,
        height: `${(region.h / canvasHeight) * 100}%`,
      };
    },
    [canvasWidth, canvasHeight]
  );

  const activeRect = refineRegion || dragRect;

  return (
    <div
      className="absolute inset-0 z-30"
      style={{ cursor: refineRegion ? "default" : "crosshair" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Instructions */}
      {!activeRect && !dragging && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-lg px-4 py-2 shadow-lg pointer-events-none">
          <p className="text-sm text-gray-700 font-medium text-center">
            Drag to select the area to refine
          </p>
        </div>
      )}

      {/* Selection rectangle */}
      {activeRect && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
          style={sceneToOverlayStyle(activeRect)}
        >
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}

      {/* Action buttons (only when region is confirmed) */}
      {refineRegion && (
        <div
          className="absolute pointer-events-auto flex items-center gap-2"
          style={{
            left: `${((refineRegion.x + refineRegion.w / 2) / canvasWidth) * 100}%`,
            top: `${((refineRegion.y + refineRegion.h) / canvasHeight) * 100 + 1.5}%`,
            transform: "translateX(-50%)",
          }}
        >
          <button
            onClick={onRefineRegion}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold
                       hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg whitespace-nowrap"
          >
            {loading ? "Refining..." : "Refine This Area"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-white text-gray-600 text-xs font-medium
                       hover:bg-gray-50 border border-gray-200 transition-colors shadow-lg whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom bar with full canvas option */}
      {!refineRegion && !dragging && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onRefineFullCanvas}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 text-xs font-semibold
                       hover:bg-gray-50 border border-gray-200 transition-colors shadow-lg whitespace-nowrap"
          >
            {loading ? "Refining..." : "Refine Full Canvas"}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-white text-gray-500 text-xs font-medium
                       hover:bg-gray-50 border border-gray-200 transition-colors shadow-lg whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
