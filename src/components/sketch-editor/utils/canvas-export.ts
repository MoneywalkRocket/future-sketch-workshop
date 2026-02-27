import type { SceneObject } from "@/types/canvas";
import { renderScene } from "../rendering/scene-renderer";

/**
 * Flatten all scene objects to a PNG data URL at 1:1 scale.
 * Ignores pan/zoom — exports the full scene.
 */
export function flattenToDataUrl(
  objects: SceneObject[],
  width: number,
  height: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  renderScene(ctx, objects, width, height);
  return canvas.toDataURL("image/png");
}
