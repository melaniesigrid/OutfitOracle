/**
 * Outfit Oracle — Cloudflare Worker proxy (Hono edition)
 *
 * Deploy:
 *   cd cloudflare-worker
 *   npm install
 *   npx wrangler kv:namespace create "RATE_LIMIT_KV"   ← copy id into wrangler.toml
 *   npx wrangler kv:namespace create "APPLE_JWKS_KV"   ← copy id into wrangler.toml
 *   npx wrangler deploy
 *   npx wrangler secret put ANTHROPIC_API_KEY
 *   npx wrangler secret put FAL_KEY
 *   npx wrangler secret put NEON_DATABASE_URL
 *   npx wrangler secret put APPLE_BUNDLE_ID
 *
 * Then in .env:
 *   EXPO_PUBLIC_PROXY_URL=https://outfit-oracle-proxy.<subdomain>.workers.dev
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import oracle from './routes/oracle.js';
import auth from './routes/auth.js';
import data from './routes/data.js';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Device-ID'],
}));

app.route('/auth', auth);
app.route('/data', data);
app.route('/', oracle);

export default app;
