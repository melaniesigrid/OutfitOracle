/**
 * Cloud data helpers — read/write per-user data buckets via the Worker /data/* endpoints.
 * Token is the opaque Bearer token from AuthContext.
 */

const BASE = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

export async function cloudGet<T>(endpoint: string, token: string): Promise<T | null> {
  if (!BASE || !token) return null;
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export function cloudPut(endpoint: string, token: string | null, data: unknown): void {
  if (!BASE || !token) return;
  fetch(`${BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).catch(() => {});
}
