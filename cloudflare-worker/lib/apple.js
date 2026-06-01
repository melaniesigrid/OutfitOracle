/**
 * Sign in with Apple — server-side JWT verification via Apple's public JWKS.
 *
 * Verification steps:
 *   1. Split JWT, decode header to get kid
 *   2. Fetch/cache Apple's JWKS (24 h KV cache)
 *   3. Import the matching RSA public key with crypto.subtle
 *   4. Verify RS256 signature
 *   5. Validate iss / aud / exp claims
 *   6. Return { sub, email }
 */

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const JWKS_CACHE_TTL = 86400; // 24 hours

function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJwtPart(b64url) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(b64url)));
}

async function fetchAppleJwks(env) {
  if (env.APPLE_JWKS_KV) {
    const cached = await env.APPLE_JWKS_KV.get('jwks', { type: 'json' });
    if (cached) return cached;
  }

  const resp = await fetch(APPLE_JWKS_URL);
  if (!resp.ok) throw new Error(`Failed to fetch Apple JWKS: ${resp.status}`);
  const jwks = await resp.json();

  if (env.APPLE_JWKS_KV) {
    env.APPLE_JWKS_KV.put('jwks', JSON.stringify(jwks), { expirationTtl: JWKS_CACHE_TTL }).catch(() => {});
  }

  return jwks;
}

export async function verifyAppleToken(identityToken, bundleId, env, rawNonce) {
  const parts = identityToken.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT: expected 3 parts');

  const header = decodeJwtPart(parts[0]);
  if (header.alg !== 'RS256') throw new Error(`Unexpected JWT alg: ${header.alg}`);

  const jwks = await fetchAppleJwks(env);
  const jwk = jwks.keys?.find(k => k.kid === header.kid);
  if (!jwk) throw new Error(`No Apple key found for kid: ${header.kid}`);

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = b64urlToBytes(parts[2]);

  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signature, signedData);
  if (!valid) throw new Error('Apple token signature is invalid');

  const payload = decodeJwtPart(parts[1]);
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== 'https://appleid.apple.com') {
    throw new Error(`Invalid issuer: ${payload.iss}`);
  }
  if (payload.aud !== bundleId) {
    throw new Error(`Invalid audience: ${payload.aud}`);
  }
  if (!payload.exp || payload.exp < now) {
    throw new Error('Apple token has expired');
  }
  if (payload.iat && now - payload.iat > 600) {
    throw new Error('Apple token is too old (max age: 10 minutes)');
  }

  if (rawNonce) {
    const nonceHashBytes = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(rawNonce),
    );
    const nonceHash = Array.from(new Uint8Array(nonceHashBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    // nonce_supported: false means Apple did not include the nonce in the token.
    // A rawNonce was sent — if the token lacks nonce support, reject it as the
    // nonce cannot be verified (prevents nonce-bypass via replayed device credentials).
    if (!payload.nonce_supported || !payload.nonce) {
      throw new Error('Apple token does not contain nonce — cannot verify');
    }
    if (payload.nonce !== nonceHash) {
      throw new Error('Apple token nonce mismatch');
    }
  }

  return { sub: payload.sub, email: payload.email ?? null };
}
