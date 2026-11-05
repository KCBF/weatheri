import { useState } from 'react';
import { ChevronUp, ChevronDown, Settings, Sun, Moon, Thermometer, ThermometerSun, ThermometerSnowflake, CloudRain, Droplets, Wind, Sun as SunIcon, AlertTriangle, Waves } from 'lucide-react';
import { CityDef, MAX_ACTIVE_CITIES, MetricKey, ALL_METRICS } from '@/data/weatherData';
import { WeatherSettings, resetAllStorage } from '@/hooks/useTheme';
import { useT } from '@/i18n/LanguageContext';
import { CitySearchBar } from './CitySearchBar';
import { CitySelector } from './CitySelector';
import { YearSelector } from './YearSelector';
import { Legend } from './Legend';
import { CLIMATE_MODELS } from '@/services/weatherApi';

const METRIC_ICONS: Record<MetricKey, any> = {
  tempAvg: Thermometer, tempHigh: ThermometerSun, tempLow: ThermometerSnowflake,
  rain: CloudRain, rainDays: Droplets, wind: Wind, season: SunIcon, floodRisk: Waves, disasterRisk: AlertTriangle,
};

export function ControlBar({
  settings, update, theme, toggleTheme, lang, setLang,
}: {
  settings: WeatherSettings;
  update: (p: Partial<WeatherSettings>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: 'en' | 'vi';
  setLang: (l: 'en' | 'vi') => void;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const isFuture = settings.year > currentYear;

  const toggleMetric = (m: MetricKey) => {
    update({ activeMetrics: settings.activeMetrics.includes(m) ? settings.activeMetrics.filter(x => x !== m) : [...settings.activeMetrics, m] });
  };

  const setCities = (cities: CityDef[]) => update({ activeCities: cities });

  return (
    <div className="border-b border-border bg-card/95 backdrop-blur">
      <div className="px-3 py-2 flex items-center gap-2">
        <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded hover:bg-muted" aria-label={open ? t('controlBar.hideControls') : t('controlBar.showControls')}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {!open && (
          <div className="text-xs font-mono text-muted-foreground">
            {settings.year} · {settings.activeCities.length} {t('controlBar.cities')} · {settings.activeMetrics.length} {t('controlBar.metrics')}
          </div>
        )}
        <div className="flex-1" />
        <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'vi')} className="text-xs bg-input border border-border rounded px-2 py-1">
          <option value="en">English</option>
          <option value="vi">Tieng Viet</option>
        </select>
        <button onClick={() => update({ tempUnit: settings.tempUnit === 'C' ? 'F' : 'C' })} className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary hover:bg-muted">
          °{settings.tempUnit}
        </button>
        <button onClick={() => setSettingsOpen(s => !s)} className={`p-1.5 rounded ${settingsOpen ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`} aria-label={t('controlBar.settings')}>
          <Settings className="w-4 h-4" />
        </button>
        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-muted" aria-label={t('controlBar.toggleTheme')}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          <div className="text-[11px] text-muted-foreground">
            {t('controlBar.statusLine', {
              cityCount: settings.activeCities.length,
              maxCities: MAX_ACTIVE_CITIES,
              dataType: isFuture ? t('controlBar.climateProjection') : t('controlBar.historicalData'),
            })}
          </div>

          <CitySearchBar cities={settings.activeCities} onChange={setCities} />

          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-semibold shrink-0">{t('controlBar.year')}:</span>
              <YearSelector year={settings.year} onChange={y => update({ year: y })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALL_METRICS.map(m => {
              const Icon = METRIC_ICONS[m];
              const active = settings.activeMetrics.includes(m);
              return (
                <button key={m} onClick={() => toggleMetric(m)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'}`}>
                  <Icon className="w-3 h-3" />
                  {t('metrics.' + m)}
                </button>
              );
            })}
          </div>

          <Legend metrics={settings.activeMetrics} />
        </div>
      )}

      {settingsOpen && (
        <div className="border-t border-border px-3 py-3 bg-muted/30 space-y-4">
          <h3 className="text-sm font-semibold">{t('settings.title')}</h3>

          <CitySelector cities={settings.activeCities} onChange={setCities} />

          <div className="space-y-1">
            <label className="text-xs font-semibold">{t('settings.dataSource')}</label>
            <select value={settings.apiSource} onChange={e => update({ apiSource: e.target.value })} className="w-full text-xs bg-input border border-border rounded px-2 py-1.5">
              <option value="open-meteo-free">{t('apiSources.openMeteoFree')}</option>
              <option disabled>{t('apiSources.visualCrossing')}</option>
              <option disabled>{t('apiSources.openWeatherMap')}</option>
              <option disabled>{t('apiSources.weatherApi')}</option>
              <option disabled>{t('apiSources.tomorrowIo')}</option>
            </select>
            <p className="text-[10px] text-muted-foreground">{t('settings.dataSourceDesc')}</p>
          </div>

          {isFuture && (
            <div className="space-y-1">
              <label className="text-xs font-semibold">{t('settings.climateModel')}</label>
              <select value={settings.climateModel} onChange={e => update({ climateModel: e.target.value })} className="w-full text-xs bg-input border border-border rounded px-2 py-1.5">
                {CLIMATE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground">{t('settings.climateModelDesc')}</p>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={settings.showTitle} onChange={e => update({ showTitle: e.target.checked })} />
            {t('settings.showTitleHeader')}
          </label>

          <div className="space-y-1">
            <label className="text-xs font-semibold">{t('settings.language')}</label>
            <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'vi')} className="w-full text-xs bg-input border border-border rounded px-2 py-1.5">
              <option value="en">English</option>
              <option value="vi">Tieng Viet</option>
            </select>
          </div>

          <p className="text-[10px] text-muted-foreground">{t('settings.cookieNote')}</p>
          <button onClick={resetAllStorage} className="px-3 py-1.5 text-xs font-semibold rounded bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {t('settings.resetAll')}
          </button>
        </div>
      )}
    </div>
  );
}
