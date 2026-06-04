// Provider registry + per-stage resolution. The whole point: nobody is locked
// into Perplexity or Claude. Each stage (research / writing) can run on any
// supported provider, chosen via .env defaults or overridden per request from
// the Settings panel. Most vendors and local runners speak the OpenAI
// /chat/completions shape, so one "openai" type covers a huge range.

import 'dotenv/config'

// `web` = can this provider do live web search for the research stage, as wired
// here. `webSearch.mode` is HOW we switch it on for that stage:
//   native — the model already searches (nothing to do)
//   model  — swap to a search-capable model when no explicit model is set
//   suffix — append a suffix to the model id (OpenRouter `:online`)
//   tool   — pass a server-side web-search tool in the request (Claude)
export const PROVIDERS = {
  perplexity: {
    label: 'Perplexity',
    type: 'openai',
    baseURL: 'https://api.perplexity.ai',
    defaultModel: 'sonar-deep-research',
    models: ['sonar-deep-research', 'sonar-pro', 'sonar'],
    web: true,
    webSearch: { mode: 'native' },
    envKey: 'PERPLEXITY_API_KEY',
  },
  anthropic: {
    label: 'Anthropic (Claude)',
    type: 'anthropic',
    baseURL: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-6',
    models: ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5-20251001'],
    web: true,
    webSearch: { mode: 'tool' },
    envKey: 'ANTHROPIC_API_KEY',
  },
  openai: {
    label: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4o-search-preview'],
    web: true,
    // Research auto-uses the search model unless the user pins their own.
    webSearch: { mode: 'model', searchModel: 'gpt-4o-search-preview' },
    envKey: 'OPENAI_API_KEY',
  },
  openrouter: {
    label: 'OpenRouter (any model)',
    type: 'openai',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o',
    models: [
      'openai/gpt-4o',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-2.0-flash-exp',
      'meta-llama/llama-3.3-70b-instruct',
    ],
    web: true,
    // `:online` bolts web search onto any OpenRouter model.
    webSearch: { mode: 'suffix', suffix: ':online' },
    envKey: 'OPENROUTER_API_KEY',
  },
  custom: {
    label: 'Custom (OpenAI-compatible)',
    type: 'openai',
    baseURL: '', // supplied per request or via CUSTOM_BASE_URL
    defaultModel: '',
    models: [], // unknown endpoint — user types the model id
    web: false, // unknown endpoint — user must use a web-capable model themselves
    envKey: 'CUSTOM_API_KEY',
  },
}

// Stage defaults — overridable in .env so a clone can ship with different
// defaults without code changes.
const STAGE_DEFAULTS = {
  research: {
    provider: process.env.RESEARCH_PROVIDER || 'perplexity',
    model: process.env.RESEARCH_MODEL || '',
  },
  writing: {
    provider: process.env.WRITING_PROVIDER || 'anthropic',
    model: process.env.WRITING_MODEL || '',
  },
}

export function envKeyFor(providerId) {
  const p = PROVIDERS[providerId]
  return p ? process.env[p.envKey] || '' : ''
}

function err(message, code) {
  const e = new Error(message)
  e.status = 400
  if (code) e.code = code
  return e
}

// Merge: per-request override (from Settings) wins over .env default.
// Throws a clear 400 if the resulting config can't actually run.
export function resolveStage(stage, override = {}) {
  const def = STAGE_DEFAULTS[stage] || {}
  const providerId = (override.provider || def.provider || '').trim()
  const p = PROVIDERS[providerId]
  if (!p) throw err(`Unknown provider "${providerId}" for the ${stage} stage.`)

  const apiKey = (override.apiKey || '').trim() || envKeyFor(providerId)
  const explicitModel = (override.model || '').trim()
  let model = explicitModel || def.model || p.defaultModel
  const baseURL =
    (override.baseURL || '').trim() ||
    p.baseURL ||
    (providerId === 'custom' ? process.env.CUSTOM_BASE_URL || '' : '')

  // Turn on web search for the research stage. For openai/openrouter this just
  // rewrites the model (native search via the normal chat call); for anthropic
  // it sets a flag the transport uses to pass the web-search tool.
  let webSearch = false
  if (stage === 'research' && p.webSearch) {
    const ws = p.webSearch
    webSearch = true
    if (ws.mode === 'model' && !explicitModel && ws.searchModel) {
      model = ws.searchModel
    } else if (ws.mode === 'suffix' && ws.suffix && model && !model.endsWith(ws.suffix)) {
      model += ws.suffix
    }
  }

  if (!apiKey)
    throw err(`No API key for ${p.label} (${stage} stage). Add it in Settings or .env.`, 'MISSING_KEY')
  if (!baseURL) throw err(`No base URL set for ${p.label} (${stage} stage).`)
  if (!model) throw err(`No model set for ${p.label} (${stage} stage).`)

  return { providerId, type: p.type, label: p.label, apiKey, model, baseURL, web: p.web, webSearch }
}

// What the UI needs to render Settings + a readiness banner, without ever
// exposing key values — only whether each provider has an env key.
export function statusSnapshot() {
  const providers = {}
  for (const id of Object.keys(PROVIDERS)) providers[id] = Boolean(envKeyFor(id))

  const registry = Object.fromEntries(
    Object.entries(PROVIDERS).map(([id, p]) => [
      id,
      {
        label: p.label,
        defaultModel: p.defaultModel,
        models: p.models || [],
        web: p.web,
        webSearch: p.webSearch || null,
        custom: id === 'custom',
      },
    ])
  )

  return { providers, registry, defaults: STAGE_DEFAULTS }
}
