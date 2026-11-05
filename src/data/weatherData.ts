export interface CityDef {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface DailyData {
  date: string;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precipitation: number;
  windMax: number;
}

export interface MonthSummary {
  month: number;
  tempAvg: number;
  tempHigh: number;
  tempLow: number;
  rain: number;
  rainDays: number;
  windAvg: number;
  windMax: number;
}

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MAX_ACTIVE_CITIES = 100;

export type MetricKey = 'tempAvg' | 'tempHigh' | 'tempLow' | 'rain' | 'rainDays' | 'wind' | 'season' | 'floodRisk' | 'disasterRisk';

export const ALL_METRICS: MetricKey[] = ['tempAvg','tempHigh','tempLow','rain','rainDays','wind','season','floodRisk','disasterRisk'];

export const DEFAULT_CITIES: CityDef[] = [
  { city: 'San Francisco', country: 'US', lat: 37.77, lng: -122.42 },
  { city: 'Stockholm', country: 'SE', lat: 59.33, lng: 18.07 },
  { city: 'Ho Chi Minh City', country: 'VN', lat: 10.82, lng: 106.63 },
];

export const PRESET_CITIES: CityDef[] = [
  { city: 'Ho Chi Minh City', country: 'VN', lat: 10.82, lng: 106.63 },
  { city: 'Hanoi', country: 'VN', lat: 21.03, lng: 105.85 },
  { city: 'Da Lat', country: 'VN', lat: 11.94, lng: 108.44 },
  { city: 'Hue', country: 'VN', lat: 16.46, lng: 107.59 },
  { city: 'Da Nang', country: 'VN', lat: 16.05, lng: 108.21 },
  { city: 'Hong Kong', country: 'HK', lat: 22.32, lng: 114.17 },
  { city: 'San Francisco', country: 'US', lat: 37.77, lng: -122.42 },
  { city: 'New York', country: 'US', lat: 40.71, lng: -74.01 },
  { city: 'Los Angeles', country: 'US', lat: 34.05, lng: -118.24 },
  { city: 'Austin', country: 'US', lat: 30.27, lng: -97.74 },
  { city: 'Tokyo', country: 'JP', lat: 35.68, lng: 139.69 },
  { city: 'Singapore', country: 'SG', lat: 1.35, lng: 103.82 },
  { city: 'Bangkok', country: 'TH', lat: 13.75, lng: 100.50 },
  { city: 'Bali', country: 'ID', lat: -8.41, lng: 115.19 },
  { city: 'Shenzhen', country: 'CN', lat: 22.54, lng: 114.06 },
  { city: 'Beijing', country: 'CN', lat: 39.90, lng: 116.41 },
  { city: 'Shanghai', country: 'CN', lat: 31.23, lng: 121.47 },
  { city: 'London', country: 'GB', lat: 51.51, lng: -0.13 },
  { city: 'Paris', country: 'FR', lat: 48.85, lng: 2.35 },
  { city: 'Berlin', country: 'DE', lat: 52.52, lng: 13.40 },
  { city: 'Helsinki', country: 'FI', lat: 60.17, lng: 24.94 },
  { city: 'Sydney', country: 'AU', lat: -33.87, lng: 151.21 },
  { city: 'Melbourne', country: 'AU', lat: -37.81, lng: 144.96 },
  { city: 'Seoul', country: 'KR', lat: 37.57, lng: 126.98 },
  { city: 'Taipei', country: 'TW', lat: 25.03, lng: 121.57 },
  { city: 'Mumbai', country: 'IN', lat: 19.08, lng: 72.88 },
  { city: 'Dubai', country: 'AE', lat: 25.20, lng: 55.27 },
  { city: 'Istanbul', country: 'TR', lat: 41.01, lng: 28.98 },
  { city: 'Cairo', country: 'EG', lat: 30.04, lng: 31.24 },
  { city: 'Sao Paulo', country: 'BR', lat: -23.55, lng: -46.63 },
  { city: 'Mexico City', country: 'MX', lat: 19.43, lng: -99.13 },
  { city: 'Toronto', country: 'CA', lat: 43.65, lng: -79.38 },
  { city: 'Vancouver', country: 'CA', lat: 49.28, lng: -123.12 },
  { city: 'Moscow', country: 'RU', lat: 55.75, lng: 37.62 },
  { city: 'Madrid', country: 'ES', lat: 40.42, lng: -3.70 },
  { city: 'Rome', country: 'IT', lat: 41.90, lng: 12.50 },
  { city: 'Amsterdam', country: 'NL', lat: 52.37, lng: 4.90 },
  { city: 'Kuala Lumpur', country: 'MY', lat: 3.14, lng: 101.69 },
  { city: 'Manila', country: 'PH', lat: 14.60, lng: 120.98 },
  { city: 'Jakarta', country: 'ID', lat: -6.21, lng: 106.85 },
  { city: 'Nairobi', country: 'KE', lat: -1.29, lng: 36.82 },
  { city: 'Cape Town', country: 'ZA', lat: -33.92, lng: 18.42 },
  { city: 'Buenos Aires', country: 'AR', lat: -34.60, lng: -58.38 },
  { city: 'Lima', country: 'PE', lat: -12.05, lng: -77.04 },
  { city: 'Bogota', country: 'CO', lat: 4.71, lng: -74.07 },
  { city: 'Osaka', country: 'JP', lat: 34.69, lng: 135.50 },
  { city: 'Chiang Mai', country: 'TH', lat: 18.79, lng: 98.98 },
  { city: 'Phnom Penh', country: 'KH', lat: 11.56, lng: 104.92 },
  { city: 'Yangon', country: 'MM', lat: 16.87, lng: 96.20 },
];

export interface SeasonInfo {
  season: 'wet' | 'dry' | 'transition';
  floodRisk: 'none' | 'low' | 'moderate' | 'high';
  disasterRisks: string[];
}

// Helper builders
const months = (pattern: ('wet'|'dry'|'transition')[], floods: ('none'|'low'|'moderate'|'high')[], disasters: string[][]): SeasonInfo[] =>
  pattern.map((s, i) => ({ season: s, floodRisk: floods[i], disasterRisks: disasters[i] }));

const W='wet' as const, D='dry' as const, T='transition' as const;
const N='none' as const, L='low' as const, M='moderate' as const, H='high' as const;
const NO: string[] = [];

export const SEASONAL_DATA: Record<string, SeasonInfo[]> = {
  'Ho Chi Minh City': months(
    [D,D,D,T,W,W,W,W,W,W,W,T],
    [N,N,N,L,M,H,H,H,H,H,M,L],
    [NO,NO,NO,NO,['flood'],['flood','storm'],['flood','storm'],['flood','storm'],['flood','typhoon'],['flood','typhoon'],['flood'],NO]
  ),
  'Hanoi': months(
    [D,D,T,T,W,W,W,W,W,T,D,D],
    [N,N,L,L,M,H,H,H,M,L,N,N],
    [['cold'],['cold'],NO,NO,['storm'],['typhoon','flood'],['typhoon','flood'],['typhoon','flood'],['typhoon'],NO,NO,['cold']]
  ),
  'Da Lat': months(
    [D,D,T,T,W,W,W,W,W,W,T,D],
    [N,N,L,L,M,M,M,M,M,M,L,N],
    [NO,NO,NO,NO,['landslide'],['landslide','flood'],['landslide','flood'],['landslide','flood'],['landslide'],['landslide'],NO,NO]
  ),
  'Hue': months(
    [W,T,D,D,D,D,D,T,W,W,W,W],
    [M,L,N,N,N,N,N,L,H,H,H,M],
    [['flood'],NO,NO,NO,NO,NO,NO,['storm'],['typhoon','flood'],['typhoon','flood'],['typhoon','flood'],['flood']]
  ),
  'Hong Kong': months(
    [D,D,T,T,W,W,W,W,W,T,D,D],
    [N,N,L,L,M,H,H,H,H,L,N,N],
    [NO,NO,NO,NO,['storm'],['typhoon'],['typhoon'],['typhoon'],['typhoon'],['typhoon'],NO,NO]
  ),
  'San Francisco': months(
    [W,W,W,T,D,D,D,D,T,T,W,W],
    [M,M,L,L,N,N,N,N,N,L,M,M],
    [['storm'],['storm'],NO,NO,['wildfire'],['wildfire'],['wildfire'],['wildfire'],['wildfire','heat'],['wildfire'],['storm'],['storm']]
  ),
  'Austin': months(
    [D,D,T,W,W,T,D,D,T,W,T,D],
    [N,N,L,M,M,L,N,N,L,M,L,N],
    [['cold'],['tornado'],['tornado'],['tornado','flood'],['tornado','flood'],['heat'],['heat'],['heat','drought'],['heat'],['flood'],NO,NO]
  ),
  'Tokyo': months(
    [D,D,T,T,T,W,W,W,W,T,D,D],
    [N,N,L,L,L,M,M,H,H,M,N,N],
    [['cold'],['cold'],NO,NO,NO,['typhoon'],['typhoon','heat'],['typhoon','heat'],['typhoon'],['typhoon'],NO,['cold']]
  ),
  'Singapore': months(
    [W,T,T,T,T,T,T,T,T,T,W,W],
    [H,M,L,L,L,L,L,L,L,M,H,H],
    [['flood'],NO,NO,NO,NO,['haze'],['haze'],['haze'],['haze'],NO,['flood'],['flood']]
  ),
  'Bangkok': months(
    [D,D,T,T,W,W,W,W,W,W,T,D],
    [N,N,L,L,M,H,H,H,H,H,L,N],
    [NO,NO,NO,NO,['flood'],['flood'],['flood'],['flood'],['flood'],['flood'],NO,NO]
  ),
  'Bali': months(
    [W,W,W,T,D,D,D,D,D,T,W,W],
    [H,H,M,L,N,N,N,N,N,L,M,H],
    [['flood'],['flood'],['flood'],NO,NO,NO,NO,NO,NO,NO,['flood'],['flood']]
  ),
  'Shenzhen': months(
    [D,D,T,W,W,W,W,W,W,T,D,D],
    [N,N,L,M,H,H,H,H,H,L,N,N],
    [NO,NO,NO,NO,['storm'],['typhoon'],['typhoon'],['typhoon'],['typhoon'],NO,NO,NO]
  ),
  'Beijing': months(
    [D,D,T,T,T,W,W,W,T,D,D,D],
    [N,N,L,L,L,M,H,M,L,N,N,N],
    [['cold'],['sandstorm'],['sandstorm'],NO,NO,['heat'],['heat','flood'],['flood'],NO,NO,['cold'],['cold']]
  ),
  'Shanghai': months(
    [D,D,T,T,W,W,W,W,T,T,D,D],
    [N,N,L,L,M,H,M,M,M,L,N,N],
    [['cold'],NO,NO,NO,NO,['flood'],['typhoon','heat'],['typhoon'],['typhoon'],NO,NO,['cold']]
  ),
  'London': months(
    [W,T,T,T,T,T,T,T,T,W,W,W],
    [L,L,L,L,L,L,L,L,L,M,M,M],
    [['storm'],NO,NO,NO,NO,NO,NO,NO,NO,['storm'],['storm'],['storm']]
  ),
  'Helsinki': months(
    [D,D,D,T,T,T,W,W,W,W,W,D],
    [N,N,N,L,L,L,M,M,M,M,L,N],
    [['cold'],['cold'],['cold'],NO,NO,NO,NO,NO,NO,NO,['cold'],['cold']]
  ),
};

export function getSeasonInfo(city: string, month: number): SeasonInfo {
  const data = SEASONAL_DATA[city];
  if (data && data[month]) return data[month];
  return { season: 'transition', floodRisk: 'none', disasterRisks: [] };
}
