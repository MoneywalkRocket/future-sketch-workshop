// ---- Tool identifiers ----
export type ToolType =
  | "select"
  | "brush"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "eraser"
  | "hand";

// ---- Scene objects ----
export interface BaseObject {
  id: string;
  type: string;
  x: number;
  y: number;
  opacity: number;
}

export interface PathObject extends BaseObject {
  type: "path";
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface EraserObject extends BaseObject {
  type: "eraser";
  points: { x: number; y: number }[];
  width: number;
}

export interface RectObject extends BaseObject {
  type: "rect";
  w: number;
  h: number;
  fillColor: string | null;
  strokeColor: string;
  strokeWidth: number;
}

export interface EllipseObject extends BaseObject {
  type: "ellipse";
  rx: number;
  ry: number;
  fillColor: string | null;
  strokeColor: string;
  strokeWidth: number;
}

export interface LineBaseFields {
  x2: number;
  y2: number;
  color: string;
  width: number;
}

export interface LineObject extends BaseObject, LineBaseFields {
  type: "line";
}

export interface ArrowObject extends BaseObject, LineBaseFields {
  type: "arrow";
}

export interface TextObject extends BaseObject {
  type: "text";
  content: string;
  fontSize: number;
  color: string;
}

export interface ImageObject extends BaseObject {
  type: "image";
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
}

export type SceneObject =
  | PathObject
  | EraserObject
  | RectObject
  | EllipseObject
  | LineObject
  | ArrowObject
  | TextObject
  | ImageObject;

// ---- Editor state ----
export interface EditorState {
  objects: SceneObject[];
  selectedIds: string[];
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string | null;
  strokeWidth: number;
  fontSize: number;
  showGrid: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
}

// ---- Actions ----
export type EditorAction =
  | { type: "SET_TOOL"; tool: ToolType }
  | { type: "SET_STROKE_COLOR"; color: string }
  | { type: "SET_FILL_COLOR"; color: string | null }
  | { type: "SET_STROKE_WIDTH"; width: number }
  | { type: "SET_FONT_SIZE"; size: number }
  | { type: "ADD_OBJECT"; object: SceneObject }
  | { type: "UPDATE_OBJECT"; id: string; changes: Partial<SceneObject> }
  | { type: "DELETE_OBJECTS"; ids: string[] }
  | { type: "SELECT_OBJECTS"; ids: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_OBJECTS"; objects: SceneObject[] }
  | { type: "TOGGLE_GRID" }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; offset: { x: number; y: number } }
  | { type: "CLEAR_CANVAS" };
