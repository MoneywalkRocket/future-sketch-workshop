"use client";

import { useState, useCallback } from "react";
import type { SceneObject, EditorAction } from "@/types/canvas";
import { generateId } from "./utils/id-generator";
import { removeWhiteBackground } from "./utils/remove-bg";

interface AssetGeneratorModalProps {
  onClose: () => void;
  dispatch: (action: EditorAction) => void;
  pushSnapshot: (objects: SceneObject[]) => void;
  objects: SceneObject[];
  canvasWidth: number;
  canvasHeight: number;
}

export default function AssetGeneratorModal({
  onClose,
  dispatch,
  pushSnapshot,
  objects,
  canvasWidth,
  canvasHeight,
}: AssetGeneratorModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate image");
        return;
      }

      const processed = await removeWhiteBackground(data.image);
      setPreviewUrl(processed);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const handlePlace = useCallback(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      let dw = img.naturalWidth;
      let dh = img.naturalHeight;
      const maxDim = 400;
      if (dw > maxDim || dh > maxDim) {
        const scale = maxDim / Math.max(dw, dh);
        dw = Math.round(dw * scale);
        dh = Math.round(dh * scale);
      }

      pushSnapshot(objects);
      dispatch({
        type: "ADD_OBJECT",
        object: {
          id: generateId(),
          type: "image",
          x: (canvasWidth - dw) / 2,
          y: (canvasHeight - dh) / 2,
          opacity: 1,
          src: previewUrl,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: dw,
          displayHeight: dh,
        },
      });
      dispatch({ type: "SET_TOOL", tool: "select" });
      onClose();
    };
    img.src = previewUrl;
  }, [previewUrl, objects, pushSnapshot, dispatch, onClose, canvasWidth, canvasHeight]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">AI Asset Generator</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Prompt input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Describe the asset to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A modern chat icon with speech bubble, blue gradient"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !loading) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <div className="text-right text-xs text-gray-400 mt-0.5">{prompt.length}/500</div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold
                       hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate"
            )}
          </button>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-3">
              <div
                className="border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-2"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Generated asset"
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
              <button
                onClick={handlePlace}
                className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold
                           hover:bg-blue-700 transition-colors"
              >
                Place on Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
