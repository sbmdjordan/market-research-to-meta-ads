// Per-stage provider settings, persisted in the browser. Empty fields mean
// "use the backend's .env default", so a user who set keys in .env never has to
// touch this. Keys entered here are stored locally and sent to the local
// backend — fine for personal use; prefer .env for hosted/shared setups.

const KEY = 'pipeline-settings'

export const DEFAULT_SETTINGS = {
  research: { provider: 'perplexity', model: '', apiKey: '', baseURL: '' },
  writing: { provider: 'anthropic', model: '', apiKey: '', baseURL: '' },
}

const mergeStage = (base, saved) => ({ ...base, ...(saved || {}) })

export function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (!s) return structuredClone(DEFAULT_SETTINGS)
    return {
      research: mergeStage(DEFAULT_SETTINGS.research, s.research),
      writing: mergeStage(DEFAULT_SETTINGS.writing, s.writing),
    }
  } catch {
    return structuredClone(DEFAULT_SETTINGS)
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

// A stage is runnable if it has a key from .env (status.providers[provider])
// or one typed into Settings.
export function stageReady(stageSettings, status) {
  if (!status) return true // unknown — don't block the UI
  if (stageSettings.apiKey && stageSettings.apiKey.trim()) return true
  return Boolean(status.providers?.[stageSettings.provider])
}
