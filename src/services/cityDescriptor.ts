import { saveCityDescriptor } from '../hooks/useCityPassport';

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

export async function fetchCityDescriptor(city: string, country: string): Promise<string | null> {
  if (!PROXY_URL) return null;
  try {
    const resp = await fetch(`${PROXY_URL}/city-descriptor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, country }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const descriptor = typeof data.descriptor === 'string' ? data.descriptor.trim() : null;
    if (descriptor) saveCityDescriptor(city, descriptor);
    return descriptor;
  } catch {
    return null;
  }
}
