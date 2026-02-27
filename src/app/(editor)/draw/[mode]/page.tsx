"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import SketchEditor from "@/components/sketch-editor/SketchEditor";
import { Mode, MODE_CONFIGS, isValidMode } from "@/types";
import type { RefineRegion } from "@/types/canvas";

export default function DrawPage() {
  const params = useParams();
  const router = useRouter();
  const modeParam = params.mode as string;

  const [prompt, setPrompt] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(
    async (dataUrl: string, region?: RefineRegion) => {
      if (!isValidMode(modeParam)) return;
      setLoading(true);
      setError(null);

      try {
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");

        if (base64.length > 7_000_000) {
          throw new Error("Image is too large. Please simplify your drawing.");
        }

        const res = await fetch("/api/gemini/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            prompt,
            mode: modeParam,
            isRegion: !!region,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Server error (${res.status})`);
        }

        const data = await res.json();

        if (region) {
          // Region refine: place result back on canvas via global callback
          const w = window as unknown as Record<string, unknown>;
          const placeImage = w.__sketchEditorPlaceRefinedImage as
            | ((url: string, r: RefineRegion) => void)
            | undefined;
          if (placeImage) {
            placeImage(data.image, region);
          }
        } else {
          // Full canvas refine: navigate to result page
          sessionStorage.setItem(
            "sketchResult",
            JSON.stringify({
              image: data.image,
              comment,
              mode: modeParam,
            })
          );
          router.push("/result");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [prompt, comment, modeParam, router]
  );

  if (!isValidMode(modeParam)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Invalid mode</h1>
          <p className="mt-2 text-gray-600">Please select a valid timeline.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const mode: Mode = modeParam;
  const config = MODE_CONFIGS[mode];

  return (
    <>
      <SketchEditor
        mode={mode}
        modeConfig={config}
        prompt={prompt}
        comment={comment}
        onPromptChange={setPrompt}
        onCommentChange={setComment}
        onCapture={handleCapture}
        loading={loading}
      />

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-lg">
            <p className="font-medium">Failed to refine</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-500 underline hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
