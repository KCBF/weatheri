// Llama climate brief: turns compact monthly grid data into a short plain-language summary.
// Runs Meta Llama 4 Maverick on Amazon Bedrock when BEDROCK_API_KEY is set,
// otherwise the Meta Llama API. Token budget: rounded numbers in, max 220 tokens out.

const BASE = process.env.LLAMA_BASE_URL ?? "https://api.llama.com/compat/v1";
const MODEL = process.env.LLAMA_MODEL ?? "Llama-4-Maverick-17B-128E-Instruct-FP8";

// Abuse protection: only our own site may call this, inputs are validated and
// size-capped, identical requests are served from cache, and each warm instance
// has a hard call budget. Netlify's edge rate limit (see config) caps per-IP use.
const ALLOWED_HOSTS = new Set(["weather.effoma.com", "weatheri-effoma.netlify.app", "localhost"]);
const cache = new Map<string, { text: string; model: string }>();
const INSTANCE_BUDGET = Number(process.env.SUMMARY_INSTANCE_BUDGET ?? 200);
let calls = 0;

function hostOf(url: string | null): string {
  try {
    return url ? new URL(url).hostname : "";
  } catch {
    return "";
  }
}

const isNums = (a: unknown) =>
  Array.isArray(a) && a.length === 12 && a.every((n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 5000);

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const origin = hostOf(req.headers.get("origin")) || hostOf(req.headers.get("referer"));
  if (!ALLOWED_HOSTS.has(origin) && !origin.endsWith("--weatheri-effoma.netlify.app")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (Number(req.headers.get("content-length") ?? 0) > 4000) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }
  const bedrockKey = process.env.BEDROCK_API_KEY;
  const key = process.env.META_AI_API_WEATHERI;
  if (!bedrockKey && !key) return Response.json({ error: "Llama API key not configured" }, { status: 500 });

  let body: { year?: unknown; unit?: unknown; cities?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }
  const year = Number(body.year);
  const unit = body.unit === "F" ? "F" : "C";
  const cities = body.cities;
  if (
    !Number.isInteger(year) || year < 1940 || year > 2100 ||
    !Array.isArray(cities) || cities.length === 0 || cities.length > 8 ||
    !cities.every((c) => c && typeof c.name === "string" && c.name.length <= 80 && isNums(c.t) && isNums(c.r))
  ) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const cacheKey = JSON.stringify([year, unit, cities.map((c) => [c.name, c.t, c.r])]);
  const hit = cache.get(cacheKey);
  if (hit) return Response.json(hit);
  if (++calls > INSTANCE_BUDGET) {
    return Response.json({ error: "Busy, try again later" }, { status: 429 });
  }
  const data = cities.slice(0, 8).map((c: { name: string; t: number[]; r: number[] }) =>
    `${c.name}: temp ${c.t.join(",")}; rain mm ${c.r.join(",")}`,
  ).join("\n");

  const system =
    "You are a concise climate analyst. Given monthly averages (Jan to Dec) for cities, write at most 4 short bullet points: the best months to visit each city, the city with the mildest year, rain or heat warnings, and one surprising contrast. Plain text, no headings.";
  const user = `Year ${year}, temperature in ${unit}.
${data}`;

  if (bedrockKey) {
    const region = process.env.BEDROCK_REGION ?? "us-east-1";
    const model = process.env.BEDROCK_MODEL ?? "us.meta.llama4-maverick-17b-instruct-v1:0";
    const res = await fetch(
      `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(model)}/converse`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${bedrockKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          system: [{ text: system }],
          messages: [{ role: "user", content: [{ text: user }] }],
          inferenceConfig: { maxTokens: 220, temperature: 0.4 },
        }),
      },
    );
    if (!res.ok) return Response.json({ error: `Bedrock ${res.status}` }, { status: 502 });
    const j = await res.json();
    const text = j.output?.message?.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";
    const out = { text, model: "Llama 4 Maverick (Amazon Bedrock)" };
    if (cache.size > 500) cache.clear();
    cache.set(cacheKey, out);
    return Response.json(out);
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 220,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    return Response.json({ error: `Llama API ${res.status}` }, { status: 502 });
  }
  const j = await res.json();
  const text = j.choices?.[0]?.message?.content ?? j.completion_message?.content?.text ?? "";
  return Response.json({ text, model: MODEL });
};

export const config = {
  path: "/api/summary",
  // Netlify edge rate limit: 5 requests per minute per IP.
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
