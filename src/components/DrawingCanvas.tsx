"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const PRESET_COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

interface DrawingCanvasProps {
  onCapture: (dataUrl: string) => void;
}

interface HistoryEntry {
  data: ImageData;
}

export default function DrawingCanvas({ onCapture }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [color, setColor] = useState("#000000");
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = Math.min(width * 1.2, 600);
      return { width, height };
    }
    return { width: 400, height: 480 };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = getCanvasSize();
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Save initial state
    const imageData = ctx.getImageData(0, 0, width, height);
    setHistory([{ data: imageData }]);
    setHistoryIndex(0);
  }, [getCanvasSize]);

  // Draw grid overlay
  useEffect(() => {
    if (!showGrid) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Grid is drawn as CSS background, no need to paint on canvas
  }, [showGrid]);

  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getPosition(e);
      lastPos.current = pos;
      setIsDrawing(true);

      // Draw a dot for single taps
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [getPosition, color, brushSize]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !lastPos.current) return;
      e.preventDefault();

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const pos = getPosition(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPos.current = pos;
    },
    [isDrawing, getPosition, color, brushSize]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;

    // Save to history
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ data: imageData });
      // Keep max 50 history entries
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [isDrawing, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(history[newIndex].data, 0, 0);
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(history[newIndex].data, 0, 0);
  }, [historyIndex, history]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ data: imageData });
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const captureCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onCapture(dataUrl);
  }, [onCapture]);

  const gridBg = showGrid
    ? {
        backgroundImage:
          "linear-gradient(rgba(200,200,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,200,0.3) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }
    : {};

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-gray-200">
        {/* Color presets */}
        <div className="flex items-center gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition-transform ${
                color === c ? "border-gray-800 scale-110" : "border-gray-300"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border-0"
            aria-label="Custom color picker"
          />
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <label htmlFor="brush-size" className="text-xs text-gray-500">
            Size
          </label>
          <input
            id="brush-size"
            type="range"
            min={2}
            max={24}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-blue-500"
          />
          <span className="w-6 text-xs text-gray-500">{brushSize}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="rounded-md bg-white px-3 py-1.5 text-sm border border-gray-200 shadow-sm
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Undo"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="rounded-md bg-white px-3 py-1.5 text-sm border border-gray-200 shadow-sm
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Redo"
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          className="rounded-md bg-white px-3 py-1.5 text-sm border border-gray-200 shadow-sm
                     hover:bg-gray-50 text-red-600"
          aria-label="Clear canvas"
        >
          Clear
        </button>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="accent-blue-500"
          />
          Grid
        </label>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-gray-300 bg-white cursor-crosshair touch-none"
          style={gridBg}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>

      {/* Capture button */}
      <button
        onClick={captureCanvas}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white
                   shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:ring-offset-2 transition-colors"
        aria-label="Refine drawing with AI"
      >
        Refine with AI
      </button>
    </div>
  );
}
