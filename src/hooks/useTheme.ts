import { useEffect, useState, useCallback } from 'react';
import { CityDef, DEFAULT_CITIES, MetricKey, ALL_METRICS } from '@/data/weatherData';

export interface WeatherSettings {
  tempUnit: 'C' | 'F';
  activeMetrics: MetricKey[];
  year: number;
  climateModel: string;
  apiSource: string;
  activeCities: CityDef[];
  showTitle: boolean;
}

const DEFAULT_SETTINGS: WeatherSettings = {
  tempUnit: 'C',
  activeMetrics: [...ALL_METRICS],
  year: 2025,
  climateModel: 'CMCC_CM2_VHR4',
  apiSource: 'open-meteo-free',
  activeCities: DEFAULT_CITIES,
  showTitle: false,
};

const isBrowser = typeof window !== 'undefined';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (!isBrowser) return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setThemeState(t => t === 'dark' ? 'light' : 'dark'), []);
  return { theme, toggleTheme };
}

export function useSettings() {
  const [settings, setSettings] = useState<WeatherSettings>(() => {
    if (!isBrowser) return DEFAULT_SETTINGS;
    try {
      const s = localStorage.getItem('weather_settings');
      if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (!isBrowser) return;
    localStorage.setItem('weather_settings', JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((patch: Partial<WeatherSettings>) => {
    setSettings(s => ({ ...s, ...patch }));
  }, []);

  return { settings, update, setSettings };
}

export function resetAllStorage() {
  if (!isBrowser) return;
  ['theme','weather_settings','weather_expanded','weather_hidden','app_language'].forEach(k => localStorage.removeItem(k));
  localStorage.setItem('theme', 'light');
  window.location.reload();
}
