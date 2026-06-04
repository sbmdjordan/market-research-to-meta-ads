// Tolerant JSON extraction. Models sometimes wrap JSON in ```fences``` or add
// a stray sentence — strip the noise and parse the first array/object. If the
// output was truncated mid-array (token cap hit), salvage the complete elements
// rather than failing the whole request.

export function extractJson(text) {
  if (!text) throw new Error('Empty model response')
  let t = text.trim()

  // Strip code fences if present.
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()

  // Slice from the first bracket.
  const start = t.search(/[[{]/)
  if (start === -1) throw new Error('No JSON found in model response')
  const open = t[start]
  const close = open === '[' ? ']' : '}'
  const end = t.lastIndexOf(close)
  const slice = t.slice(start, end + 1)

  try {
    return JSON.parse(slice)
  } catch (e) {
    // Truncated array → keep the complete objects, drop the cut-off tail.
    if (open === '[') {
      const salvaged = salvageArray(t.slice(start))
      if (salvaged) return JSON.parse(salvaged)
    }
    throw e
  }
}

// Walk a (possibly truncated) array string and return the prefix up to the last
// cleanly-closed top-level element, re-closed with `]`.
function salvageArray(s) {
  let depth = 0
  let inStr = false
  let esc = false
  let lastComplete = -1
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      // Closed a top-level element of the outer array (depth back to 1).
      if (depth === 1 && c === '}') lastComplete = i
    }
  }
  return lastComplete > 0 ? `${s.slice(0, lastComplete + 1)}]` : null
}
