import type { SceneObject } from "@/types/canvas";
import { pointInBox, getBoundingBox, pointNearPath, pointNearLine, pointInEllipse } from "../utils/geometry";

/**
 * Hit-test a point against all objects, returning the topmost (last in array) hit.
 */
export function hitTestObjects(
  px: number,
  py: number,
  objects: SceneObject[]
): SceneObject | null {
  // Test in reverse order (top objects first)
  for (let i = objects.length - 1; i >= 0; i--) {
    if (hitTestObject(px, py, objects[i])) {
      return objects[i];
    }
  }
  return null;
}

function hitTestObject(px: number, py: number, obj: SceneObject): boolean {
  switch (obj.type) {
    case "rect":
      return pointInBox(px, py, { x: obj.x, y: obj.y, w: obj.w, h: obj.h }, 4);
    case "ellipse":
      return pointInEllipse(px, py, obj.x, obj.y, obj.rx + 4, obj.ry + 4);
    case "line":
    case "arrow":
      return pointNearLine(px, py, obj.x, obj.y, obj.x2, obj.y2, Math.max(obj.width, 6));
    case "path":
      return pointNearPath(px, py, obj.points, Math.max(obj.width, 6));
    case "eraser":
      return pointNearPath(px, py, obj.points, Math.max(obj.width, 6));
    case "text": {
      const box = getBoundingBox(obj);
      return pointInBox(px, py, box, 4);
    }
    case "image":
      return pointInBox(px, py, { x: obj.x, y: obj.y, w: obj.displayWidth, h: obj.displayHeight }, 4);
    default:
      return false;
  }
}
