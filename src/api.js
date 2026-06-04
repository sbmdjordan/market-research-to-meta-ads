// Thin client for the pipeline backend. The browser calls our own /api/* routes
// (never an LLM directly). `providers` carries the per-stage choices from
// Settings — the backend falls back to .env defaults for anything omitted.

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.code = data.code
    throw err
  }
  return data
}

// Returns { providers: {id: hasEnvKey}, registry: {...}, defaults: {...} }
export const getStatus = () => fetch('/api/status').then((r) => r.json())

// Stage 0 -> { sources } (review/edit before the slow research call)
export const discoverSources = ({ product, market, context, providers }) =>
  post('/api/sources', { product, market, context, providers })

// Stage 1 -> { segments, rawResearch, citations, sources }
export const runResearch = ({ product, market, context, sources, providers }) =>
  post('/api/research', { product, market, context, sources, providers })

// Stage 2 -> { angles }
export const runAngles = ({ product, market, offerBrief, segment, providers }) =>
  post('/api/angles', { product, market, offerBrief, segment, providers })

// Stage 3 -> { headlines }
export const runHeadlines = ({ offerBrief, angles, providers }) =>
  post('/api/headlines', { offerBrief, angles, providers })

// Reference ad image (data URL) -> { config } for a reusable layout template.
export const templateFromAd = ({ image, providers }) =>
  post('/api/template-from-ad', { image, providers })
