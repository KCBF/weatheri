import { MetricKey } from '@/data/weatherData';
import { useT } from '@/i18n/LanguageContext';

const sq = 'inline-block w-3 h-3 rounded-sm align-middle mr-1';

export function Legend({ metrics }: { metrics: MetricKey[] }) {
  const { t } = useT();
  const showTemp = metrics.some(m => m.startsWith('temp'));
  const showRain = metrics.includes('rain') || metrics.includes('rainDays');
  const showSeason = metrics.includes('season');
  const showRisk = metrics.includes('floodRisk') || metrics.includes('disasterRisk');

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground items-center">
      {showTemp && (
        <span className="flex items-center gap-1">
          <span className="font-semibold">{t('legend.temp')}</span>
          <span className={`${sq} bg-weather-freezing`} />{'<0'}
          <span className={`${sq} bg-weather-cold`} />0
          <span className={`${sq} bg-weather-cool`} />10
          <span className={`${sq} bg-weather-mild`} />20
          <span className={`${sq} bg-weather-warm`} />28
          <span className={`${sq} bg-weather-hot`} />35°+
        </span>
      )}
      {showRain && (
        <span className="flex items-center gap-1">
          <span className="font-semibold">{t('legend.rain')}</span>
          <span className={`${sq} bg-rain-dry`} />{'<30'}
          <span className={`${sq} bg-rain-light`} />30
          <span className={`${sq} bg-rain-moderate`} />100
          <span className={`${sq} bg-rain-heavy`} />250mm+
        </span>
      )}
      {showSeason && (
        <span className="flex items-center gap-1">
          <span className="font-semibold">{t('legend.season')}</span>
          <span className={`${sq} bg-season-wet`} />{t('legend.wet')}
          <span className={`${sq} bg-season-dry`} />{t('legend.dry')}
          <span className={`${sq} bg-season-transition`} />{t('legend.trans')}
        </span>
      )}
      {showRisk && (
        <span className="flex items-center gap-1">
          <span className="font-semibold">{t('legend.risk')}</span>
          <span className={`${sq} bg-risk-none`} />{t('legend.none')}
          <span className={`${sq} bg-risk-low`} />{t('legend.low')}
          <span className={`${sq} bg-risk-moderate`} />{t('legend.mod')}
          <span className={`${sq} bg-risk-high`} />{t('legend.high')}
        </span>
      )}
    </div>
  );
}
