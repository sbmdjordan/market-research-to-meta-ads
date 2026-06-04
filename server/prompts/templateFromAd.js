// Vision prompt: study a reference Meta ad and emit a reusable LAYOUT template
// as config. Capture the composition/style, NOT the literal pixels — the
// headline, brand and palette get swapped in, and any photo becomes an empty
// image slot the user fills with their own asset (the reference image is the
// competitor's, so we never reuse it).

export function buildTemplateFromAdPrompt() {
  return `
You are looking at a successful Meta (Facebook/Instagram) static ad. Reverse-engineer its LAYOUT and STYLE into a reusable template, so a different brand can drop in their own headline, colours, and image and get the same composition.

Capture the structure, NOT the specific words or the exact pixels:
- Where does the headline sit (top/center/bottom, left/center/right)? How is it aligned? Big and dominant, or compact?
- Is the background a solid colour, a gradient, a two-part split, or a photo/graphic?
- Is there an accent shape — a bar down one side, a rule across the top/bottom, an underline?
- Where does the brand/logo sit?

Map your reading onto this exact JSON shape. Use the palette KEYS (not literal hex) so it adopts the user's brand colours. Palette keys: "navy" (darkest), "navyMid", "navyLight", "accent", "accentDark", "white", "offWhite".

{
  "name": "a short 2-3 word name for this style",
  "background": {
    "type": "solid" | "gradient" | "split" | "image",
    "colorKey": "navy",                         // for solid
    "fromKey": "navy", "toKey": "accentDark", "angle": 135,   // for gradient
    "orientation": "vertical" | "horizontal", "firstKey": "navy", "secondKey": "accent", "ratio": 0.5,  // for split
    "scrimKey": "navy", "scrimOpacity": 0.45    // for image: a dark overlay so text stays readable
  },
  "headline": {
    "vertical": "top" | "center" | "bottom",
    "horizontal": "left" | "center" | "right",
    "align": "left" | "center" | "right",
    "colorKey": "white",
    "sizeScale": 1.0,            // 0.8 = smaller/compact, 1.2 = bigger/dominant
    "uppercase": false,
    "weight": 800,
    "maxWidthPct": 80
  },
  "accent": { "type": "none" | "bar-left" | "bar-top" | "bar-bottom" | "underline", "colorKey": "accent" },
  "brand": { "show": true, "vertical": "bottom" | "top", "horizontal": "left" | "center" | "right", "showUrl": false, "colorKey": "accent" }
}

Rules:
- If the ad uses a photo or product shot as the background, set "background.type": "image" (the user supplies their own image into the slot — never reuse the reference photo) and pick a sensible scrim so the headline stays legible.
- Choose colour keys that echo the ad's mood (dark/bold/light), but always keys, never hex.
- Only include the fields relevant to the chosen background type.
- Return ONLY the JSON object — no markdown, no prose, no code fences.
`.trim()
}
