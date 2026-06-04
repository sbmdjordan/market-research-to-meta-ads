// Research-stage prompt. Ported from the `/customer-segments` skill: deep
// market research that mines REAL customer voice, with source-selection
// guidance, evidence honesty, and anti-hallucination citation discipline.
// Sent to Perplexity deep research.

export function buildResearchPrompt({ product, market, context, sources = [] }) {
  const marketLine =
    market === 'B2B'
      ? 'This is a B2B offering.'
      : market === 'B2C'
      ? 'This is a B2C offering.'
      : 'Infer whether this is B2B or B2C from the description and state your assumption.'

  const sourceBlock =
    sources.length > 0
      ? `Mine these specific sources first — they were chosen because this product's buyers gather there. Go INTO them, pull real comments/reviews/threads, and follow links to other strong sources you find along the way:
${sources.map((s) => `- ${s}`).join('\n')}

Dig deep into each — quote real customer language. Do not stay on the surface or rely on generic summaries.`
      : `Choose sources by where THIS product's buyers actually congregate — Amazon/marketplace reviews, the relevant subreddits and forums, YouTube reviews + comments, competitor sites and ads. Always include competitor websites and competitor ads where they exist.`

  return `
I'm selling: ${product}

${marketLine}${context ? `\n\nExtra context / constraints: ${context}` : ''}

Perform deep market research to identify all realistic audience segments who would buy this product/service.

${sourceBlock}

For each audience segment, break down clearly:
- Their core pain points
- Their desires and the outcomes they want
- What they've already tried that hasn't worked
- Why they would buy this (USP match)
- Their top objections, each paired with the reframe that answers it
- The most effective emotional marketing angles
- The most effective logical marketing angles
- The trigger / buying moment — what just changed that makes them look now
- Verbatim or closely paraphrased phrases in their own words (voice of customer)

Go deep. Raw, real-world insights — not assumptions. This is about mindsets, problems, and buying psychology, not demographics. Structure everything clearly by audience type.

Depth over breadth (important): aim for 4–8 segments, but only as many as you can back with REAL, MULTIPLE sources. For EVERY segment, pull at least 2–3 distinct corroborating sources and several direct customer quotes, each with its citation. A few deeply-evidenced segments beat many thin ones — it is better to return 4 segments rich with real, quoted customer voice than 8 you can barely source. Cut any segment you cannot back with genuine sourced quotes; never invent or pad to hit a number.

Completion priority: finish every segment fully (all breakdown points) before starting another. If running long, stop adding segments and complete the ones started. Never leave a segment cut off.

Citation discipline: only cite sources genuinely about this specific product, audience, and location. Discard any source that merely string-matches a name but is unrelated (e.g. a same-named business in another country).

Evidence honesty: where real-world evidence for a segment is thin, say so plainly and label inferred points as inferred. Every voice-of-customer quote must be a real sourced quote or close paraphrase with its citation — never fabricate quotes or invent customer language. If a segment has no genuine sourced customer voice, state that instead of inventing it.
`.trim()
}
