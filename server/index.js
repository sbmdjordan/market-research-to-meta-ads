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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '2mb' }))

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

// Stage 0 — source discovery. The separate "find me the sources" step, so the
// user can review/edit the sources before the slow, paid deep-research call.
app.post(
  '/api/sources',
  handler(async (req, res) => {
    const { product, market, context, providers } = req.body || {}
    if (!product?.trim()) throw badRequest('product is required')

    const { text } = await run({
      stage: 'writing',
      override: providers?.writing,
      prompt: buildSourcesPrompt({ product, market, context }),
      maxTokens: 2000,
    })
    const parsed = extractJson(text)
    const sources = Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
    res.json({ sources })
  })
)

// Stage 1 — research. The research provider (web-capable) mines customer voice;
// the writing provider structures that prose into pickable segment cards.
app.post(
  '/api/research',
  handler(async (req, res) => {
    const { product, market, context, sources: approved, providers } = req.body || {}
    if (!product?.trim()) throw badRequest('product is required')

    // Use the sources the user approved (from /api/sources). If none were
    // passed, discover here as a fallback (non-fatal).
    let sources = Array.isArray(approved) ? approved.filter((s) => typeof s === 'string') : []
    if (!sources.length) {
      try {
        const { text: srcText } = await run({
          stage: 'writing',
          override: providers?.writing,
          prompt: buildSourcesPrompt({ product, market, context }),
          maxTokens: 2000,
        })
        const parsed = extractJson(srcText)
        if (Array.isArray(parsed)) sources = parsed.filter((s) => typeof s === 'string')
      } catch {
        sources = [] // research falls back to self-selecting sources
      }
    }

    // 2. Deep research, mining those sources. High cap so the report isn't
    //    truncated before it covers every segment.
    const { text: rawResearch, citations } = await run({
      stage: 'research',
      override: providers?.research,
      prompt: buildResearchPrompt({ product, market, context, sources }),
      maxTokens: 16000,
    })

    // 3. Structure into segment cards. High cap so exhaustive extraction
    //    doesn't cut off mid-segment.
    const { text: structured } = await run({
      stage: 'writing',
      override: providers?.writing,
      prompt: buildStructurePrompt(rawResearch),
      maxTokens: 16000,
    })
    const segments = extractJson(structured)

    res.json({ segments, rawResearch, citations, sources })
  })
)

// Stage 2 — angles (writing provider).
app.post(
  '/api/angles',
  handler(async (req, res) => {
    const { product, market, offerBrief, segment, providers } = req.body || {}
    if (!segment || !offerBrief?.trim()) throw badRequest('segment and offerBrief are required')

    const { text } = await run({
      stage: 'writing',
      override: providers?.writing,
      prompt: buildAnglesPrompt({ product, market, offerBrief, segment }),
      maxTokens: 12000,
    })
    res.json({ angles: extractJson(text) })
  })
)

// Stage 3 — headlines (writing provider).
app.post(
  '/api/headlines',
  handler(async (req, res) => {
    const { offerBrief, angles, providers } = req.body || {}
    if (!offerBrief?.trim() || !Array.isArray(angles) || !angles.length)
      throw badRequest('offerBrief and a non-empty angles array are required')

    const { text } = await run({
      stage: 'writing',
      override: providers?.writing,
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
app.get('/api/status', (req, res) => {
  res.json(statusSnapshot())
})

// In production, serve the built frontend from the same process.
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(config.port, () => {
  console.log(`Pipeline API on http://localhost:${config.port}`)
})
