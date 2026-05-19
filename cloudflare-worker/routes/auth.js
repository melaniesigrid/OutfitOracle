import { Hono } from 'hono';
import { verifyAppleToken } from '../lib/apple.js';
import { verifyGoogleToken } from '../lib/google.js';
import { verifyFacebookToken } from '../lib/facebook.js';
import { createSession, deleteSession, verifySession } from '../lib/session.js';
import { getDb } from '../lib/db.js';

const auth = new Hono();

// POST /auth/siwa — verify Apple identity token, upsert user, issue session token
auth.post('/siwa', async (c) => {
  const env = c.env;

  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const { identityToken, nonce } = body ?? {};
  if (typeof identityToken !== 'string' || !identityToken) {
    return c.json({ error: 'identityToken required' }, 400);
  }

  if (!env.APPLE_BUNDLE_ID) {
    return c.json({ error: 'Server misconfiguration: APPLE_BUNDLE_ID not set' }, 500);
  }
  if (!env.NEON_DATABASE_URL) {
    return c.json({ error: 'Server misconfiguration: NEON_DATABASE_URL not set' }, 500);
  }

  let appleUser;
  try {
    appleUser = await verifyAppleToken(identityToken, env.APPLE_BUNDLE_ID, env, nonce);
  } catch (e) {
    return c.json({ error: `Apple token verification failed: ${e.message}` }, 401);
  }

  const sql = getDb(env);

  // Upsert user — Apple only sends email on first sign-in; preserve existing email after that
  const rows = await sql`
    INSERT INTO users (apple_sub, email)
    VALUES (${appleUser.sub}, ${appleUser.email})
    ON CONFLICT (apple_sub) DO UPDATE
      SET email      = COALESCE(EXCLUDED.email, users.email),
          updated_at = now()
    RETURNING id, email, name, created_at
  `;

  const user = rows[0];
  const createdMs = new Date(user.created_at).getTime();
  const isNewUser = Date.now() - createdMs < 10_000;

  const token = await createSession(user.id, sql);

  return c.json({
    token,
    userId: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    isNewUser,
  });
});

// POST /auth/google — verify Google ID token, upsert user, issue session token
auth.post('/google', async (c) => {
  const env = c.env;

  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const { idToken } = body ?? {};
  if (typeof idToken !== 'string' || !idToken) {
    return c.json({ error: 'idToken required' }, 400);
  }

  if (!env.GOOGLE_CLIENT_ID) {
    return c.json({ error: 'Server misconfiguration: GOOGLE_CLIENT_ID not set' }, 500);
  }
  if (!env.NEON_DATABASE_URL) {
    return c.json({ error: 'Server misconfiguration: NEON_DATABASE_URL not set' }, 500);
  }

  let googleUser;
  try {
    googleUser = await verifyGoogleToken(idToken, env.GOOGLE_CLIENT_ID);
  } catch (e) {
    return c.json({ error: `Google token verification failed: ${e.message}` }, 401);
  }

  const sql = getDb(env);

  const rows = await sql`
    INSERT INTO users (google_sub, email, name)
    VALUES (${googleUser.sub}, ${googleUser.email}, ${googleUser.name})
    ON CONFLICT (google_sub) DO UPDATE
      SET email      = COALESCE(EXCLUDED.email, users.email),
          name       = COALESCE(EXCLUDED.name, users.name),
          updated_at = now()
    RETURNING id, email, name, created_at
  `;

  const user = rows[0];
  const isNewUser = Date.now() - new Date(user.created_at).getTime() < 10_000;
  const token = await createSession(user.id, sql);

  return c.json({ token, userId: user.id, email: user.email ?? null, name: user.name ?? null, isNewUser });
});

// POST /auth/facebook — verify Facebook access token, upsert user, issue session token
auth.post('/facebook', async (c) => {
  const env = c.env;

  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const { accessToken } = body ?? {};
  if (typeof accessToken !== 'string' || !accessToken) {
    return c.json({ error: 'accessToken required' }, 400);
  }

  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    return c.json({ error: 'Server misconfiguration: FACEBOOK_APP_ID/SECRET not set' }, 500);
  }
  if (!env.NEON_DATABASE_URL) {
    return c.json({ error: 'Server misconfiguration: NEON_DATABASE_URL not set' }, 500);
  }

  let fbUser;
  try {
    fbUser = await verifyFacebookToken(accessToken, env.FACEBOOK_APP_ID, env.FACEBOOK_APP_SECRET);
  } catch (e) {
    return c.json({ error: `Facebook token verification failed: ${e.message}` }, 401);
  }

  const sql = getDb(env);

  const rows = await sql`
    INSERT INTO users (facebook_sub, email, name)
    VALUES (${fbUser.sub}, ${fbUser.email}, ${fbUser.name})
    ON CONFLICT (facebook_sub) DO UPDATE
      SET email      = COALESCE(EXCLUDED.email, users.email),
          name       = COALESCE(EXCLUDED.name, users.name),
          updated_at = now()
    RETURNING id, email, name, created_at
  `;

  const user = rows[0];
  const isNewUser = Date.now() - new Date(user.created_at).getTime() < 10_000;
  const token = await createSession(user.id, sql);

  return c.json({ token, userId: user.id, email: user.email ?? null, name: user.name ?? null, isNewUser });
});

// DELETE /auth/session — invalidate the current session (sign out)
auth.delete('/session', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return c.json({ error: 'No session token provided' }, 401);

  if (!c.env.NEON_DATABASE_URL) return c.json({ ok: true }); // no-op if DB not configured

  const sql = getDb(c.env);
  await deleteSession(token, sql);
  return c.json({ ok: true });
});

// GET /auth/me — return the authenticated user's profile
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.NEON_DATABASE_URL) return c.json({ error: 'Database not configured' }, 503);

  const sql = getDb(c.env);
  const userId = await verifySession(token, sql);
  if (!userId) return c.json({ error: 'Invalid or expired session' }, 401);

  const rows = await sql`SELECT id, email, name FROM users WHERE id = ${userId} LIMIT 1`;
  if (!rows.length) return c.json({ error: 'User not found' }, 404);

  return c.json(rows[0]);
});

export default auth;
