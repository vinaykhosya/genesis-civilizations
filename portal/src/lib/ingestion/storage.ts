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
  replayJsonStr?: string,
  maps?: {
    biomes?: Buffer | null;
    elevation?: Buffer | null;
    temperature?: Buffer | null;
    rainfall?: Buffer | null;
    rivers?: Buffer | null;
    habitability?: Buffer | null;
    trade?: Buffer | null;
    simulation?: Buffer | null;
  }
): Promise<UploadedPaths> {
  const ensureBucketExists = async (bucket: string, isPublic: boolean) => {
    try {
      const { data: buckets } = await supabaseServer.storage.listBuckets();
      const exists = buckets?.some((b) => b.id === bucket);
      if (!exists) {
        const { error } = await supabaseServer.storage.createBucket(bucket, {
          public: isPublic
        });
        if (error) {
          console.error(`Failed to programmatically create storage bucket [${bucket}]: ${error.message}`);
        }
      }
    } catch (err: any) {
      console.error(`Error checking/creating storage bucket [${bucket}]:`, err.message);
    }
  };

  // Ensure unified public experiments bucket exists
  await ensureBucketExists("experiments", true);

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

  // Structured paths inside the unified experiments bucket
  const zipPath = `${id}/exports/package.zip`;
  const worldPngPath = `${id}/preview/world.png`;
  const thumbnailWebpPath = `${id}/preview/thumbnail.webp`;
  const ogWebpPath = `${id}/preview/og.webp`;
  const replayJsonPath = replayJsonStr ? `${id}/replay/replay.json` : undefined;

  // Execute core uploads
  await uploadToBucket("experiments", zipPath, zipBytes, "application/zip");
  if (worldPngBytes && worldPngBytes.length > 0) {
    await uploadToBucket("experiments", worldPngPath, worldPngBytes, "image/png");
  }
  if (thumbnailBytes && thumbnailBytes.length > 0) {
    await uploadToBucket("experiments", thumbnailWebpPath, thumbnailBytes, "image/webp");
  }
  if (ogBytes && ogBytes.length > 0) {
    await uploadToBucket("experiments", ogWebpPath, ogBytes, "image/webp");
  }

  if (replayJsonPath && replayJsonStr) {
    await uploadToBucket("experiments", replayJsonPath, replayJsonStr, "application/json");
  }

  // Upload atlas map files if they exist
  if (maps) {
    const uploadMap = async (filename: string, buffer?: Buffer | null) => {
      if (buffer && buffer.length > 0) {
        await uploadToBucket("experiments", `${id}/atlas/${filename}`, buffer, "image/png");
      }
    };
    await uploadMap("biomes.png", maps.biomes);
    await uploadMap("elevation.png", maps.elevation);
    await uploadMap("temperature.png", maps.temperature);
    await uploadMap("rainfall.png", maps.rainfall);
    await uploadMap("rivers.png", maps.rivers);
    await uploadMap("habitability.png", maps.habitability);
    await uploadMap("trade.png", maps.trade);
    await uploadMap("simulation.png", maps.simulation);
  }

  return {
    zipPath,
    worldPngPath,
    thumbnailWebpPath,
    ogWebpPath,
    replayJsonPath
  };
}
