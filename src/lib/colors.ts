import { MonthSummary } from '@/data/weatherData';

export function tempColorClass(celsius: number): string {
  if (celsius >= 35) return 'bg-weather-hot text-white';
  if (celsius >= 28) return 'bg-weather-warm text-white';
  if (celsius >= 20) return 'bg-weather-mild text-black';
  if (celsius >= 10) return 'bg-weather-cool text-white';
  if (celsius >= 0) return 'bg-weather-cold text-white';
  return 'bg-weather-freezing text-white';
}

export function rainColorClass(mm: number): string {
  if (mm >= 250) return 'bg-rain-heavy text-white';
  if (mm >= 100) return 'bg-rain-moderate text-white';
  if (mm >= 30) return 'bg-rain-light text-black';
  return 'bg-rain-dry text-black';
}

export function windColorClass(kmh: number): string {
  if (kmh >= 15) return 'bg-wind-strong text-white';
  if (kmh >= 10) return 'bg-wind-moderate text-white';
  return 'bg-wind-light text-black';
}

export function seasonColorClass(s: 'wet' | 'dry' | 'transition'): string {
  if (s === 'wet') return 'bg-season-wet text-white';
  if (s === 'dry') return 'bg-season-dry text-black';
  return 'bg-season-transition text-white';
}

export function riskColorClass(r: 'high' | 'moderate' | 'low' | 'none'): string {
  if (r === 'high') return 'bg-risk-high text-white';
  if (r === 'moderate') return 'bg-risk-moderate text-black';
  if (r === 'low') return 'bg-risk-low text-white';
  return 'bg-risk-none text-muted-foreground';
}

export function toFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export function formatTemp(c: number, unit: 'C' | 'F'): string {
  if (!isFinite(c) || c === 0) return unit === 'C' ? `${Math.round(c)}°` : `${Math.round(c)}°`;
  const v = unit === 'F' ? toFahrenheit(c) : Math.round(c);
  return `${v}°`;
}

export type AnyMonth = MonthSummary;
