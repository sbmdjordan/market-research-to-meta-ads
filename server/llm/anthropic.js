// Anthropic (Claude) caller. Claude's Messages API isn't OpenAI-shaped, so it
// gets its own module. Same return shape as the generic caller so the
// dispatcher doesn't care which provider ran.
//
// When `webSearch` is set (research stage), we attach Claude's server-side
// web-search tool. Claude runs the searches itself and returns final text with
// citations embedded — no tool round-trip on our side.

export async function callAnthropic({ baseURL, apiKey, model, system, prompt, maxTokens = 8000, webSearch, image }) {
  // With an image (a data URL "data:<mime>;base64,<data>"), send an image block.
  let content = prompt
  if (image) {
    const m = /^data:(.*?);base64,(.*)$/.exec(image)
    if (m) {
      content = [
        { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } },
        { type: 'text', text: prompt },
      ]
    }
  }

  const body = {
    model,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content }],
  }
  if (webSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]
  }

  const res = await fetch(`${baseURL.replace(/\/$/, '')}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    const err = new Error(`Anthropic API error ${res.status}: ${errBody.slice(0, 400)}`)
    err.status = res.status === 401 ? 400 : 502
    throw err
  }

  const data = await res.json()
  const blocks = data.content || []

  const text = blocks
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  // Citations live in two places when web search ran: the search-result blocks,
  // and per-sentence citations attached to text blocks.
  const citations = []
  for (const b of blocks) {
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) if (r.url) citations.push(r.url)
    }
    if (b.type === 'text' && Array.isArray(b.citations)) {
      for (const c of b.citations) if (c.url) citations.push(c.url)
    }
  }

  return { text, citations: [...new Set(citations)] }
}
