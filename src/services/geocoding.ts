import { CityDef } from '@/data/weatherData';

export const API_LIMITS = {
  'open-meteo-free': {
    requestsPerDay: 10000,
    requestsPerMinute: 600,
    costPerCity: 3,
  },
};

const searchCache = new Map<string, CityDef[]>();

let callTimestamps: number[] = [];
export function trackApiCall() {
  const now = Date.now();
  callTimestamps.push(now);
  callTimestamps = callTimestamps.filter(t => now - t < 60_000);
}
export function getApiStats() {
  const now = Date.now();
  callTimestamps = callTimestamps.filter(t => now - t < 60_000);
  return { callsThisMinute: callTimestamps.length };
}

interface GeocodingResult {
  name: string;
  country_code?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function searchCities(query: string): Promise<CityDef[]> {
  const q = query.trim();
  if (!q) return [];
  if (searchCache.has(q)) return searchCache.get(q)!;
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=20&language=en&format=json`);
    if (!r.ok) return [];
    const data = await r.json() as { results?: GeocodingResult[] };
    const results = data.results || [];
    const seen = new Set<string>();
    const out: CityDef[] = [];
    for (const r of results) {
      const country = r.country_code || r.country || '';
      const k = `${r.name}|${country}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ city: r.name, country, lat: r.latitude, lng: r.longitude });
    }
    searchCache.set(q, out);
    return out;
  } catch {
    return [];
  }
}
