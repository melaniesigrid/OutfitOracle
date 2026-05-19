/**
 * Data routes — authenticated CRUD for the five per-user data buckets.
 * Each bucket is stored as a single JSONB blob per user (last-write-wins).
 *
 * Buckets:
 *   GET/PUT /data/style-profile  → style_profiles.data
 *   GET/PUT /data/history        → outfit_history.entries
 *   GET/PUT /data/saved          → saved_outfits.entries
 *   GET/PUT /data/archive        → look_archive.entries
 *   GET/PUT /data/streak         → consult_streaks.data
 */

import { Hono } from 'hono';
import { verifySession } from '../lib/session.js';
import { getDb } from '../lib/db.js';

const data = new Hono();

// Auth middleware — validates Bearer token and attaches userId + sql to context
async function requireAuth(c, next) {
  if (!c.env.NEON_DATABASE_URL) return c.json({ error: 'Database not configured' }, 503);

  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  let sql, userId;
  try {
    sql = getDb(c.env);
    userId = await verifySession(token, sql);
  } catch {
    return c.json({ error: 'Database unavailable' }, 503);
  }
  if (!userId) return c.json({ error: 'Invalid or expired session' }, 401);

  c.set('userId', userId);
  c.set('sql', sql);
  await next();
}

data.use('*', requireAuth);

// ─── Style profile ────────────────────────────────────────────────────────────

data.get('/style-profile', async (c) => {
  const rows = await c.get('sql')`
    SELECT data FROM style_profiles WHERE user_id = ${c.get('userId')} LIMIT 1
  `;
  return c.json(rows.length ? rows[0].data : null);
});

data.put('/style-profile', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (JSON.stringify(body).length > 256_000) return c.json({ error: 'Payload too large' }, 413);
  await c.get('sql')`
    INSERT INTO style_profiles (user_id, data)
    VALUES (${c.get('userId')}, ${JSON.stringify(body)})
    ON CONFLICT (user_id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = now()
  `;
  return c.json({ ok: true });
});

// ─── Outfit history ───────────────────────────────────────────────────────────

data.get('/history', async (c) => {
  const rows = await c.get('sql')`
    SELECT entries FROM outfit_history WHERE user_id = ${c.get('userId')} LIMIT 1
  `;
  return c.json(rows.length ? rows[0].entries : []);
});

data.put('/history', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (!Array.isArray(body)) return c.json({ error: 'Expected array' }, 400);
  if (JSON.stringify(body).length > 256_000) return c.json({ error: 'Payload too large' }, 413);
  await c.get('sql')`
    INSERT INTO outfit_history (user_id, entries)
    VALUES (${c.get('userId')}, ${JSON.stringify(body)})
    ON CONFLICT (user_id) DO UPDATE
      SET entries = EXCLUDED.entries, updated_at = now()
  `;
  return c.json({ ok: true });
});

// ─── Saved outfits ────────────────────────────────────────────────────────────

data.get('/saved', async (c) => {
  const rows = await c.get('sql')`
    SELECT entries FROM saved_outfits WHERE user_id = ${c.get('userId')} LIMIT 1
  `;
  return c.json(rows.length ? rows[0].entries : []);
});

data.put('/saved', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (!Array.isArray(body)) return c.json({ error: 'Expected array' }, 400);
  if (JSON.stringify(body).length > 256_000) return c.json({ error: 'Payload too large' }, 413);
  await c.get('sql')`
    INSERT INTO saved_outfits (user_id, entries)
    VALUES (${c.get('userId')}, ${JSON.stringify(body)})
    ON CONFLICT (user_id) DO UPDATE
      SET entries = EXCLUDED.entries, updated_at = now()
  `;
  return c.json({ ok: true });
});

// ─── Look archive ─────────────────────────────────────────────────────────────

data.get('/archive', async (c) => {
  const rows = await c.get('sql')`
    SELECT entries FROM look_archive WHERE user_id = ${c.get('userId')} LIMIT 1
  `;
  return c.json(rows.length ? rows[0].entries : []);
});

data.put('/archive', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (!Array.isArray(body)) return c.json({ error: 'Expected array' }, 400);
  if (JSON.stringify(body).length > 256_000) return c.json({ error: 'Payload too large' }, 413);
  await c.get('sql')`
    INSERT INTO look_archive (user_id, entries)
    VALUES (${c.get('userId')}, ${JSON.stringify(body)})
    ON CONFLICT (user_id) DO UPDATE
      SET entries = EXCLUDED.entries, updated_at = now()
  `;
  return c.json({ ok: true });
});

// ─── Consult streak ───────────────────────────────────────────────────────────

data.get('/streak', async (c) => {
  const rows = await c.get('sql')`
    SELECT data FROM consult_streaks WHERE user_id = ${c.get('userId')} LIMIT 1
  `;
  return c.json(rows.length ? rows[0].data : null);
});

data.put('/streak', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (JSON.stringify(body).length > 64_000) return c.json({ error: 'Payload too large' }, 413);
  await c.get('sql')`
    INSERT INTO consult_streaks (user_id, data)
    VALUES (${c.get('userId')}, ${JSON.stringify(body)})
    ON CONFLICT (user_id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = now()
  `;
  return c.json({ ok: true });
});

// ─── One-time local → cloud migration ────────────────────────────────────────
//
// Called once after first Sign in with Apple on a device that has local data.
// Uses INSERT ... ON CONFLICT DO NOTHING so the cloud always wins — if the user
// already has cloud data for a bucket (e.g. from another device), it is kept.
//
// Idempotent: safe to call multiple times.

data.post('/migrate', async (c) => {
  const userId = c.get('userId');
  const sql = c.get('sql');

  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const migrated = [];

  if (body.styleProfile != null) {
    const result = await sql`
      INSERT INTO style_profiles (user_id, data)
      VALUES (${userId}, ${JSON.stringify(body.styleProfile)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    if (result.length) migrated.push('styleProfile');
  }

  if (Array.isArray(body.history) && body.history.length) {
    const result = await sql`
      INSERT INTO outfit_history (user_id, entries)
      VALUES (${userId}, ${JSON.stringify(body.history)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    if (result.length) migrated.push('history');
  }

  if (Array.isArray(body.saved) && body.saved.length) {
    const result = await sql`
      INSERT INTO saved_outfits (user_id, entries)
      VALUES (${userId}, ${JSON.stringify(body.saved)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    if (result.length) migrated.push('saved');
  }

  if (Array.isArray(body.archive) && body.archive.length) {
    const result = await sql`
      INSERT INTO look_archive (user_id, entries)
      VALUES (${userId}, ${JSON.stringify(body.archive)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    if (result.length) migrated.push('archive');
  }

  if (body.streak != null) {
    const result = await sql`
      INSERT INTO consult_streaks (user_id, data)
      VALUES (${userId}, ${JSON.stringify(body.streak)})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    if (result.length) migrated.push('streak');
  }

  return c.json({ migrated });
});

export default data;
