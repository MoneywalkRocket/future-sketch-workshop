"use client";

import { useRef, useEffect } from "react";

interface TextInputOverlayProps {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  canvasRect: DOMRect | null;
  zoom: number;
  panOffset: { x: number; y: number };
}

export default function TextInputOverlay({
  x,
  y,
  fontSize,
  color,
  onSubmit,
  onCancel,
  canvasRect,
  zoom,
  panOffset,
}: TextInputOverlayProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (!canvasRect) return null;

  // Convert canvas coordinates to screen coordinates
  const screenX = canvasRect.left + x * zoom + panOffset.x;
  const screenY = canvasRect.top + y * zoom + panOffset.y;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = ref.current?.value.trim();
      if (text) onSubmit(text);
      else onCancel();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    const text = ref.current?.value.trim();
    if (text) onSubmit(text);
    else onCancel();
  };

  return (
    <textarea
      ref={ref}
      className="fixed z-50 border-2 border-blue-400 bg-transparent outline-none resize-none"
      style={{
        left: screenX,
        top: screenY,
        fontSize: fontSize * zoom,
        color,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.3,
        minWidth: 100,
        minHeight: fontSize * zoom * 1.5,
        padding: 2,
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder="Type here..."
    />
  );
}
