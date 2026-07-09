// Source-discovery step — the separate "find me the relevant sources" prompt
// from the original workflow. Run BEFORE the deep research so the research
// mines specific, real communities instead of self-selecting shallow ones.
// Picks a MINIMUM covering set of real, named sources (no fixed count),
// branches the source palette on B2B vs B2C so a B2B tool doesn't get biased
// toward consumer channels (Amazon/TikTok) or vice versa, and enforces
// reality + thin-data discipline so it doesn't invent obscure venues.
// Runs on Perplexity sonar (web-grounded) so it can confirm sources are real.

export function buildSourcesPrompt({ product, market, context }) {
  const marketLine =
    market === 'B2B'
      ? 'This is a B2B offering.'
      : market === 'B2C'
      ? 'This is a B2C offering.'
      : 'Infer B2B vs B2C from the description.'

  return `
You pick the research sources for deep market research. ONE job: source selection. You do not run the research.

Product: ${product}
${marketLine}${context ? `\nContext / constraints: ${context}` : ''}

Pick the MINIMUM set of real, specific places where THIS product's buyers actually congregate. Add a source only when it reaches a buyer population the others miss — never for completeness. A niche B2B tool might be 4 sources; a broad consumer product spanning Amazon + TikTok + Reddit + reviews might be 8. No fixed count. The ceiling is depth-dilution (a deep-research run has a finite budget — spread it thin and you lose the verbatim depth that is the point), not a number.

Match source TYPES to what this is — do NOT default to consumer channels for a B2B tool, or vice versa:
- B2B software / SaaS / tools / services / marketplaces → Reddit (name the real subs), G2 + Capterra reviews (name the category + real competitor products), LinkedIn & X/Twitter posts from the actual buyer roles, Indie Hackers, Hacker News (Ask HN), Product Hunt launch comments, niche Slack/Discord communities. NOT Amazon consumer reviews, NOT TikTok.
- Physical consumer products → Amazon reviews, TikTok comments, YouTube review videos, Reddit, Instagram comments.
- Local services → Google reviews, Yelp, Nextdoor, Facebook groups, local subreddits.
- Coaching / courses / info products → YouTube comments on related content, Reddit, Skool/Circle, X/Twitter, Facebook groups.
- Hospitality / travel → TripAdvisor, Booking.com, travel subreddits, Instagram, YouTube vlogs.

Always include, where they exist: 3–9 NAMED real competitors, plus their ads via Google Ads Transparency Center, Meta Ad Library, and LinkedIn ads. Competitor ads and comment sections are where buyer language is richest.

Reality discipline (this is critical — the failure mode is inventing sources):
- Name only platforms, communities, subreddits, and competitors you are confident are REAL. Use your web search to confirm the competitor set and any specific named venue actually exists and is relevant.
- Never invent an obscure blog, review page, forum, or Facebook group to sound specific. If you can't confirm a specific named venue, describe the venue TYPE and what to search there instead (e.g. "G2 reviews of the marketing-automation category" rather than a made-up page).
- Discard any source that merely string-matches a name but is unrelated (a same-named business in another country, an off-topic sub).

Thin-data decomposition (for novel or hyper-local concepts): if the literal product has no real online customer voice — no reviews, no active sub, no busy forum — do NOT point research at it and manufacture junk. Decompose into adjacent PROVEN communities that do have voice, source those, and label each such entry as adjacent so findings get mapped back (e.g. "Adjacent — ...").

Each entry = one concrete source: the platform plus the specific named venues, plus a short clause on WHAT to mine there. Group related venues of the same platform into one entry (e.g. the relevant subreddits together). Be concrete: "r/SaaS, r/startups, r/Entrepreneur — threads on marketing stack setup, first marketing hire, founder-led GTM pain" beats "Reddit".

Return ONLY a JSON array of short strings, one source per entry. No fixed count. No prose, no markdown, no code fences.
`.trim()
}
