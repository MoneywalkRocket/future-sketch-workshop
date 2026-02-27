import type { Tool, ToolContext } from "./BaseTool";
import type { PathObject } from "@/types/canvas";
import { generateId } from "../utils/id-generator";

export class BrushTool implements Tool {
  name = "brush" as const;
  cursor = "crosshair";
  private currentPath: PathObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const point = ctx.getCanvasPoint(e.clientX, e.clientY);
    ctx.pushSnapshot(ctx.state.objects);

    this.currentPath = {
      id: generateId(),
      type: "path",
      x: 0,
      y: 0,
      opacity: 1,
      points: [point],
      color: ctx.state.strokeColor,
      width: ctx.state.strokeWidth,
    };
    ctx.setPreviewObject(this.currentPath);
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (!this.currentPath) return;
    const point = ctx.getCanvasPoint(e.clientX, e.clientY);
    this.currentPath.points.push(point);
    ctx.setPreviewObject({ ...this.currentPath });
  }

  onPointerUp(_e: PointerEvent, ctx: ToolContext): void {
    if (!this.currentPath) return;
    ctx.dispatch({ type: "ADD_OBJECT", object: this.currentPath });
    ctx.setPreviewObject(null);
    this.currentPath = null;
  }
}
