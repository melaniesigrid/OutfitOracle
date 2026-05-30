/**
 * Facebook Sign-In — server-side access token verification.
 *
 * Verification steps:
 *   1. Generate an app access token (appId|appSecret)
 *   2. Call Facebook's debug_token endpoint to validate the user access token
 *   3. Validate app_id matches our app ID
 *   4. Validate the token hasn't expired
 *   5. Fetch basic profile (id, name, email) via graph API
 *   6. Return { sub, email, name }
 */

const GRAPH_URL = 'https://graph.facebook.com/v21.0';

export async function verifyFacebookToken(accessToken, appId, appSecret) {
  if (!accessToken) throw new Error('accessToken is required');
  if (!appId || !appSecret) throw new Error('FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be set');

  const appToken = `${appId}|${appSecret}`;

  // Validate the user access token against our app
  const debugUrl = `${GRAPH_URL}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appToken)}`;
  const debugResp = await fetch(debugUrl);

  if (!debugResp.ok) {
    throw new Error(`Facebook debug_token request failed: ${debugResp.status}`);
  }

  const { data: debugData } = await debugResp.json();

  if (!debugData?.is_valid) {
    throw new Error(`Facebook token is invalid: ${debugData?.error?.message ?? 'unknown'}`);
  }

  if (debugData.app_id !== appId) {
    throw new Error(`Facebook token app_id mismatch: got ${debugData.app_id}`);
  }

  const now = Math.floor(Date.now() / 1000);
  if (debugData.expires_at && debugData.expires_at < now) {
    throw new Error('Facebook token has expired');
  }

  // Fetch profile — email is only returned if the user granted email permission
  const profileUrl = `${GRAPH_URL}/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
  const profileResp = await fetch(profileUrl);

  if (!profileResp.ok) {
    throw new Error(`Facebook profile fetch failed: ${profileResp.status}`);
  }

  const profile = await profileResp.json();

  if (!profile.id) throw new Error('Facebook profile missing id');

  return {
    sub: profile.id,
    email: profile.email ?? null,
    name: profile.name ?? null,
  };
}
