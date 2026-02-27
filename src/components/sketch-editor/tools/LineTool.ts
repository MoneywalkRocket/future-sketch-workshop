import type { Tool, ToolContext } from "./BaseTool";
import type { LineObject, ArrowObject } from "@/types/canvas";
import { generateId } from "../utils/id-generator";

export class LineTool implements Tool {
  name = "line" as const;
  cursor = "crosshair";
  private preview: LineObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    ctx.pushSnapshot(ctx.state.objects);

    this.preview = {
      id: generateId(),
      type: "line",
      x: pt.x,
      y: pt.y,
      x2: pt.x,
      y2: pt.y,
      opacity: 1,
      color: ctx.state.strokeColor,
      width: ctx.state.strokeWidth,
    };
    ctx.setPreviewObject(this.preview);
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    let x2 = pt.x;
    let y2 = pt.y;

    // Shift for constrained angles (0, 45, 90)
    if (e.shiftKey) {
      const dx = x2 - this.preview.x;
      const dy = y2 - this.preview.y;
      const angle = Math.atan2(dy, dx);
      const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const len = Math.sqrt(dx * dx + dy * dy);
      x2 = this.preview.x + Math.cos(snappedAngle) * len;
      y2 = this.preview.y + Math.sin(snappedAngle) * len;
    }

    this.preview = { ...this.preview, x2, y2 };
    ctx.setPreviewObject(this.preview);
  }

  onPointerUp(_e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    const dx = this.preview.x2 - this.preview.x;
    const dy = this.preview.y2 - this.preview.y;
    if (Math.sqrt(dx * dx + dy * dy) > 3) {
      ctx.dispatch({ type: "ADD_OBJECT", object: this.preview });
    }
    ctx.setPreviewObject(null);
    this.preview = null;
  }
}

export class ArrowTool implements Tool {
  name = "arrow" as const;
  cursor = "crosshair";
  private preview: ArrowObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    ctx.pushSnapshot(ctx.state.objects);

    this.preview = {
      id: generateId(),
      type: "arrow",
      x: pt.x,
      y: pt.y,
      x2: pt.x,
      y2: pt.y,
      opacity: 1,
      color: ctx.state.strokeColor,
      width: ctx.state.strokeWidth,
    };
    ctx.setPreviewObject(this.preview);
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    this.preview = { ...this.preview, x2: pt.x, y2: pt.y };
    ctx.setPreviewObject(this.preview);
  }

  onPointerUp(_e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    const dx = this.preview.x2 - this.preview.x;
    const dy = this.preview.y2 - this.preview.y;
    if (Math.sqrt(dx * dx + dy * dy) > 3) {
      ctx.dispatch({ type: "ADD_OBJECT", object: this.preview });
    }
    ctx.setPreviewObject(null);
    this.preview = null;
  }
}
