import { supabaseServer } from "@/lib/supabase-server";

export async function rollbackStagingAssets(id: string, hasReplay = false): Promise<void> {
  const deleteFile = async (bucket: string, path: string) => {
    try {
      await supabaseServer.storage.from(bucket).remove([path]);
    } catch (err) {
      console.error(`Rollback warning: failed to delete ${path} from bucket ${bucket}:`, err);
    }
  };

  const zipPath = `${id}/export.zip`;
  const worldPngPath = `${id}/world.png`;
  const thumbnailWebpPath = `${id}/thumbnail.webp`;
  const ogWebpPath = `${id}/og.webp`;
  const replayJsonPath = `${id}/replay.json`;

  await Promise.all([
    deleteFile("experiment-zips", zipPath),
    deleteFile("thumbnails", worldPngPath),
    deleteFile("thumbnails", thumbnailWebpPath),
    deleteFile("thumbnails", ogWebpPath),
    hasReplay ? deleteFile("replays", replayJsonPath) : Promise.resolve()
  ]);
}
