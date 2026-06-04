// Writing rules bundled into the headline stage. Ported from the source
// `/writing` skill, trimmed to what governs short-form ad copy. The banned
// list is a hard rule — never relax it.

export const WRITING_RULES = `
WRITING RULES (apply to every headline):

Core:
- Clarity over cleverness. Simple, concrete language wins.
- Lead strong. The best word/idea goes first or last, never buried.
- Cut aggressively. No filler, no throat-clearing, no padding.
- Write to one specific person (this avatar), not a crowd.

Sentence-level:
- Short, simple words over complex ones. Strong verbs, few adverbs (no "-ly" crutches).
- Active voice. Keep related words close.
- Specifics beat vague claims: a number, a named pain, or a sharp contrast beats wordplay.
- No weak intensifiers (very, really, quite).

Banned words and phrases — never use, no variations:
- "hit" / "hits" / "hits different" / "hit harder" / any "hit" slang
- "here's what nobody talks about" / "nobody talks about X" / "no one is talking about X" / similar
- AI slop: "delve", "unleash", "elevate", "leverage", "game-changer", "cutting-edge",
  "dive in", "let's unpack", "it's worth noting", "in today's world", "at the end of the day"
`.trim()
