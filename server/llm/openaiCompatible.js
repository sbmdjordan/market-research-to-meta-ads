// Generic OpenAI-compatible chat caller. Covers OpenAI, OpenRouter, Groq,
// Together, Mistral, DeepSeek, Perplexity, and any self-hosted/custom endpoint
// that speaks POST {baseURL}/chat/completions. Returns text + any citations
// the provider attaches (Perplexity does; most don't).

import { fetch, longCallAgent } from './http.js'

export async function callOpenAICompatible({ baseURL, apiKey, model, system, prompt, maxTokens = 8000, image }) {
  const messages = []
  if (system) messages.push({ role: 'system', content: system })
  // With an image (a data URL), use the multimodal content array shape.
  messages.push(
    image
      ? {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } },
          ],
        }
      : { role: 'user', content: prompt }
  )

  const res = await fetch(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
    dispatcher: longCallAgent,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err = new Error(`Provider API error ${res.status}: ${body.slice(0, 400)}`)
    err.status = res.status === 401 ? 400 : 502
    throw err
  }

  const data = await res.json()
  const msg = data.choices?.[0]?.message || {}
  const text = (msg.content || '').trim()

  // Citation shapes differ by provider when web search ran:
  //   Perplexity/OpenRouter → top-level `citations` (URLs) or `search_results`
  //   OpenAI search-preview  → `message.annotations` of type url_citation
  let citations = []
  if (Array.isArray(data.citations)) {
    citations = data.citations
  } else if (Array.isArray(msg.annotations)) {
    citations = msg.annotations
      .filter((a) => a.type === 'url_citation')
      .map((a) => a.url_citation?.url)
      .filter(Boolean)
  } else if (Array.isArray(data.search_results)) {
    citations = data.search_results.map((r) => r.url).filter(Boolean)
  }

  return { text, citations: [...new Set(citations)] }
}
