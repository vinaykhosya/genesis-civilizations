import { supabaseServer } from "@/lib/supabase-server";
import { IngestionError } from "./types";

export interface UploadedPaths {
  zipPath: string;
  worldPngPath: string;
  thumbnailWebpPath: string;
  ogWebpPath: string;
  replayJsonPath?: string;
}

export async function uploadAssets(
  id: string,
  zipBytes: Buffer,
  worldPngBytes: Buffer,
  thumbnailBytes: Buffer,
  ogBytes: Buffer,
  replayJsonStr?: string
): Promise<UploadedPaths> {
  const uploadToBucket = async (bucket: string, path: string, body: Buffer | string, contentType: string) => {
    const { error } = await supabaseServer.storage
      .from(bucket)
      .upload(path, body, {
        contentType,
        upsert: true
      });

    if (error) {
      throw {
        file: path,
        message: `Failed to upload asset to storage [${bucket}]: ${error.message}`,
        tier: "structural"
      } as IngestionError;
    }
  };

  const zipPath = `${id}/export.zip`;
  const worldPngPath = `${id}/world.png`;
  const thumbnailWebpPath = `${id}/thumbnail.webp`;
  const ogWebpPath = `${id}/og.webp`;
  const replayJsonPath = replayJsonStr ? `${id}/replay.json` : undefined;

  // Execute storage uploads
  await uploadToBucket("experiment-zips", zipPath, zipBytes, "application/zip");
  await uploadToBucket("thumbnails", worldPngPath, worldPngBytes, "image/png");
  await uploadToBucket("thumbnails", thumbnailWebpPath, thumbnailBytes, "image/webp");
  await uploadToBucket("thumbnails", ogWebpPath, ogBytes, "image/webp");

  if (replayJsonPath && replayJsonStr) {
    await uploadToBucket("replays", replayJsonPath, replayJsonStr, "application/json");
  }

  return {
    zipPath,
    worldPngPath,
    thumbnailWebpPath,
    ogWebpPath,
    replayJsonPath
  };
}
