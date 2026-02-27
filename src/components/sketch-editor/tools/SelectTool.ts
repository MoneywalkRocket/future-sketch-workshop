import type { Tool, ToolContext } from "./BaseTool";
import type { SceneObject } from "@/types/canvas";
import { hitTestObjects } from "../rendering/hit-test";
import { getBoundingBox } from "../utils/geometry";
import { hitTestHandle, type HandlePosition } from "../rendering/selection-renderer";

type DragMode = "none" | "move" | "resize";

export class SelectTool implements Tool {
  name = "select" as const;
  cursor = "default";
  private dragMode: DragMode = "none";
  private dragStart = { x: 0, y: 0 };
  private dragObjStart = { x: 0, y: 0 };
  private dragObjSize = { w: 0, h: 0 };
  private resizeHandle: HandlePosition | null = null;
  private dragTarget: SceneObject | null = null;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);

    // Check if clicking a resize handle on already-selected object
    if (ctx.state.selectedIds.length === 1) {
      const sel = ctx.state.objects.find((o) => o.id === ctx.state.selectedIds[0]);
      if (sel) {
        const box = getBoundingBox(sel);
        const handle = hitTestHandle(pt.x, pt.y, box);
        if (handle) {
          this.dragMode = "resize";
          this.resizeHandle = handle;
          this.dragStart = pt;
          this.dragTarget = sel;
          this.dragObjStart = { x: box.x, y: box.y };
          this.dragObjSize = { w: box.w, h: box.h };
          ctx.pushSnapshot(ctx.state.objects);
          return;
        }
      }
    }

    // Hit test for selecting an object
    const hit = hitTestObjects(pt.x, pt.y, ctx.state.objects);
    if (hit) {
      ctx.dispatch({ type: "SELECT_OBJECTS", ids: [hit.id] });
      this.dragMode = "move";
      this.dragStart = pt;
      this.dragTarget = hit;
      this.dragObjStart = { x: hit.x, y: hit.y };
      ctx.pushSnapshot(ctx.state.objects);
    } else {
      ctx.dispatch({ type: "CLEAR_SELECTION" });
      this.dragMode = "none";
      this.dragTarget = null;
    }
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (this.dragMode === "none" || !this.dragTarget) return;
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    const dx = pt.x - this.dragStart.x;
    const dy = pt.y - this.dragStart.y;

    if (this.dragMode === "move") {
      ctx.dispatch({
        type: "UPDATE_OBJECT",
        id: this.dragTarget.id,
        changes: {
          x: this.dragObjStart.x + dx,
          y: this.dragObjStart.y + dy,
        },
      });
      // Also move x2/y2 for lines
      if (this.dragTarget.type === "line" || this.dragTarget.type === "arrow") {
        const lineObj = this.dragTarget;
        ctx.dispatch({
          type: "UPDATE_OBJECT",
          id: this.dragTarget.id,
          changes: {
            x: this.dragObjStart.x + dx,
            y: this.dragObjStart.y + dy,
            x2: lineObj.x2 + dx - (lineObj.x - this.dragObjStart.x),
            y2: lineObj.y2 + dy - (lineObj.y - this.dragObjStart.y),
          } as Partial<typeof lineObj>,
        });
      }
    }

    if (this.dragMode === "resize" && this.resizeHandle) {
      this.handleResize(ctx, dx, dy);
    }
  }

  onPointerUp(): void {
    this.dragMode = "none";
    this.dragTarget = null;
    this.resizeHandle = null;
  }

  private handleResize(ctx: ToolContext, dx: number, dy: number): void {
    if (!this.dragTarget) return;
    const corner = this.resizeHandle!.corner;
    const obj = this.dragTarget;

    let newX = this.dragObjStart.x;
    let newY = this.dragObjStart.y;
    let newW = this.dragObjSize.w;
    let newH = this.dragObjSize.h;

    if (corner === "br") {
      newW += dx;
      newH += dy;
    } else if (corner === "bl") {
      newX += dx;
      newW -= dx;
      newH += dy;
    } else if (corner === "tr") {
      newY += dy;
      newW += dx;
      newH -= dy;
    } else if (corner === "tl") {
      newX += dx;
      newY += dy;
      newW -= dx;
      newH -= dy;
    }

    newW = Math.max(10, newW);
    newH = Math.max(10, newH);

    if (obj.type === "rect") {
      ctx.dispatch({
        type: "UPDATE_OBJECT",
        id: obj.id,
        changes: { x: newX, y: newY, w: newW, h: newH },
      });
    } else if (obj.type === "ellipse") {
      ctx.dispatch({
        type: "UPDATE_OBJECT",
        id: obj.id,
        changes: { x: newX + newW / 2, y: newY + newH / 2, rx: newW / 2, ry: newH / 2 },
      });
    } else if (obj.type === "image") {
      ctx.dispatch({
        type: "UPDATE_OBJECT",
        id: obj.id,
        changes: { x: newX, y: newY, displayWidth: newW, displayHeight: newH },
      });
    }
  }
}
