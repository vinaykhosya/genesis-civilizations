// Cryptographic auth helpers using standard Web Crypto APIs (compatible with Next.js Edge)

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin-genesis";
const SESSION_SECRET = process.env.SESSION_SECRET || "genesis-system-key-2026";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(): Promise<string> {
  // Session token = SHA-256(ADMIN_PASSWORD + SESSION_SECRET)
  const token = await sha256(ADMIN_PASSWORD + SESSION_SECRET);
  return `session:${token}:${Date.now()}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  if (!token.startsWith("session:")) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const expectedToken = await sha256(ADMIN_PASSWORD + SESSION_SECRET);
  const tokenHash = parts[1];
  const timestamp = parseInt(parts[2], 10);

  // Check if hash matches
  if (tokenHash !== expectedToken) return false;

  // Session expiry after 24 hours (86,400,000 ms)
  const isExpired = Date.now() - timestamp > 86400000;
  return !isExpired;
}
