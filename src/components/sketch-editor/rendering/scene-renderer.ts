import type { SceneObject } from "@/types/canvas";

// Cache loaded images by src
const imageCache = new Map<string, HTMLImageElement>();

function getOrLoadImage(src: string): HTMLImageElement | null {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return cached;
  if (!cached) {
    const img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return null;
}

export function renderObject(ctx: CanvasRenderingContext2D, obj: SceneObject): void {
  ctx.save();
  ctx.globalAlpha = obj.opacity;

  switch (obj.type) {
    case "path":
      renderPath(ctx, obj);
      break;
    case "eraser":
      renderEraser(ctx, obj);
      break;
    case "rect":
      renderRect(ctx, obj);
      break;
    case "ellipse":
      renderEllipse(ctx, obj);
      break;
    case "line":
      renderLine(ctx, obj);
      break;
    case "arrow":
      renderArrow(ctx, obj);
      break;
    case "text":
      renderText(ctx, obj);
      break;
    case "image":
      renderImage(ctx, obj);
      break;
  }

  ctx.restore();
}

function renderPath(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "path" }): void {
  if (obj.points.length === 0) return;
  ctx.strokeStyle = obj.color;
  ctx.lineWidth = obj.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (obj.points.length === 1) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(obj.points[0].x, obj.points[0].y, obj.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(obj.points[0].x, obj.points[0].y);
  for (let i = 1; i < obj.points.length; i++) {
    ctx.lineTo(obj.points[i].x, obj.points[i].y);
  }
  ctx.stroke();
}

function renderEraser(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "eraser" }): void {
  if (obj.points.length === 0) return;
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.lineWidth = obj.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (obj.points.length === 1) {
    ctx.beginPath();
    ctx.arc(obj.points[0].x, obj.points[0].y, obj.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  ctx.beginPath();
  ctx.moveTo(obj.points[0].x, obj.points[0].y);
  for (let i = 1; i < obj.points.length; i++) {
    ctx.lineTo(obj.points[i].x, obj.points[i].y);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

function renderRect(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "rect" }): void {
  if (obj.fillColor) {
    ctx.fillStyle = obj.fillColor;
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
  }
  if (obj.strokeColor && obj.strokeWidth > 0) {
    ctx.strokeStyle = obj.strokeColor;
    ctx.lineWidth = obj.strokeWidth;
    ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
  }
}

function renderEllipse(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "ellipse" }): void {
  ctx.beginPath();
  ctx.ellipse(obj.x, obj.y, Math.abs(obj.rx), Math.abs(obj.ry), 0, 0, Math.PI * 2);
  if (obj.fillColor) {
    ctx.fillStyle = obj.fillColor;
    ctx.fill();
  }
  if (obj.strokeColor && obj.strokeWidth > 0) {
    ctx.strokeStyle = obj.strokeColor;
    ctx.lineWidth = obj.strokeWidth;
    ctx.stroke();
  }
}

function renderLine(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "line" }): void {
  ctx.strokeStyle = obj.color;
  ctx.lineWidth = obj.width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.stroke();
}

function renderArrow(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "arrow" }): void {
  ctx.strokeStyle = obj.color;
  ctx.fillStyle = obj.color;
  ctx.lineWidth = obj.width;
  ctx.lineCap = "round";

  // Line
  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(obj.y2 - obj.y, obj.x2 - obj.x);
  const headLen = Math.max(10, obj.width * 3);
  ctx.beginPath();
  ctx.moveTo(obj.x2, obj.y2);
  ctx.lineTo(
    obj.x2 - headLen * Math.cos(angle - Math.PI / 6),
    obj.y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    obj.x2 - headLen * Math.cos(angle + Math.PI / 6),
    obj.y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

function renderText(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "text" }): void {
  ctx.fillStyle = obj.color;
  ctx.font = `${obj.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textBaseline = "top";
  const lines = obj.content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], obj.x, obj.y + i * obj.fontSize * 1.3);
  }
}

function renderImage(ctx: CanvasRenderingContext2D, obj: SceneObject & { type: "image" }): void {
  const img = getOrLoadImage(obj.src);
  if (img) {
    ctx.drawImage(img, obj.x, obj.y, obj.displayWidth, obj.displayHeight);
  } else {
    // Placeholder while loading
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(obj.x, obj.y, obj.displayWidth, obj.displayHeight);
    ctx.strokeStyle = "#9ca3af";
    ctx.strokeRect(obj.x, obj.y, obj.displayWidth, obj.displayHeight);
  }
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  objects: SceneObject[],
  width: number,
  height: number
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  for (const obj of objects) {
    renderObject(ctx, obj);
  }
  ctx.restore();
}
