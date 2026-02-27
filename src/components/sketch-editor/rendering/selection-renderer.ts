import type { SceneObject } from "@/types/canvas";
import { getBoundingBox } from "../utils/geometry";

const HANDLE_SIZE = 8;

export function renderSelectionHandles(
  ctx: CanvasRenderingContext2D,
  objects: SceneObject[],
  selectedIds: string[]
): void {
  ctx.save();
  for (const obj of objects) {
    if (!selectedIds.includes(obj.id)) continue;
    const box = getBoundingBox(obj);

    // Dashed bounding box
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.setLineDash([]);

    // Corner handles
    const handles = getHandlePositions(box);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    for (const h of handles) {
      ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }
  }
  ctx.restore();
}

export interface HandlePosition {
  x: number;
  y: number;
  cursor: string;
  corner: "tl" | "tr" | "bl" | "br";
}

export function getHandlePositions(box: { x: number; y: number; w: number; h: number }): HandlePosition[] {
  return [
    { x: box.x, y: box.y, cursor: "nw-resize", corner: "tl" },
    { x: box.x + box.w, y: box.y, cursor: "ne-resize", corner: "tr" },
    { x: box.x, y: box.y + box.h, cursor: "sw-resize", corner: "bl" },
    { x: box.x + box.w, y: box.y + box.h, cursor: "se-resize", corner: "br" },
  ];
}

export function hitTestHandle(
  px: number,
  py: number,
  box: { x: number; y: number; w: number; h: number }
): HandlePosition | null {
  const handles = getHandlePositions(box);
  for (const h of handles) {
    if (
      Math.abs(px - h.x) <= HANDLE_SIZE &&
      Math.abs(py - h.y) <= HANDLE_SIZE
    ) {
      return h;
    }
  }
  return null;
}
