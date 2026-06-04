// Angles-stage prompt. Ported from `/segment-angles-headlines` Step 5:
// extract EVERY ad angle the segment supports, in the avatar's own language,
// tagged by Type and Frame. The angle is the idea; headlines come next.

export function buildAnglesPrompt({ product, market, offerBrief, segment }) {
  return `
Product: ${product}
Market: ${market || 'unspecified'}

Offer brief (what the ad must sell):
${offerBrief}

Target segment (from research):
${JSON.stringify(segment, null, 2)}

From THIS segment's research only, list EVERY ad angle the material genuinely supports.
- Phrase each in the AVATAR'S OWN LANGUAGE — pull from the voice-of-customer lines and the segment's own framing. Do not sanitise into marketing-speak; this is raw research, not finished copy.
- The COUNT must be driven by the research, not a target. Extract as many or as few angles as the material actually supports: a thin, lightly-sourced segment might yield 6–10; a rich, well-evidenced one 25–35+. Never invent angles to reach a number, and never pad to a round figure like 40. If the research only supports 9 real angles, return 9.
- Each angle must be distinct — don't restate the same idea in slightly different words to inflate the list.
- The angle is the IDEA, not a headline. Don't polish it into copy yet.
- Tag each angle on two axes:
  - "type": one of "Pain point", "Desired outcome", "Other (identity/status)", "Other (community/belonging)", "Other (risk/future-proofing)" — name the other where it applies.
  - "frame": one of "Logical", "Emotional", "Other".

Return ONLY valid JSON (no markdown, no prose, no code fences):
[
  { "n": 1, "angle": "the angle in avatar language", "type": "...", "frame": "..." }
]
`.trim()
}
