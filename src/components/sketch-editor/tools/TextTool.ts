import type { Tool, ToolContext } from "./BaseTool";

export class TextTool implements Tool {
  name = "text" as const;
  cursor = "text";

  onPointerDown(e: PointerEvent, ctx: ToolContext): void {
    const pt = ctx.getCanvasPoint(e.clientX, e.clientY);
    ctx.openTextInput(pt.x, pt.y);
  }

  onPointerMove(): void {
    // no-op
  }

  onPointerUp(): void {
    // no-op
  }
}
