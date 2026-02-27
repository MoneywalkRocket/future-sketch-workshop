import { useRef, useCallback } from "react";
import type { SceneObject } from "@/types/canvas";

interface HistoryState {
  stack: SceneObject[][];
  index: number;
}

export function useHistory(maxEntries = 50) {
  const historyRef = useRef<HistoryState>({
    stack: [[]],
    index: 0,
  });

  const pushSnapshot = useCallback(
    (objects: SceneObject[]) => {
      const h = historyRef.current;
      // Truncate any redo history
      const newStack = h.stack.slice(0, h.index + 1);
      // Deep clone the objects array (stringify/parse for simplicity — images store dataURLs as strings)
      const snapshot = JSON.parse(JSON.stringify(objects));
      newStack.push(snapshot);
      // Trim if over limit
      if (newStack.length > maxEntries) {
        newStack.shift();
      }
      historyRef.current = { stack: newStack, index: newStack.length - 1 };
    },
    [maxEntries]
  );

  const undo = useCallback((): SceneObject[] | null => {
    const h = historyRef.current;
    if (h.index <= 0) return null;
    h.index--;
    return JSON.parse(JSON.stringify(h.stack[h.index]));
  }, []);

  const redo = useCallback((): SceneObject[] | null => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return null;
    h.index++;
    return JSON.parse(JSON.stringify(h.stack[h.index]));
  }, []);

  const canUndo = useCallback(() => historyRef.current.index > 0, []);
  const canRedo = useCallback(
    () => historyRef.current.index < historyRef.current.stack.length - 1,
    []
  );

  return { pushSnapshot, undo, redo, canUndo, canRedo };
}
