// Headlines-stage prompt. Ported from `/segment-angles-headlines` Step 6:
// exactly one Meta static-ad headline per angle, mapping preserved, with the
// writing rules applied. The headline is the ONLY text on the creative.

import { WRITING_RULES } from './writing.js'

export function buildHeadlinesPrompt({ offerBrief, angles }) {
  return `
${WRITING_RULES}

CONTEXT — each headline is the ONLY text on a 1080×1080 Meta (Facebook/Instagram) static ad. Its single job: make this specific avatar stop and click the button through to the landing page, wanting the offer. Use the avatar's own language wherever it lands harder than polished copy.

Offer brief:
${offerBrief}

For EVERY angle below, write exactly one headline.
- One headline per angle. Keep the angle→headline mapping intact (return the angle's "n").
- Specific beats clever — a number, a named pain, or a sharp contrast beats wordplay.
- Match the angle's frame: emotional angles get a felt headline; logical angles get a concrete/quantified one.
- Short enough to read as one on-image line — aim ≤ ~12 words / ~60 chars; tighter is better.

Angles:
${JSON.stringify(angles, null, 2)}

Return ONLY valid JSON (no markdown, no prose, no code fences):
[
  { "n": 1, "angle": "the original angle", "headline": "the headline" }
]
`.trim()
}
