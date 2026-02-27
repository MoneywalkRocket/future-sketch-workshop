import type { Tool, ToolContext } from "./BaseTool";
import type { EllipseObject } from "@/types/canvas";
import { generateId } from "../utils/id-generator";

export class EllipseTool implements Tool {
  name = "ellipse" as const;
  cursor = "crosshair";
  private startX = 0;
  private startY = 0;
  private preview: EllipseObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    this.startX = pt.x;
    this.startY = pt.y;
    ctx.pushSnapshot(ctx.state.objects);

    this.preview = {
      id: generateId(),
      type: "ellipse",
      x: pt.x,
      y: pt.y,
      rx: 0,
      ry: 0,
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
    let rx = Math.abs(pt.x - this.startX) / 2;
    let ry = Math.abs(pt.y - this.startY) / 2;

    if (e.shiftKey) {
      const r = Math.max(rx, ry);
      rx = r;
      ry = r;
    }

    const cx = (this.startX + pt.x) / 2;
    const cy = (this.startY + pt.y) / 2;

    this.preview = { ...this.preview, x: cx, y: cy, rx, ry };
    ctx.setPreviewObject(this.preview);
  }

  onPointerUp(_e: PointerEvent, ctx: ToolContext): void {
    if (!this.preview) return;
    if (this.preview.rx > 2 || this.preview.ry > 2) {
      ctx.dispatch({ type: "ADD_OBJECT", object: this.preview });
    }
    ctx.setPreviewObject(null);
    this.preview = null;
  }
}
