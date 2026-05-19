import { generateToken, hashToken } from './crypto.js';

const SESSION_TTL_DAYS = 90;

export async function createSession(userId, sql) {
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000).toISOString();

  await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt})
  `;

  return token;
}

export async function verifySession(token, sql) {
  if (!token) return null;
  const tokenHash = await hashToken(token);

  const rows = await sql`
    SELECT user_id FROM sessions
    WHERE token_hash = ${tokenHash}
      AND expires_at > now()
    LIMIT 1
  `;

  if (!rows.length) return null;

  // Fire-and-forget: keep last_used_at fresh without blocking the response
  sql`UPDATE sessions SET last_used_at = now() WHERE token_hash = ${tokenHash}`.catch(() => {});

  return rows[0].user_id;
}

export async function deleteSession(token, sql) {
  if (!token) return;
  const tokenHash = await hashToken(token);
  await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}
