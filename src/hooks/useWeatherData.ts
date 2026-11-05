import { useQuery } from '@tanstack/react-query';
import { CityDef, MonthSummary, DailyData } from '@/data/weatherData';
import { fetchCityYear, aggregateToMonthly } from '@/services/weatherApi';

export interface CityWeatherResult {
  city: CityDef;
  daily: DailyData[];
  monthly: MonthSummary[];
}

const emptyMonthly = (): MonthSummary[] =>
  Array.from({ length: 12 }, (_, month) => ({
    month, tempAvg: 0, tempHigh: 0, tempLow: 0, rain: 0, rainDays: 0, windAvg: 0, windMax: 0,
  }));

async function fetchAll(cities: CityDef[], year: number, climateModel: string): Promise<CityWeatherResult[]> {
  const promises = cities.map((city, i) => new Promise<CityWeatherResult>(async (resolve) => {
    await new Promise(r => setTimeout(r, i * 200));
    try {
      const daily = await fetchCityYear(city, year, climateModel);
      resolve({ city, daily, monthly: aggregateToMonthly(daily) });
    } catch (e) {
      console.error('Failed', city.city, e);
      resolve({ city, daily: [], monthly: emptyMonthly() });
    }
  }));
  return Promise.all(promises);
}

export function useWeatherData(cities: CityDef[], year: number, climateModel: string) {
  const cityKey = cities.map(c => `${c.lat},${c.lng}`).sort().join('|');
  return useQuery({
    queryKey: ['weather', cityKey, year, climateModel],
    queryFn: () => fetchAll(cities, year, climateModel),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    enabled: cities.length > 0,
  });
}
