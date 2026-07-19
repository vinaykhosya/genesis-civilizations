/**
 * In-memory staging store for experiment uploads.
 *
 * On Vercel, serverless functions are ephemeral — filesystem writes
 * (`generated/`) vanish between requests. This module keeps staged data
 * in a process-level Map so upload → publish works within the same
 * function invocation lifetime (typical: < 5 min review window).
 *
 * For longer sessions, consider Supabase Storage as a staging bucket.
 */

interface StagingEntry {
  parsed: any;
  health: any;
  zipBytes: Uint8Array;
  createdAt: number;
}

// Module-level store — persists across requests in the same process instance
const stagingStore = new Map<string, StagingEntry>();

const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function stageExperiment(stagingId: string, parsed: any, health: any, zipBytes: Uint8Array): void {
  // Evict expired entries to prevent memory leaks
  const now = Date.now();
  for (const [key, entry] of stagingStore.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      stagingStore.delete(key);
    }
  }
  stagingStore.set(stagingId, { parsed, health, zipBytes, createdAt: now });
}

export function getStaged(stagingId: string): StagingEntry | null {
  const entry = stagingStore.get(stagingId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    stagingStore.delete(stagingId);
    return null;
  }
  return entry;
}

export function clearStaged(stagingId: string): void {
  stagingStore.delete(stagingId);
}
