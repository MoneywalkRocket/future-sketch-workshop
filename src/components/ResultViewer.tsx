"use client";

import { useState } from "react";
import { Mode } from "@/types";
import { exportToPng, downloadBlob } from "@/lib/export-png";

interface ResultViewerProps {
  imageDataUrl: string;
  comment: string;
  mode: Mode;
  onCommentChange: (value: string) => void;
}

export default function ResultViewer({
  imageDataUrl,
  comment,
  mode,
  onCommentChange,
}: ResultViewerProps) {
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    setExporting(true);
    try {
      const blob = await exportToPng({ imageDataUrl, comment, mode });
      const filename = `future-sketch-${mode}-${Date.now()}.png`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="AI-refined sketch"
          className="w-full rounded"
        />
      </div>

      <div>
        <label htmlFor="export-comment" className="block text-sm font-medium text-gray-700">
          Comment (editable — will be included in exported image)
        </label>
        <input
          id="export-comment"
          type="text"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          maxLength={200}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={exporting}
        className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white
                   shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                   focus:ring-offset-2 transition-colors disabled:opacity-60"
      >
        {exporting ? "Exporting..." : "Download PNG"}
      </button>
    </div>
  );
}
