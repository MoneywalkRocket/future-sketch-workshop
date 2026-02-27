import { useReducer } from "react";
import type { EditorState, EditorAction } from "@/types/canvas";

const initialState: EditorState = {
  objects: [],
  selectedIds: [],
  activeTool: "brush",
  strokeColor: "#000000",
  fillColor: null,
  strokeWidth: 3,
  fontSize: 18,
  showGrid: false,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  refineMode: false,
  refineRegion: null,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_TOOL":
      return { ...state, activeTool: action.tool, selectedIds: [] };
    case "SET_STROKE_COLOR":
      return { ...state, strokeColor: action.color };
    case "SET_FILL_COLOR":
      return { ...state, fillColor: action.color };
    case "SET_STROKE_WIDTH":
      return { ...state, strokeWidth: action.width };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.size };
    case "ADD_OBJECT":
      return { ...state, objects: [...state.objects, action.object] };
    case "UPDATE_OBJECT":
      return {
        ...state,
        objects: state.objects.map((obj) =>
          obj.id === action.id ? { ...obj, ...action.changes } as typeof obj : obj
        ),
      };
    case "DELETE_OBJECTS":
      return {
        ...state,
        objects: state.objects.filter((obj) => !action.ids.includes(obj.id)),
        selectedIds: state.selectedIds.filter((id) => !action.ids.includes(id)),
      };
    case "SELECT_OBJECTS":
      return { ...state, selectedIds: action.ids };
    case "CLEAR_SELECTION":
      return { ...state, selectedIds: [] };
    case "SET_OBJECTS":
      return { ...state, objects: action.objects };
    case "TOGGLE_GRID":
      return { ...state, showGrid: !state.showGrid };
    case "SET_ZOOM":
      return { ...state, zoom: Math.max(0.25, Math.min(3, action.zoom)) };
    case "SET_PAN":
      return { ...state, panOffset: action.offset };
    case "CLEAR_CANVAS":
      return { ...state, objects: [], selectedIds: [] };
    case "ENTER_REFINE_MODE":
      return { ...state, refineMode: true, refineRegion: null, selectedIds: [] };
    case "EXIT_REFINE_MODE":
      return { ...state, refineMode: false, refineRegion: null };
    case "SET_REFINE_REGION":
      return { ...state, refineRegion: action.region };
    default:
      return state;
  }
}

export function useEditorState() {
  return useReducer(editorReducer, initialState);
}
