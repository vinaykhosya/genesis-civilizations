import sharp from "sharp";

export interface ProcessedAssets {
  thumbnailWebp: Buffer;
  ogWebp: Buffer;
}

export async function processAssets(worldPngBytes: Buffer): Promise<ProcessedAssets> {
  // Generate thumbnail: 1024x1024 square, WebP format
  const thumbnailWebp = await sharp(worldPngBytes)
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 12, g: 16, b: 25, alpha: 1 }, // matches var(--bg-primary) #0C1019
    })
    .webp({ quality: 85 })
    .toBuffer();

  // Generate OpenGraph preview image: 1200x630 canvas, padded/fit
  const ogWebp = await sharp(worldPngBytes)
    .resize(1200, 630, {
      fit: "contain",
      background: { r: 12, g: 16, b: 25, alpha: 1 }, // matches var(--bg-primary) #0C1019
    })
    .webp({ quality: 85 })
    .toBuffer();

  return {
    thumbnailWebp,
    ogWebp,
  };
}
