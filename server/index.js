// Pipeline backend. Holds the API keys (from .env) and runs the AI stages so
// the browser never sees a secret. Every stage can run on any configured
// provider — the request may carry per-stage overrides from the Settings panel
// (`providers: { research, writing }`); otherwise the .env defaults apply.

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { run } from './llm/index.js'
import { statusSnapshot } from './providers.js'
import { buildSourcesPrompt } from './prompts/sources.js'
import { buildResearchPrompt } from './prompts/research.js'
import { buildStructurePrompt } from './prompts/structure.js'
import { buildAnglesPrompt } from './prompts/angles.js'
import { buildHeadlinesPrompt } from './prompts/headlines.js'
import { buildTemplateFromAdPrompt } from './prompts/templateFromAd.js'
import { extractJson } from './util.js'
import { captureLead, freeRunUsed, claimFreeRun, getSubscription, getUsage, consumeQuota } from './kv.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '2mb' }))

// CORS — let the The Marketing Startup site (and local dev) call this API from a
// different origin. Comma-separated allowlist in ALLOWED_ORIGINS.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'content-type, x-tool-password, x-user-email')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Auth + plan. Owner (TOOL_PASSWORD) = deep-research, unlimited (that's you).
// Paid (a valid email header with an active subscription) = deep-research,
// monthly quota (10/30). Free (any other valid email) = sonar-pro, one run
// ever. /api/free-run and /api/status stay open (that's how a visitor gets
// in). No password set (local dev) = treat everyone as owner.
const TOOL_PASSWORD = process.env.TOOL_PASSWORD || ''
app.use('/api', async (req, res, next) => {
  if (req.path === '/free-run' || req.path === '/status') return next()
  if (TOOL_PASSWORD && req.headers['x-tool-password'] === TOOL_PASSWORD) {
    req.plan = 'owner'
    return next()
  }
  const email = String(req.headers['x-user-email'] || '').trim().toLowerCase()
  if (!email || !/.+@.+\..+/.test(email)) {
    if (!TOOL_PASSWORD) {
      req.plan = 'owner'
      return next()
    }
    return res.status(401).json({ error: 'Sign up for a free run to continue.' })
  }
  req.email = email
  try {
    const sub = await getSubscription(email)
    if (sub) {
      req.plan = 'paid'
      req.subPlan = sub.plan // 'starter' | 'pro'
    } else {
      req.plan = 'free'
    }
  } catch (err) {
    console.error('[gate] subscription lookup failed:', err.message)
    req.plan = 'free' // fail closed to the cheaper tier, never silently grant paid
  }
  next()
})

// Wrap an async handler so thrown errors become clean JSON with the right
// status (a missing key is a 400 the UI can explain, not a 500).
const handler = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (err) {
    console.error(`[${req.path}]`, err.message)
    res.status(err.status || 500).json({ error: err.message, code: err.code })
  }
}

const badRequest = (msg) => {
  const e = new Error(msg)
  e.status = 400
  return e
}

// Free-run grant. The landing page posts an email here to start a free run:
// records the lead and reports whether this email has already used its one run.
// The real one-per-email enforcement is atomic at the research step (claimFreeRun).
app.post(
  '/api/free-run',
  handler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!/.+@.+\..+/.test(email)) throw badRequest('A valid email is required.')
    await captureLead(email, { source: 'landing' })
    res.json({ ok: true, email, freeRunUsed: await freeRunUsed(email) })
  })
)

// Perplexity (web-grounded discovery) appends inline citation markers like
// "[1]" or "[6][7][8]" to the source strings. Strip every bracketed-number
// marker anywhere in the string, collapse the leftover whitespace, and drop
// anything that empties out.
const cleanSource = (s) =>
  String(s)
    .replace(/\[\d+\]/g, '') // Perplexity inline citation markers
    .replace(/^[\s"'[\]]+/, '') // stray leading brackets/quotes sonar sometimes emits
    .replace(/\s{2,}/g, ' ')
    .trim()

// Perplexity's structured output returns `{ "sources": [ ... ] }`. Pull the
// array out tolerantly: accept a bare array, an object with a `sources` array,
// or a double-encoded JSON string of either. Returns a clean string[] or null.
function parseSourceArray(text) {
  const pickArray = (v) =>
    Array.isArray(v) ? v : v && typeof v === 'object' && Array.isArray(v.sources) ? v.sources : null
  const decode = (v) => {
    try {
      let p = typeof v === 'string' ? JSON.parse(v) : v
      if (typeof p === 'string') p = JSON.parse(p) // double-encoded
      return p
    } catch {
      return null
    }
  }
  let val = null
  try {
    let p = extractJson(text)
    if (typeof p === 'string') p = JSON.parse(p)
    val = p
  } catch {
    /* fall through */
  }
  let arr = pickArray(val)
  if (!arr) arr = pickArray(decode(String(text).trim()))
  if (!arr) return null
  const out = arr
    .filter((s) => typeof s === 'string')
    .map(cleanSource)
    .filter((s) => s.length >= 4) // drop empties + stray-char junk
  return out.length ? out : null
}

// Force sonar to emit valid JSON via structured output — without it, sonar
// returns malformed/no JSON on ~half of calls. Schema shape Perplexity expects.
const SOURCES_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    schema: {
      type: 'object',
      properties: { sources: { type: 'array', items: { type: 'string' } } },
      required: ['sources'],
    },
  },
}

// Discover sources in ONE fast call (structured output makes the JSON reliable,
// ~5s). Keep the best of up to 3 attempts only to guard the rare degenerate run
// that returns 0-2 junk entries; return early as soon as we have a usable list,
// so the common case is a single call. Returns [] only if every attempt fails
// (research then self-selects sources).
async function discoverSources({ product, market, context, providers }) {
  let best = []
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { text } = await run({
        stage: 'discovery',
        override: providers?.discovery,
        prompt: buildSourcesPrompt({ product, market, context }),
        maxTokens: 2000,
        responseFormat: SOURCES_RESPONSE_FORMAT,
      })
      const sources = parseSourceArray(text) || []
      if (sources.length > best.length) best = sources
      if (best.length >= 3) return best // good enough — don't pay for a 2nd call
    } catch {
      /* provider hiccup — one more try */
    }
  }
  return best
}

// Stage 0 — source discovery. The separate "find me the sources" step, so the
// user can review/edit the sources before the slow, paid deep-research call.
app.post(
  '/api/sources',
  handler(async (req, res) => {
    const { product, market, context, providers } = req.body || {}
    if (!product?.trim()) throw badRequest('product is required')

    const sources = await discoverSources({ product, market, context, providers })
    res.json({ sources })
  })
)

// Research + structure. The research provider (Perplexity, web-capable) mines
// customer voice; the structure provider (GPT-4o) turns that prose into segment cards.
app.post(
  '/api/research',
  handler(async (req, res) => {
    const { product, market, context, sources: approved, providers } = req.body || {}
    if (!product?.trim()) throw badRequest('product is required')

    // Use the sources the user approved (from /api/sources). If none were
    // passed, discover here as a fallback (non-fatal — empty is fine, research
    // then self-selects its own sources).
    let sources = Array.isArray(approved)
      ? approved.filter((s) => typeof s === 'string').map(cleanSource).filter(Boolean)
      : []
    if (!sources.length) {
      sources = await discoverSources({ product, market, context, providers })
    }

    // 2. Deep research. Owner = unlimited deep-research. Paid = deep-research,
    //    metered against the monthly plan quota (atomic INCR — can't be
    //    double-spent by concurrent requests). Free = cheap sonar-pro, one run
    //    ever per email (atomic claim — can't be farmed).
    let researchOverride = providers?.research
    if (req.plan === 'paid') {
      const { allowed, used, limit } = await consumeQuota(req.email, req.subPlan)
      if (!allowed) {
        const e = new Error(
          `You've used all ${limit} runs on your ${req.subPlan} plan this month. ` +
            `It resets on the 1st, or upgrade for more runs.`
        )
        e.status = 402
        throw e
      }
      void used // available if we want to surface "x of y used" client-side later
    } else if (req.plan === 'free') {
      const claimed = await claimFreeRun(req.email)
      if (!claimed) {
        const e = new Error('You have already used your free run. Subscribe to keep going.')
        e.status = 402
        throw e
      }
      researchOverride = { provider: 'perplexity', model: 'sonar-pro' }
    }
    const { text: rawResearch, citations } = await run({
      stage: 'research',
      override: researchOverride,
      prompt: buildResearchPrompt({ product, market, context, sources }),
      maxTokens: 16000,
    })

    // 3. Structure into segment cards. High cap so exhaustive extraction
    //    doesn't cut off mid-segment.
    const { text: structured } = await run({
      stage: 'structure',
      override: providers?.structure,
      prompt: buildStructurePrompt(rawResearch),
      maxTokens: 16000,
    })
    const segments = extractJson(structured)

    res.json({ segments, rawResearch, citations, sources })
  })
)

// Angles — creative divergence (OpenAI GPT-4o by default).
app.post(
  '/api/angles',
  handler(async (req, res) => {
    const { product, market, offerBrief, segment, providers } = req.body || {}
    if (!segment || !offerBrief?.trim()) throw badRequest('segment and offerBrief are required')

    const { text } = await run({
      stage: 'angles',
      override: providers?.angles,
      prompt: buildAnglesPrompt({ product, market, offerBrief, segment }),
      maxTokens: 12000,
    })
    res.json({ angles: extractJson(text) })
  })
)

// Headlines — on-brand ad copy (Claude by default).
app.post(
  '/api/headlines',
  handler(async (req, res) => {
    const { offerBrief, angles, providers } = req.body || {}
    if (!offerBrief?.trim() || !Array.isArray(angles) || !angles.length)
      throw badRequest('offerBrief and a non-empty angles array are required')

    const { text } = await run({
      stage: 'headlines',
      override: providers?.headlines,
      prompt: buildHeadlinesPrompt({ offerBrief, angles }),
      maxTokens: 12000,
    })
    res.json({ headlines: extractJson(text) })
  })
)

// Turn a reference ad image into a reusable layout template (config JSON).
// Uses the writing-stage provider, which must be vision-capable (Claude / GPT-4o).
app.post(
  '/api/template-from-ad',
  handler(async (req, res) => {
    const { image, providers } = req.body || {}
    if (!image?.startsWith('data:image/')) throw badRequest('image (a data URL) is required')

    const { text } = await run({
      stage: 'writing',
      override: providers?.writing,
      prompt: buildTemplateFromAdPrompt(),
      image,
      maxTokens: 2000,
    })
    res.json({ config: extractJson(text) })
  })
)

// Config snapshot — the UI uses this to render Settings + a readiness banner.
// Returns which providers have an env key (booleans only, never the values).
app.get(
  '/api/status',
  handler(async (req, res) => {
    const base = statusSnapshot()
    const email = String(req.headers['x-user-email'] || '').trim().toLowerCase()

    let account = { plan: 'anonymous' }
    if (TOOL_PASSWORD && req.headers['x-tool-password'] === TOOL_PASSWORD) {
      account = { plan: 'owner' }
    } else if (email && /.+@.+\..+/.test(email)) {
      const sub = await getSubscription(email)
      if (sub) {
        const usage = await getUsage(email, sub.plan)
        account = { plan: 'paid', subPlan: sub.plan, used: usage.used, limit: usage.limit }
      } else {
        account = { plan: 'free', freeRunUsed: await freeRunUsed(email) }
      }
    }

    res.json({ ...base, account })
  })
)

// In production, serve the built frontend from the same process.
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

const server = app.listen(config.port, () => {
  console.log(`Pipeline API on http://localhost:${config.port}`)
})
// Deep research can run several minutes (sometimes >5). Node's default 5-minute
// requestTimeout would cut the longest runs off, so disable it. Render's own
// ceiling (100 min) is the outer bound; headersTimeout still guards the header phase.
server.requestTimeout = 0
