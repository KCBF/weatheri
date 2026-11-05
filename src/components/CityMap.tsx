import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CityDef } from '@/data/weatherData';

function icon(code: number, isDay: number) {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '🌤️' : '☁️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 67 || (code >= 80 && code <= 82)) return '🌧️';
  if (code <= 77 || code === 85 || code === 86) return '❄️';
  return '⛈️';
}

export default function CityMap({ cities, tempUnit }: { cities: CityDef[]; tempUnit: 'C' | 'F' }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { worldCopyJump: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    if (!cities.length) return;
    let cancelled = false;
    const lats = cities.map(c => c.lat).join(','), lngs = cities.map(c => c.lng).join(',');
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code,is_day${tempUnit === 'F' ? '&temperature_unit=fahrenheit' : ''}`)
      .then(r => r.json())
      .catch(() => null)
      .then(data => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : data ? [data] : [];
        cities.forEach((c, i) => {
          const cur = arr[i]?.current;
          const html = `<div class="city-pin"><span class="city-pin-icon">${cur ? icon(cur.weather_code, cur.is_day) : '📍'}</span><span>${c.city}${cur ? ` ${Math.round(cur.temperature_2m)}°` : ''}</span></div>`;
          L.marker([c.lat, c.lng], { icon: L.divIcon({ html, className: '', iconSize: undefined, iconAnchor: [14, 14] }) })
            .bindTooltip(`${c.city}, ${c.country}`)
            .addTo(g);
        });
        if (cities.length === 1) m.setView([cities[0].lat, cities[0].lng], 6);
        else m.fitBounds(L.latLngBounds(cities.map(c => [c.lat, c.lng])), { padding: [40, 40], maxZoom: 6 });
      });
    return () => { cancelled = true; };
  }, [cities, tempUnit]);

  return <div ref={el} className="h-[360px] w-full rounded-lg border border-border overflow-hidden relative z-0" />;
}
