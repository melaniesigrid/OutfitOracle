/**
 * Cloud auth API — thin fetch wrappers for the Worker /auth/* endpoints.
 * All calls require EXPO_PUBLIC_PROXY_URL to be set.
 */

const BASE = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

export interface CloudAuthResponse {
  token: string;
  userId: string;
  email: string | null;
  name: string | null;
  isNewUser: boolean;
}

export async function cloudSignInWithApple(identityToken: string, nonce?: string): Promise<CloudAuthResponse> {
  if (!BASE) throw new Error('EXPO_PUBLIC_PROXY_URL is not set');

  const res = await fetch(`${BASE}/auth/siwa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityToken, nonce }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as { error?: string }));
    throw new Error((err as { error?: string }).error ?? `Sign in failed (${res.status})`);
  }

  return res.json() as Promise<CloudAuthResponse>;
}

export interface MigratePayload {
  styleProfile?: unknown;
  history?: unknown[];
  saved?: unknown[];
  archive?: unknown[];
  streak?: unknown;
}

export async function cloudMigrateLocalData(
  token: string,
  payload: MigratePayload,
): Promise<string[]> {
  if (!BASE || !token) return [];
  try {
    const res = await fetch(`${BASE}/data/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return [];
    const data = await res.json() as { migrated?: string[] };
    return data.migrated ?? [];
  } catch {
    return [];
  }
}

export async function cloudSignOut(token: string): Promise<void> {
  if (!BASE || !token) return;
  // Fire-and-forget — local session cleared regardless of server response
  fetch(`${BASE}/auth/session`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}
