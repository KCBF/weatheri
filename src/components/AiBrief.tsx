import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { CityWeatherResult } from "@/hooks/useWeatherData";

interface Props {
  results: CityWeatherResult[];
  year: number;
  tempUnit: string;
}

// Asks Llama (via /api/summary) for a short climate brief of the cities on screen.
export function AiBrief({ results, year, tempUnit }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [cacheKey, setCacheKey] = useState("");

  const withData = results.filter((r) => r.daily.length > 0);
  const key = `${year}|${tempUnit}|${withData.map((r) => r.city.city).join(",")}`;

  async function run() {
    if (key === cacheKey && text) return;
    setLoading(true);
    setErr("");
    const toUnit = (c: number) => (tempUnit === "F" ? c * 1.8 + 32 : c);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          unit: tempUnit === "F" ? "F" : "C",
          cities: withData.slice(0, 8).map((r) => ({
            name: `${r.city.city}, ${r.city.country}`,
            t: r.monthly.map((m) => Math.round(toUnit(m.tempAvg))),
            r: r.monthly.map((m) => Math.round(m.rain)),
          })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setText(j.text);
      setCacheKey(key);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Climate brief by Llama
        </div>
        <button
          onClick={run}
          disabled={loading || withData.length === 0}
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Thinking..." : text && key === cacheKey ? "Up to date" : "Summarize these cities"}
        </button>
      </div>
      {err && <p className="mt-2 text-destructive">Could not get a summary: {err}</p>}
      {text && <p className="mt-2 whitespace-pre-line text-muted-foreground">{text}</p>}
    </section>
  );
}
