import type { SceneObject, RectObject, EllipseObject, LineObject, ArrowObject, TextObject, ImageObject, PathObject, EraserObject } from "@/types/canvas";

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function getBoundingBox(obj: SceneObject): BoundingBox {
  switch (obj.type) {
    case "rect":
      return getRectBounds(obj);
    case "ellipse":
      return getEllipseBounds(obj);
    case "line":
    case "arrow":
      return getLineBounds(obj);
    case "text":
      return getTextBounds(obj);
    case "image":
      return getImageBounds(obj);
    case "path":
    case "eraser":
      return getPathBounds(obj);
  }
}

function getRectBounds(obj: RectObject): BoundingBox {
  return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
}

function getEllipseBounds(obj: EllipseObject): BoundingBox {
  return { x: obj.x - obj.rx, y: obj.y - obj.ry, w: obj.rx * 2, h: obj.ry * 2 };
}

function getLineBounds(obj: LineObject | ArrowObject): BoundingBox {
  const minX = Math.min(obj.x, obj.x2);
  const minY = Math.min(obj.y, obj.y2);
  const maxX = Math.max(obj.x, obj.x2);
  const maxY = Math.max(obj.y, obj.y2);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function getTextBounds(obj: TextObject): BoundingBox {
  const w = obj.content.length * obj.fontSize * 0.6;
  const h = obj.fontSize * 1.4;
  return { x: obj.x, y: obj.y - h, w, h };
}

function getImageBounds(obj: ImageObject): BoundingBox {
  return { x: obj.x, y: obj.y, w: obj.displayWidth, h: obj.displayHeight };
}

function getPathBounds(obj: PathObject | EraserObject): BoundingBox {
  if (obj.points.length === 0) return { x: obj.x, y: obj.y, w: 0, h: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of obj.points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = obj.width / 2;
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
}

export function pointInBox(px: number, py: number, box: BoundingBox, padding = 0): boolean {
  return (
    px >= box.x - padding &&
    px <= box.x + box.w + padding &&
    py >= box.y - padding &&
    py <= box.y + box.h + padding
  );
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function pointNearLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number
): boolean {
  const len = distance(x1, y1, x2, y2);
  if (len === 0) return distance(px, py, x1, y1) <= threshold;
  const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (len * len)));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return distance(px, py, projX, projY) <= threshold;
}

export function pointNearPath(
  px: number,
  py: number,
  points: { x: number; y: number }[],
  threshold: number
): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    if (pointNearLine(px, py, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, threshold)) {
      return true;
    }
  }
  return false;
}

export function pointInEllipse(px: number, py: number, cx: number, cy: number, rx: number, ry: number): boolean {
  return ((px - cx) ** 2) / (rx ** 2) + ((py - cy) ** 2) / (ry ** 2) <= 1;
}
