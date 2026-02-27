import type { Tool, ToolContext } from "./BaseTool";
import type { RectObject } from "@/types/canvas";
import { generateId } from "../utils/id-generator";

export class RectTool implements Tool {
  name = "rectangle" as const;
  cursor = "crosshair";
  private startX = 0;
  private startY = 0;
  private preview: RectObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    this.startX = pt.x;
    this.startY = pt.y;
    ctx.pushSnapshot(ctx.state.objects);

    this.preview = {
      id: generateId(),
      type: "rect",
      x: pt.x,
      y: pt.y,
      w: 0,
      h: 0,
      opacity: 1,
      fillColor: ctx.state.fillColor,
      strokeColor: ctx.state.strokeColor,
      strokeWidth: ctx.state.strokeWidth,
    };
    ctx.setPreviewObject(this.preview);
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    let w = pt.x - this.startX;
    let h = pt.y - this.startY;

    // Shift for square
    if (e.shiftKey) {
      const size = Math.max(Math.abs(w), Math.abs(h));
      w = w < 0 ? -size : size;
      h = h < 0 ? -size : size;
    }

    this.preview = {
      ...this.preview,
      x: w < 0 ? this.startX + w : this.startX,
      y: h < 0 ? this.startY + h : this.startY,
      w: Math.abs(w),
      h: Math.abs(h),
    };
    ctx.setPreviewObject(this.preview);
  }

  onPointerUp(_e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    if (this.preview.w > 2 || this.preview.h > 2) {
      ctx.dispatch({ type: "ADD_OBJECT", object: this.preview });
    }
    ctx.setPreviewObject(null);
    this.preview = null;
  }
}
