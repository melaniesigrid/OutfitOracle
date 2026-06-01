/**
 * Google Sign-In — server-side ID token verification.
 *
 * Verification steps:
 *   1. Call Google's tokeninfo endpoint to validate the JWT signature
 *   2. Validate aud matches our client ID
 *   3. Validate exp hasn't passed
 *   4. Return { sub, email, name }
 *
 * In production you can cache the public JWKS and verify locally (like apple.js),
 * but the tokeninfo endpoint is simpler and acceptable for low-traffic apps.
 */

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

export async function verifyGoogleToken(idToken, clientId) {
  if (!idToken) throw new Error('idToken is required');

  const url = `${TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`;
  const resp = await fetch(url);

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Google tokeninfo rejected token: ${resp.status} ${body}`);
  }

  const payload = await resp.json();

  if (payload.error_description) {
    throw new Error(`Google token error: ${payload.error_description}`);
  }

  if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
    throw new Error(`Google token invalid issuer: ${payload.iss}`);
  }
  if (payload.email_verified === false || payload.email_verified === 'false') {
    throw new Error('Google account email is not verified');
  }

  // Validate audience matches our client ID (can be web or iOS client ID)
  if (clientId && payload.aud !== clientId) {
    // Google ID tokens issued to iOS clients have audience = iosClientId.
    // If the caller passes multiple valid client IDs as a comma-separated list,
    // accept any of them. This handles the case where both web and iOS client IDs
    // are valid audiences for the same server.
    const validIds = clientId.split(',').map(s => s.trim());
    if (!validIds.includes(payload.aud)) {
      throw new Error(`Google token audience mismatch: got ${payload.aud}`);
    }
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || Number(payload.exp) < now) {
    throw new Error('Google token has expired');
  }

  if (!payload.sub) throw new Error('Google token missing sub claim');

  return {
    sub: payload.sub,
    email: payload.email ?? null,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
  };
}
