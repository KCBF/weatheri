import { CityDef, DailyData, MonthSummary } from '@/data/weatherData';
import { trackApiCall } from './geocoding';

export const CLIMATE_MODELS = ['CMCC_CM2_VHR4', 'EC_Earth3P_HR', 'MRI_AGCM3_2_S'];

const DAILY_VARS = 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max';

function parseMonth(dateStr: string): number {
  return parseInt(dateStr.slice(5, 7), 10) - 1;
}

function pad(n: number) { return n.toString().padStart(2, '0'); }
function fmtDate(d: Date) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`; }

interface DailyResponse {
  daily?: Record<string, (number | null)[]>;
}

function extractDaily(resp: DailyResponse, modelSuffix?: string): DailyData[] {
  if (!resp.daily) return [];
  const d = resp.daily;
  // Find keys (may have model suffix for climate API)
  const keyFor = (base: string): string | undefined => {
    if (d[base]) return base;
    const k = Object.keys(d).find(k => k.startsWith(base));
    return k;
  };
  const kDate = keyFor('time');
  const kMax = keyFor('temperature_2m_max');
  const kMin = keyFor('temperature_2m_min');
  const kMean = keyFor('temperature_2m_mean');
  const kPrec = keyFor('precipitation_sum');
  const kWind = keyFor('wind_speed_10m_max');
  if (!kDate || !d[kDate]) return [];
  const dates = d[kDate] as unknown as string[];
  const out: DailyData[] = [];
  for (let i = 0; i < dates.length; i++) {
    const tMax = kMax ? d[kMax]?.[i] : null;
    const tMin = kMin ? d[kMin]?.[i] : null;
    const tMeanRaw = kMean ? d[kMean]?.[i] : null;
    const prec = kPrec ? d[kPrec]?.[i] : null;
    const wind = kWind ? d[kWind]?.[i] : null;
    const tMean = tMeanRaw ?? ((tMax != null && tMin != null) ? (tMax + tMin) / 2 : null);
    if (tMax == null && tMin == null && prec == null) continue;
    out.push({
      date: dates[i],
      tempMax: tMax ?? 0,
      tempMin: tMin ?? 0,
      tempMean: tMean ?? 0,
      precipitation: prec ?? 0,
      windMax: wind ?? 0,
    });
  }
  return out;
  void modelSuffix;
}

async function fetchJson(url: string): Promise<DailyResponse> {
  trackApiCall();
  const r = await fetch(url);
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

async function fetchArchive(city: CityDef, start: string, end: string): Promise<DailyData[]> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lng}&start_date=${start}&end_date=${end}&daily=${DAILY_VARS}&timezone=auto`;
  return extractDaily(await fetchJson(url));
}

async function fetchForecast(city: CityDef): Promise<DailyData[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&daily=${DAILY_VARS}&past_days=92&forecast_days=16&timezone=auto`;
  return extractDaily(await fetchJson(url));
}

async function fetchClimate(city: CityDef, start: string, end: string, model: string): Promise<DailyData[]> {
  const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${city.lat}&longitude=${city.lng}&start_date=${start}&end_date=${end}&models=${model}&daily=${DAILY_VARS}`;
  return extractDaily(await fetchJson(url), model);
}

export async function fetchCityYear(city: CityDef, year: number, climateModel: string): Promise<DailyData[]> {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  if (year < currentYear) {
    return fetchArchive(city, start, end);
  }
  if (year > currentYear) {
    return fetchClimate(city, start, end, climateModel);
  }
  // current year
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  const archiveEnd = fmtDate(yesterday);

  const [arch, fore, clim] = await Promise.allSettled([
    fetchArchive(city, start, archiveEnd),
    fetchForecast(city),
    fetchClimate(city, start, end, climateModel),
  ]);

  const map = new Map<string, DailyData>();
  // climate first (lowest priority)
  if (clim.status === 'fulfilled') clim.value.forEach(d => map.set(d.date, d));
  if (fore.status === 'fulfilled') fore.value.forEach(d => map.set(d.date, d));
  if (arch.status === 'fulfilled') arch.value.forEach(d => map.set(d.date, d));

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateToMonthly(daily: DailyData[]): MonthSummary[] {
  const buckets: DailyData[][] = Array.from({ length: 12 }, () => []);
  for (const d of daily) {
    const m = parseMonth(d.date);
    if (m >= 0 && m < 12) buckets[m].push(d);
  }
  return buckets.map((rows, month) => {
    if (rows.length === 0) {
      return { month, tempAvg: 0, tempHigh: 0, tempLow: 0, rain: 0, rainDays: 0, windAvg: 0, windMax: 0 };
    }
    const tempAvg = rows.reduce((s, r) => s + r.tempMean, 0) / rows.length;
    const tempHigh = Math.max(...rows.map(r => r.tempMax));
    const tempLow = Math.min(...rows.map(r => r.tempMin));
    const rain = rows.reduce((s, r) => s + r.precipitation, 0);
    const rainDays = rows.filter(r => r.precipitation >= 1).length;
    const windAvg = rows.reduce((s, r) => s + r.windMax, 0) / rows.length;
    const windMax = Math.max(...rows.map(r => r.windMax));
    return { month, tempAvg, tempHigh, tempLow, rain, rainDays, windAvg, windMax };
  });
}
