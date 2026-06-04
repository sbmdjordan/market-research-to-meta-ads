// Curated "Official" templates — the owner's winning creatives, shared with
// every app instance. Each app fetches a JSON file the owner maintains; when
// the owner adds a winner there, everyone picks it up on their next load.
// Falls back to the bundled copy when offline or no URL is configured.

import bundled from './curated/curatedTemplates.json'

// Where the shared "Official" templates live. Defaults to the project's
// curated-templates.json on GitHub, so every clone gets the owner's winners
// automatically. Point your own fork's installs elsewhere with
// VITE_CURATED_TEMPLATES_URL.
const DEFAULT_URL =
  'https://raw.githubusercontent.com/sbmdjordan/market-research-to-meta-ads/main/curated-templates.json'
const REMOTE_URL = import.meta.env.VITE_CURATED_TEMPLATES_URL || DEFAULT_URL

export const BUNDLED_CURATED = Array.isArray(bundled) ? bundled : []

const valid = (t) => t && t.id && t.name && t.config

export async function fetchCurated() {
  if (!REMOTE_URL) return BUNDLED_CURATED
  try {
    const res = await fetch(REMOTE_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const list = Array.isArray(data) ? data.filter(valid) : []
    return list.length ? list : BUNDLED_CURATED
  } catch {
    // Offline / bad URL / down — never break the app over curated templates.
    return BUNDLED_CURATED
  }
}
