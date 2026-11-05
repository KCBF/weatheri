import { useEffect, useRef, useState } from 'react';
import { MapPin, X, Search, Plus } from 'lucide-react';
import { CityDef, MAX_ACTIVE_CITIES } from '@/data/weatherData';
import { searchCities } from '@/services/geocoding';
import { useT } from '@/i18n/LanguageContext';

export function CitySearchBar({ cities, onChange }: { cities: CityDef[]; onChange: (c: CityDef[]) => void }) {
  const { t } = useT();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityDef[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const id = setTimeout(() => { searchCities(query).then(setResults); }, 350);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = (c: CityDef) => cities.some(x => x.lat === c.lat && x.lng === c.lng);
  const add = (c: CityDef) => {
    if (isActive(c)) return;
    const next = cities.length >= MAX_ACTIVE_CITIES ? [...cities.slice(0, -1), c] : [...cities, c];
    onChange(next);
    setQuery('');
  };
  const remove = (c: CityDef) => onChange(cities.filter(x => !(x.lat === c.lat && x.lng === c.lng)));

  return (
    <div className="flex flex-wrap items-center gap-2" ref={ref}>
      {cities.map(c => (
        <span key={`${c.lat},${c.lng}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs">
          <MapPin className="w-3 h-3" />
          {c.city} <span className="opacity-60">{c.country}</span>
          <button onClick={() => remove(c)} aria-label={t('citySelector.remove', { city: c.city })} className="ml-1 hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          placeholder={cities.length >= MAX_ACTIVE_CITIES ? t('citySearch.maxCitiesHint', { max: MAX_ACTIVE_CITIES }) : t('citySearch.searchPlaceholder')}
          className="w-full pl-8 pr-2 py-1.5 text-sm rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {open && query && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-auto bg-popover border border-border rounded-md shadow-lg z-50 scrollbar-thin">
            {results.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground">{t('citySearch.noCitiesFound', { query })}</div>
            ) : results.map(c => {
              const active = isActive(c);
              return (
                <button
                  key={`${c.lat},${c.lng}`}
                  disabled={active}
                  onClick={() => add(c)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition ${active ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span>
                    <span className="font-medium">{c.city}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.country} · {c.lat.toFixed(2)},{c.lng.toFixed(2)}</span>
                  </span>
                  {active ? <span className="text-xs">✓</span> : <Plus className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
