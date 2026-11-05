import { Fragment, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CityWeatherResult } from '@/hooks/useWeatherData';
import { MONTHS, MetricKey, getSeasonInfo } from '@/data/weatherData';
import { tempColorClass, rainColorClass, windColorClass, seasonColorClass, riskColorClass, formatTemp } from '@/lib/colors';
import { DailyStrip } from './DailyStrip';
import { useT } from '@/i18n/LanguageContext';

const isBrowser = typeof window !== 'undefined';

function loadExpanded(): string[] {
  if (!isBrowser) return [];
  try { return JSON.parse(localStorage.getItem('weather_expanded') || '[]'); } catch { return []; }
}

export function WeatherGrid({ results, metrics, tempUnit, loading, errorMsg, citiesCount }: {
  results: CityWeatherResult[];
  metrics: MetricKey[];
  tempUnit: 'C' | 'F';
  loading: boolean;
  errorMsg?: string;
  citiesCount: number;
}) {
  const { t } = useT();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(loadExpanded()));
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ down: false, x: 0, left: 0 });

  useEffect(() => {
    if (isBrowser) localStorage.setItem('weather_expanded', JSON.stringify(Array.from(expanded)));
  }, [expanded]);

  const toggle = (city: string) => setExpanded(s => { const n = new Set(s); n.has(city) ? n.delete(city) : n.add(city); return n; });
  const allExpanded = results.length > 0 && results.every(r => expanded.has(r.city.city));
  const toggleAll = () => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(results.map(r => r.city.city)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if ((e.target as HTMLElement).closest('button,a,input')) return;
    dragRef.current = { down: true, x: e.pageX, left: containerRef.current.scrollLeft };
    containerRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.down || !containerRef.current) return;
    containerRef.current.scrollLeft = dragRef.current.left - (e.pageX - dragRef.current.x);
  };
  const onMouseUp = () => {
    dragRef.current.down = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  const renderCell = (r: CityWeatherResult, m: MetricKey, monthIdx: number) => {
    const ms = r.monthly[monthIdx];
    if (m === 'tempAvg') return { cls: tempColorClass(ms.tempAvg), content: formatTemp(ms.tempAvg, tempUnit), tip: `${r.city.city} ${MONTHS[monthIdx]}: avg ${formatTemp(ms.tempAvg, tempUnit)}` };
    if (m === 'tempHigh') return { cls: tempColorClass(ms.tempHigh), content: formatTemp(ms.tempHigh, tempUnit), tip: `high ${formatTemp(ms.tempHigh, tempUnit)}` };
    if (m === 'tempLow') return { cls: tempColorClass(ms.tempLow), content: formatTemp(ms.tempLow, tempUnit), tip: `low ${formatTemp(ms.tempLow, tempUnit)}` };
    if (m === 'rain') return { cls: rainColorClass(ms.rain), content: Math.round(ms.rain).toString(), tip: `${Math.round(ms.rain)}mm` };
    if (m === 'rainDays') return { cls: rainColorClass(ms.rainDays * 10), content: ms.rainDays.toString(), tip: `${ms.rainDays} rain days` };
    if (m === 'wind') return { cls: windColorClass(ms.windAvg), content: Math.round(ms.windAvg).toString(), tip: `avg ${ms.windAvg.toFixed(1)} km/h` };
    if (m === 'season') {
      const s = getSeasonInfo(r.city.city, monthIdx);
      const lbl = s.season === 'wet' ? 'WET' : s.season === 'dry' ? 'DRY' : 'TRN';
      return { cls: seasonColorClass(s.season), content: lbl, tip: `${s.season}` };
    }
    if (m === 'floodRisk') {
      const s = getSeasonInfo(r.city.city, monthIdx);
      const lbl = s.floodRisk === 'high' ? 'HIGH' : s.floodRisk === 'moderate' ? 'MOD' : s.floodRisk === 'low' ? 'LOW' : '—';
      return { cls: riskColorClass(s.floodRisk), content: lbl, tip: `flood: ${s.floodRisk}` };
    }
    // disasterRisk
    const s = getSeasonInfo(r.city.city, monthIdx);
    const risks = s.disasterRisks;
    const sev = risks.length >= 2 ? 'high' as const : risks.length === 1 ? 'moderate' as const : 'none' as const;
    return { cls: riskColorClass(sev), content: risks.length ? String(risks.length) : '—', tip: risks.length ? risks.join(', ') : 'no risk' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-sm">{t('weatherGrid.loading')}</div>
        <div className="text-xs">{t('weatherGrid.loadingCities', { count: citiesCount })}</div>
      </div>
    );
  }

  if (results.length === 0) {
    return <div className="py-20 text-center text-sm text-muted-foreground">{t('weatherGrid.noCities')}</div>;
  }

  return (
    <div className="space-y-2">
      {errorMsg && <div className="px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">{errorMsg}</div>}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-muted-foreground">{t('weatherGrid.citiesInfo', { count: results.length })}</div>
        <button onClick={toggleAll} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-muted">
          {allExpanded ? t('weatherGrid.collapseAll') : t('weatherGrid.expandAll')}
        </button>
      </div>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="overflow-auto scrollbar-thin border border-border rounded-md bg-card cursor-grab select-none"
        style={{ maxHeight: '80vh' }}
      >
        <table className="font-mono text-[11px] border-collapse" style={{ minWidth: '900px', width: '100%' }}>
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-40 bg-card border-b border-r border-border px-2 py-2 text-left text-[10px] font-semibold uppercase text-muted-foreground" style={{ minWidth: '180px' }}>
                {t('weatherGrid.cityMetric')}
              </th>
              {MONTHS.map(m => (
                <th key={m} className="sticky top-0 z-30 bg-card border-b border-border px-1 py-2 text-[10px] font-semibold uppercase text-muted-foreground" style={{ minWidth: '56px' }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const isExp = expanded.has(r.city.city);
              return (
                <Fragment key={r.city.city}>
                  <tr key={r.city.city + '_head'} onClick={() => toggle(r.city.city)} className="cursor-pointer hover:bg-accent/30">
                    <td className="sticky left-0 z-20 bg-card border-r border-b border-border px-2 py-2 font-semibold text-foreground">
                      <span className="inline-flex items-center gap-1">
                        {isExp ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {r.city.city} <span className="text-muted-foreground text-[10px]">{r.city.country}</span>
                      </span>
                    </td>
                    <td colSpan={12} className="border-b border-border bg-muted/20" />
                  </tr>
                  {metrics.map(m => (
                    <tr key={r.city.city + m}>
                      <td className="sticky left-0 z-20 bg-card border-r border-b border-border px-2 py-1 text-muted-foreground">
                        <span className="pl-4">{t('metrics.' + m)}</span>
                      </td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const c = renderCell(r, m, i);
                        return (
                          <td key={i} className="border-b border-border p-0.5">
                            <div title={c.tip} className={`${c.cls} h-7 rounded-sm flex items-center justify-center font-semibold transition-transform hover:scale-110 hover:shadow-lg hover:z-10 relative cursor-default`}>
                              {c.content}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {isExp && (
                    <tr key={r.city.city + '_daily'}>
                      <td className="sticky left-0 z-20 bg-muted/30 border-r border-b border-border px-2 py-3 text-[10px] font-semibold uppercase text-muted-foreground align-top" style={{ minWidth: '180px' }}>
                        Daily
                      </td>
                      <td colSpan={12} className="border-b border-border p-0">
                        <DailyStrip city={r.city.city} daily={r.daily} tempUnit={tempUnit} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
