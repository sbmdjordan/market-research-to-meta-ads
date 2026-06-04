// Turns the research prose into a clean segments JSON array so the UI can
// show pickable cards. Faithful extraction only — no inventing.

export function buildStructurePrompt(rawResearch) {
  return `
Below is deep market research about a product's audience segments. Convert it into a JSON array of segments. Extract faithfully from the text — do NOT invent, embellish, or add segments or facts that aren't supported by the research.

Return ONLY valid JSON (no markdown, no prose, no code fences). Shape:

[
  {
    "name": "short segment name",
    "hook": "one-line description of who they are",
    "pains": ["..."],
    "desires": ["..."],
    "triedFailed": ["things they've tried that didn't work"],
    "whyBuy": "why this product fits them (USP match)",
    "objections": [{ "objection": "...", "reframe": "..." }],
    "emotionalAngles": ["..."],
    "logicalAngles": ["..."],
    "trigger": "the buying moment — what just changed",
    "voiceOfCustomer": ["verbatim or close-paraphrase quotes from the research"],
    "evidence": "strong | moderate | thin — how well-sourced this segment is per the research"
  }
]

Rules:
- One object per segment the research describes.
- Be EXHAUSTIVE, not a summary. Capture every pain, desire, thing-they've-tried, objection, and angle the research gives for each segment — if the research lists eight pains, return all eight. Do not trim to three bullets. The only limit is what the research actually contains.
- Add nothing fake. Don't invent points to pad a segment out.
- "voiceOfCustomer": include every real quote the research contains for that segment. If it has none, use an empty array — never fabricate one.
- "evidence": grade by what the research actually contains for that segment — "strong" = backed by 2+ distinct sources AND 2+ real verbatim quotes; "moderate" = some sourcing or a single quote; "thin" = mostly inferred / no real quotes. Judge honestly; don't inflate, but don't undersell a segment that genuinely has multiple sources and quotes.

RESEARCH:
${rawResearch}
`.trim()
}
