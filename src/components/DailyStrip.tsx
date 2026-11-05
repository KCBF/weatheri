import { DailyData, MONTHS } from '@/data/weatherData';
import { tempColorClass, rainColorClass, windColorClass, formatTemp } from '@/lib/colors';
import { useT } from '@/i18n/LanguageContext';

function parseMonth(s: string) { return parseInt(s.slice(5, 7), 10) - 1; }
function parseDay(s: string) { return parseInt(s.slice(8, 10), 10); }

export function DailyStrip({ city, daily, tempUnit }: { city: string; daily: DailyData[]; tempUnit: 'C'|'F' }) {
  const { t } = useT();

  if (!daily || daily.length === 0) {
    return <div className="px-4 py-3 text-xs text-muted-foreground italic">{t('dailyStrip.noDailyData', { city })}</div>;
  }

  const byMonth: DailyData[][] = Array.from({ length: 12 }, () => []);
  for (const d of daily) {
    const m = parseMonth(d.date);
    if (m >= 0 && m < 12) byMonth[m].push(d);
  }

  const Row = ({ label, render }: { label: string; render: (d: DailyData) => { cls: string; top: string; bot: string; tip: string } }) => (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground mb-1 px-1">{label}</div>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {byMonth.map((days, m) => days.length === 0 ? null : (
          <div key={m} className="shrink-0">
            <div className="text-[9px] font-mono text-muted-foreground mb-0.5 px-0.5">{MONTHS[m]}</div>
            <div className="flex gap-px">
              {days.map(d => {
                const r = render(d);
                return (
                  <div
                    key={d.date}
                    title={r.tip}
                    className={`w-[18px] h-10 flex flex-col items-center justify-between text-[8px] font-mono rounded-sm transition-transform hover:scale-[1.6] hover:z-10 relative ${r.cls}`}
                  >
                    <span className="leading-none pt-0.5">{r.top}</span>
                    <span className="leading-none pb-0.5">{r.bot}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-4 py-3 space-y-3 bg-muted/30">
      <div className="text-xs font-semibold">{t('dailyStrip.dailyDataFor', { city })}</div>
      <Row
        label={t('dailyStrip.dailyAvgTemp')}
        render={d => ({
          cls: tempColorClass(d.tempMean),
          top: String(parseDay(d.date)),
          bot: formatTemp(d.tempMean, tempUnit),
          tip: `${d.date}: ${formatTemp(d.tempMean, tempUnit)}`,
        })}
      />
      <Row
        label={t('dailyStrip.dailyRainfall')}
        render={d => ({
          cls: rainColorClass(d.precipitation * 30),
          top: String(parseDay(d.date)),
          bot: d.precipitation >= 1 ? Math.round(d.precipitation).toString() : '·',
          tip: `${d.date}: ${d.precipitation.toFixed(1)}mm`,
        })}
      />
      <Row
        label={t('dailyStrip.dailyMaxWind')}
        render={d => ({
          cls: windColorClass(d.windMax),
          top: String(parseDay(d.date)),
          bot: Math.round(d.windMax).toString(),
          tip: `${d.date}: ${d.windMax.toFixed(1)} km/h`,
        })}
      />
    </div>
  );
}
