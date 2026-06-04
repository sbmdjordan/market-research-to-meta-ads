// Shared helpers for all ad templates.
// Templates stay self-contained for layout/style; only headline sizing
// and line-splitting live here so the fit logic is tuned in one place.

const FONT_STACK =
  "'Inter', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"

export { FONT_STACK }

// Pick a headline font size that fits a 1080px creative.
// Longer headlines shrink toward `min`. Each template passes its own
// range so a tight layout can run smaller than a roomy one.
export function fitFont(text, { max = 104, min = 46, longAt = 82 } = {}) {
  const len = String(text).replace(/\n/g, ' ').trim().length
  if (len <= 24) return max
  if (len >= longAt) return min
  const t = (len - 24) / (longAt - 24)
  return Math.round(max - t * (max - min))
}

// Respect explicit newlines; otherwise let the box wrap naturally.
export function lines(headline) {
  return String(headline).split('\n')
}
