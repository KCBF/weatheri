# Weatheri

Compare monthly weather patterns across cities worldwide using historical data, current forecasts, and climate projections.

**Live demo:** https://weather.effoma.com  
**Demo video:** [weatheri-demo.mp4](./weatheri-demo.mp4)

## Purpose

Choosing where to travel, relocate, or conduct research often requires comparing weather patterns across multiple cities and time periods. Traditional weather apps show one location at a time, making side-by-side comparisons tedious. Weatheri solves this by displaying up to 100 cities simultaneously in a color-coded calendar grid, covering historical years (2000+), current conditions, and future climate projections (through 2100). Travelers can identify ideal visit windows, relocators can evaluate year-round comfort, and researchers can analyze climate trends across regions.

## Features

- **Multi-city comparison grid:** View up to 100 cities side by side with 9 weather metrics per city
- **9 weather metrics:** Average/high/low temperature, rainfall amount and rain days, wind speed, wet/dry season classification, flood risk, and disaster risk indicators
- **Historical and future data:** Access any year from 2000 to 2100 using archive data, live forecasts, and CMIP6 climate model projections
- **Current year intelligence:** Automatically merges archive data (past days), forecast API (next 16 days), and climate projections to fill the entire year
- **Interactive map view:** See all selected cities on a world map with real-time temperature overlay
- **Daily breakdown:** Expand any city to view day-by-day temperature, rainfall, and wind charts
- **Color-coded visualization:** Six-level temperature scale, four-level rain scale, three-level wind scale, plus season and risk indicators
- **Bilingual interface:** Full English and Vietnamese translations
- **Flexible settings:** Toggle between °C/°F, select active metrics, choose climate models (CMCC_CM2_VHR4, EC_Earth3P_HR, MRI_AGCM3_2_S)
- **No API keys required:** Uses Open-Meteo free tier exclusively
- **Responsive design:** Drag-to-scroll grid, sticky headers, dark/light theme

## How It Works

Weatheri fetches data from three Open-Meteo APIs:

1. **Archive API** (historical): Provides ERA5 reanalysis data for completed years
2. **Forecast API** (current): Supplies past 92 days + next 16 days for the current year
3. **Climate API** (future): Delivers CMIP6 climate model projections for future years

For the current year, the app fetches all three sources in parallel and merges them with date deduplication (archive data takes priority over forecast, forecast over climate projection). This ensures complete 12-month coverage even mid-year.

Each city requires ~3 API calls per load. Results are cached for 30 minutes via React Query. Requests are staggered 200ms apart to stay within Open-Meteo's 600 requests/minute free tier limit.

## Tech Stack

Built with modern web technologies:

- **TanStack Start** (full-stack React framework with file-based routing)
- **React 19** (UI library)
- **Tailwind CSS 4** (styling)
- **shadcn/ui** (Radix UI component library)
- **TanStack Query** (data fetching and caching)
- **TanStack Router** (type-safe routing)
- **Recharts** (daily strip charts)
- **Leaflet** (interactive map)
- **Lucide React** (icons)
- **Bun** (runtime and package manager)

## Run Locally

Requires [Bun](https://bun.sh) installed.

```bash
git clone <repository-url>
cd weather/app
bun install
bun run dev
```

The dev server starts at http://localhost:3000.

Build for production:

```bash
bun run build
```

## Deploy

Configured for Netlify with included `netlify.toml`:

- Build command: `bun run build`
- Publish directory: `dist`
- Environment: Node 22, Nitro preset for Netlify

Connect your GitHub repository to Netlify for automatic deployments on push to main.

## License

MIT

## Climate brief by Llama

The "Summarize these cities" button sends the visible grid (rounded monthly temperature and rainfall, at most 8 cities) to a Netlify function at `/api/summary`. The function calls Meta's Llama API (`Llama-4-Maverick-17B-128E-Instruct-FP8`, max 220 output tokens) and returns up to 4 bullets: best months to visit, mildest city, heat or rain warnings, and one contrast. The key lives only on the server as `META_AI_API_WEATHERI`. `LLAMA_MODEL` and `LLAMA_BASE_URL` override the model and endpoint.
