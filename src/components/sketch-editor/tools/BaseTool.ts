import type { SceneObject, EditorState, EditorAction, ToolType } from "@/types/canvas";

export interface ToolContext {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  getCanvasPoint: (clientX: number, clientY: number) => { x: number; y: number };
  pushSnapshot: (objects: SceneObject[]) => void;
  /** Temporary preview object drawn during drag but not yet committed */
  setPreviewObject: (obj: SceneObject | null) => void;
  /** For text tool: open the text input overlay at a position */
  openTextInput: (x: number, y: number) => void;
}

export interface Tool {
  name: ToolType;
  cursor: string;
  onPointerDown(e: PointerEvent, ctx: ToolContext): void;
  onPointerMove(e: PointerEvent, ctx: ToolContext): void;
  onPointerUp(e: PointerEvent, ctx: ToolContext): void;
}
