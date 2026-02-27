import type { Tool, ToolContext } from "./BaseTool";
import type { EraserObject } from "@/types/canvas";
import { generateId } from "../utils/id-generator";

export class EraserTool implements Tool {
  name = "eraser" as const;
  cursor = "crosshair";
  private current: EraserObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const point = ctx.getCanvasPoint(e.clientX, e.clientY);
    ctx.pushSnapshot(ctx.state.objects);

    this.current = {
      id: generateId(),
      type: "eraser",
      x: 0,
      y: 0,
      opacity: 1,
      points: [point],
      width: ctx.state.strokeWidth * 3,
    };
    ctx.setPreviewObject(this.current);
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (!this.current) return;
    const point = ctx.getCanvasPoint(e.clientX, e.clientY);
    this.current.points.push(point);
    ctx.setPreviewObject({ ...this.current });
  }

  onPointerUp(_e: PointerEvent, ctx: ToolContext): void {
    if (!this.current) return;
    ctx.dispatch({ type: "ADD_OBJECT", object: this.current });
    ctx.setPreviewObject(null);
    this.current = null;
  }
}
