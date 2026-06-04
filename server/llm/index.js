// LLM dispatch. Resolve the stage's effective provider config (env default +
// per-request override), then call the matching transport. Endpoints don't
// need to know which provider ran — they just get { text, citations }.

import { resolveStage } from '../providers.js'
import { callOpenAICompatible } from './openaiCompatible.js'
import { callAnthropic } from './anthropic.js'

export async function run({ stage, override, system, prompt, maxTokens, image }) {
  const cfg = resolveStage(stage, override)
  const transport = cfg.type === 'anthropic' ? callAnthropic : callOpenAICompatible
  return transport({
    baseURL: cfg.baseURL,
    apiKey: cfg.apiKey,
    model: cfg.model,
    system,
    prompt,
    maxTokens,
    // openai/openrouter encode search in the model id, so they ignore this.
    // anthropic uses it to attach the server-side web-search tool.
    webSearch: cfg.webSearch,
    // A data URL — triggers the multimodal request shape (vision).
    image,
  })
}
