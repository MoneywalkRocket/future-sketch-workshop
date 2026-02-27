import type { SceneObject, RefineRegion } from "@/types/canvas";
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

/**
 * Flatten scene objects then clip to a specific region.
 * Returns a PNG data URL of only the selected area.
 */
export function flattenRegionToDataUrl(
  objects: SceneObject[],
  region: RefineRegion,
  fullWidth: number,
  fullHeight: number
): string {
  // Render full scene
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = fullWidth;
  fullCanvas.height = fullHeight;
  const fullCtx = fullCanvas.getContext("2d")!;
  renderScene(fullCtx, objects, fullWidth, fullHeight);

  // Clip to region
  const regionCanvas = document.createElement("canvas");
  regionCanvas.width = region.w;
  regionCanvas.height = region.h;
  const regionCtx = regionCanvas.getContext("2d")!;
  regionCtx.drawImage(
    fullCanvas,
    region.x, region.y, region.w, region.h,
    0, 0, region.w, region.h
  );
  return regionCanvas.toDataURL("image/png");
}
