import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
const CityMap = lazy(() => import('@/components/CityMap'));
import { useTheme, useSettings } from '@/hooks/useTheme';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useLanguageState, LanguageProvider } from '@/i18n/LanguageContext';
import { ControlBar } from '@/components/ControlBar';
import { WeatherGrid } from '@/components/WeatherGrid';
import { AiBrief } from '@/components/AiBrief';
import { translate } from '@/i18n/LanguageContext';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Weatheri — Global Weather Calendar' },
      { name: 'description', content: 'Compare monthly and daily weather across cities worldwide with a color-coded heat-map grid.' },
    ],
  }),
  component: Index,
});

function Index() {
  const { theme, toggleTheme } = useTheme();
  const { settings, update } = useSettings();
  const langState = useLanguageState();
  const { data, isLoading, error } = useWeatherData(settings.activeCities, settings.year, settings.climateModel);

  const ctx = { lang: langState.lang, setLang: langState.setLang, t: langState.t };
  const t = langState.t;

  return (
    <LanguageProvider value={ctx}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto" style={{ maxWidth: '1800px' }}>
          {settings.showTitle && (
            <header className="px-4 pt-4">
              <h1 className="text-2xl font-bold tracking-tight">{t('app.title')}</h1>
            </header>
          )}
          <div className="sticky top-0 z-50">
            <ControlBar
              settings={settings}
              update={update}
              theme={theme}
              toggleTheme={toggleTheme}
              lang={langState.lang}
              setLang={langState.setLang}
            />
          </div>
          <main className="px-3 py-4 space-y-4">
            <ClientOnly fallback={<div className="h-[360px] rounded-lg border border-border bg-muted" />}>
              <Suspense fallback={<div className="h-[360px] rounded-lg border border-border bg-muted" />}>
                <CityMap cities={settings.activeCities} tempUnit={settings.tempUnit} />
              </Suspense>
            </ClientOnly>
            <AiBrief results={data || []} year={settings.year} tempUnit={settings.tempUnit} />
            <WeatherGrid
              results={data || []}
              metrics={settings.activeMetrics}
              tempUnit={settings.tempUnit}
              loading={isLoading}
              errorMsg={error ? translate(langState.lang, 'error.fetchData', { message: (error as Error).message }) : undefined}
              citiesCount={settings.activeCities.length}
            />
          </main>
          <footer className="px-4 py-6 text-[10px] text-muted-foreground border-t border-border flex justify-between items-center flex-wrap gap-2">
            <span>
              {t('app.dataSourceFooter')}
              {settings.year > new Date().getFullYear() && ` · ${t('app.modelLabel', { model: settings.climateModel })}`}
            </span>
            <a
              href="https://instagram.com/akodyn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Made by @akodyn
            </a>
          </footer>
        </div>
      </div>
    </LanguageProvider>
  );
}
