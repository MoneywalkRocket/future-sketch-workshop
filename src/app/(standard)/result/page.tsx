"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultViewer from "@/components/ResultViewer";
import { Mode, MODE_CONFIGS, isValidMode } from "@/types";

interface StoredResult {
  image: string;
  comment: string;
  mode: Mode;
}

export default function ResultPage() {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("sketchResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredResult;
        if (parsed.image && isValidMode(parsed.mode)) {
          setResult(parsed);
        }
      } catch {
        // Invalid data
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold">No result found</h1>
        <p className="mt-2 text-gray-600">Please create a sketch first.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Start over
        </Link>
      </div>
    );
  }

  const config = MODE_CONFIGS[result.mode];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/draw/${result.mode}`}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Back to drawing"
        >
          &larr; Back to drawing
        </Link>
        <h1 className="text-lg font-semibold">{config.label} Vision</h1>
      </div>

      <ResultViewer
        imageDataUrl={result.image}
        comment={result.comment}
        mode={result.mode}
        onCommentChange={(newComment) =>
          setResult((prev) => (prev ? { ...prev, comment: newComment } : prev))
        }
      />

      <div className="flex gap-3">
        <Link
          href={`/draw/${result.mode}`}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm
                     font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Draw Again
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm
                     font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Start Over
        </Link>
      </div>
    </div>
  );
}
