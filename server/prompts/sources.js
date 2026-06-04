// Source-discovery step — the separate "find me the relevant sources" prompt
// from the original workflow. Run BEFORE the deep research so the research
// mines specific, real communities instead of self-selecting shallow ones.
// Uses the writing model (like the original skill, where the assistant picked
// sources from its knowledge), so it's a fast, cheap pre-step.

export function buildSourcesPrompt({ product, market, context }) {
  return `
I'm about to run deep customer research for this product, and I need you to find the BEST places to research first.

Product: ${product}
${market ? `Market: ${market}` : ''}
${context ? `Context / constraints: ${context}` : ''}

List the SPECIFIC, REAL sources where buyers of THIS product (at this price point, in this context) actually talk — not generic categories. Be concrete and named:
- Named subreddits (e.g. "r/onebag", "r/BuyItForLife")
- Specific forums / communities / Discords / Facebook groups
- Named review hubs, blogs, and editorial sites that cover this product
- Notable YouTube channels / creators who review it
- Marketplaces with rich reviews — name the kind of listing (e.g. "Amazon reviews of competing >£100 travel backpacks")
- 2–4 named competitor brands / sites whose own reviews, ads, and comments reveal buyer language

Favour places with deep, real customer voice for this EXACT product and price tier. Prefer specificity over breadth.

Return ONLY a JSON array of short strings, each a single specific named source. 10–18 entries. No prose, no markdown, no code fences.
`.trim()
}
