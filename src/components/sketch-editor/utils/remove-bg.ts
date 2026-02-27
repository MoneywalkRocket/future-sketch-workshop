/**
 * Remove white/near-white background from an image, making it transparent.
 * Uses a luminance threshold: pixels brighter than the threshold become transparent.
 * Edge pixels get gradual alpha for smooth anti-aliased edges.
 */
export function removeWhiteBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      // Threshold: pixels with R, G, B all above this are considered "white"
      const HARD_THRESHOLD = 250;
      // Soft zone: pixels between SOFT and HARD get gradual transparency
      const SOFT_THRESHOLD = 235;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const min = Math.min(r, g, b);

        if (min >= HARD_THRESHOLD) {
          // Fully white → fully transparent
          data[i + 3] = 0;
        } else if (min >= SOFT_THRESHOLD) {
          // Near-white → gradual transparency for smooth edges
          const t = (min - SOFT_THRESHOLD) / (HARD_THRESHOLD - SOFT_THRESHOLD);
          data[i + 3] = Math.round(data[i + 3] * (1 - t));
        }
        // else: keep original alpha
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      // If processing fails, return original
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}
