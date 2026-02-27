import { Mode, MODE_CONFIGS } from "@/types";

interface ExportOptions {
  imageDataUrl: string;
  comment: string;
  mode: Mode;
  timestamp?: Date;
}

/**
 * Merges the refined image with a comment, mode label, and timestamp
 * into a single downloadable PNG using an offscreen canvas.
 */
export async function exportToPng(options: ExportOptions): Promise<Blob> {
  const { imageDataUrl, comment, mode, timestamp = new Date() } = options;

  const img = await loadImage(imageDataUrl);

  const padding = 32;
  const footerHeight = comment ? 100 : 60;
  const canvasWidth = Math.max(img.width, 400);
  const canvasHeight = img.height + footerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw image centered
  const imgX = (canvasWidth - img.width) / 2;
  ctx.drawImage(img, imgX, 0);

  // Footer area
  const footerY = img.height + 16;
  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";

  const modeLabel = `Future Sketch — ${MODE_CONFIGS[mode].label} Vision`;
  ctx.fillText(modeLabel, padding, footerY);

  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#6b7280";
  const timeStr = timestamp.toLocaleString();
  ctx.fillText(timeStr, padding, footerY + 20);

  if (comment.trim()) {
    ctx.fillStyle = "#374151";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, sans-serif";
    wrapText(ctx, comment.trim(), padding, footerY + 44, canvasWidth - padding * 2, 18);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export canvas to PNG"));
      },
      "image/png",
      1.0
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
