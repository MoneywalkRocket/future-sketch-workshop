import type { ToolType } from "@/types/canvas";
import type { Tool } from "./BaseTool";
import { SelectTool } from "./SelectTool";
import { BrushTool } from "./BrushTool";
import { RectTool } from "./RectTool";
import { EllipseTool } from "./EllipseTool";
import { LineTool, ArrowTool } from "./LineTool";
import { TextTool } from "./TextTool";
import { EraserTool } from "./EraserTool";
import { HandTool } from "./HandTool";

const tools: Record<ToolType, Tool> = {
  select: new SelectTool(),
  brush: new BrushTool(),
  rectangle: new RectTool(),
  ellipse: new EllipseTool(),
  line: new LineTool(),
  arrow: new ArrowTool(),
  text: new TextTool(),
  eraser: new EraserTool(),
  hand: new HandTool(),
};

export function getTool(type: ToolType): Tool {
  return tools[type];
}
