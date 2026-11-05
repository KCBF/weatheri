import { useEffect, useMemo, useState } from 'react';
import { Plus, X, MapPin, Search } from 'lucide-react';
import { CityDef, MAX_ACTIVE_CITIES, PRESET_CITIES } from '@/data/weatherData';
import { API_LIMITS, getApiStats, searchCities } from '@/services/geocoding';
import { useT } from '@/i18n/LanguageContext';

export function CitySelector({ cities, onChange }: { cities: CityDef[]; onChange: (c: CityDef[]) => void }) {
  const { t } = useT();
  const limits = API_LIMITS['open-meteo-free'];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityDef[]>([]);
  const [stats, setStats] = useState(getApiStats());

  useEffect(() => { const id = setInterval(() => setStats(getApiStats()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const id = setTimeout(() => searchCities(query).then(setResults), 350);
    return () => clearTimeout(id);
  }, [query]);

  const isActive = (c: CityDef) => cities.some(x => x.lat === c.lat && x.lng === c.lng);
  const add = (c: CityDef) => {
    if (isActive(c)) return;
    onChange(cities.length >= MAX_ACTIVE_CITIES ? [...cities.slice(0, -1), c] : [...cities, c]);
  };
  const remove = (c: CityDef) => onChange(cities.filter(x => !(x.lat === c.lat && x.lng === c.lng)));

  const grouped = useMemo(() => {
    const m = new Map<string, CityDef[]>();
    for (const c of PRESET_CITIES) {
      if (!m.has(c.country)) m.set(c.country, []);
      m.get(c.country)!.push(c);
    }
    return Array.from(m.entries()).slice(0, 10);
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold mb-2">{t('citySelector.activeCities', { count: cities.length, max: MAX_ACTIVE_CITIES })}</div>
        <div className="flex flex-wrap gap-1">
          {cities.map(c => (
            <span key={`${c.lat},${c.lng}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs">
              <MapPin className="w-3 h-3" />
              {c.city} <span className="opacity-60">{c.country}</span>
              <button onClick={() => remove(c)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-1">
        <div className="font-semibold mb-1">{t('citySelector.apiLimitsTitle')}</div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('citySelector.dailyLimit')}</span><span className="font-mono">{t('citySelector.dailyLimitValue')}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('citySelector.rateLimit')}</span><span className="font-mono">{t('citySelector.rateLimitValue')}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('citySelector.costPerCity')}</span><span className="font-mono">{t('citySelector.costPerCityValue', { cost: limits.costPerCity })}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('citySelector.sessionCalls')}</span><span className="font-mono">{t('citySelector.sessionCallsValue', { count: stats.callsThisMinute })}</span></div>
        <div className="pt-1 text-muted-foreground">{t('citySelector.maxCitiesWarning', { max: MAX_ACTIVE_CITIES })}</div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('citySelector.searchPlaceholder')}
          className="w-full pl-8 pr-2 py-1.5 text-sm rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <div className="mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md scrollbar-thin">
            {results.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground">{t('citySelector.noCitiesFound', { query })}</div>
            ) : results.map(c => {
              const active = isActive(c);
              return (
                <button key={`${c.lat},${c.lng}`} disabled={active} onClick={() => add(c)} className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent ${active ? 'opacity-40' : ''}`}>
                  <span>{c.city} <span className="text-muted-foreground">{c.country}</span></span>
                  {active ? <span>✓</span> : <Plus className="w-3 h-3 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">{t('citySelector.quickAddPresets')}</div>
        <div className="space-y-2 max-h-64 overflow-auto scrollbar-thin pr-1">
          {grouped.map(([country, list]) => (
            <div key={country}>
              <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{country}</div>
              <div className="flex flex-wrap gap-1">
                {list.map(c => {
                  const active = isActive(c);
                  return (
                    <button key={c.city} onClick={() => active ? remove(c) : add(c)} className={`px-2 py-1 text-xs rounded-md border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border hover:bg-muted'}`}>
                      {c.city}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
