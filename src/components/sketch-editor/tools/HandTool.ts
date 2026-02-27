import type { Tool, ToolContext } from "./BaseTool";

export class HandTool implements Tool {
  name = "hand" as const;
  cursor = "grab";
  private dragging = false;
  private startX = 0;
  private startY = 0;
  private startPanX = 0;
  private startPanY = 0;

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    this.dragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startPanX = ctx.state.panOffset.x;
    this.startPanY = ctx.state.panOffset.y;
  }

  onPointerMove(e: PointerEvent, ctx: ToolContext): void {
    if (!this.dragging) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    ctx.dispatch({
      type: "SET_PAN",
      offset: { x: this.startPanX + dx, y: this.startPanY + dy },
    });
  }

  onPointerUp(): void {
    this.dragging = false;
  }
}
