import { useState, useEffect } from 'react'

// What "Recommended (auto)" actually resolves to for this provider on this
// stage — mirrors the backend's resolveStage so the label is honest. Research
// swaps to a search model (OpenAI) or appends `:online` (OpenRouter).
function recommendedModel(stage, meta) {
  const base = meta.defaultModel || ''
  const ws = meta.webSearch
  if (stage === 'research' && meta.web && ws) {
    if (ws.mode === 'model' && ws.searchModel) return ws.searchModel
    if (ws.mode === 'suffix' && ws.suffix && base) return base + ws.suffix
  }
  return base
}

// One stage's provider config. Provider + model + (optional) key + (custom)
// base URL. Empty key = use the backend's .env key for that provider.
// Empty model = use the recommended default — nobody has to type a model id.
function StageEditor({ title, note, stage, registry, providers, value, onChange }) {
  const meta = registry?.[value.provider] || {}
  const models = meta.models || []
  const isCustom = value.provider === 'custom'
  const recommended = recommendedModel(stage, meta)
  const set = (patch) => onChange({ ...value, ...patch })
  const hasEnvKey = providers?.[value.provider]

  // "Other…" reveals a text box for a model not in the curated list.
  const [other, setOther] = useState(() => Boolean(value.model) && !models.includes(value.model))
  // Switching provider clears the carried-over model/baseURL and the Other state.
  useEffect(() => setOther(false), [value.provider])

  const changeProvider = (provider) => onChange({ ...value, provider, model: '', baseURL: '' })

  return (
    <div className="settings-stage">
      <h3>{title}</h3>
      {note && <p className="settings-note">{note}</p>}

      <label className="field-label">Provider</label>
      <select
        className="preset-select"
        value={value.provider}
        onChange={(e) => changeProvider(e.target.value)}
      >
        {Object.entries(registry || {}).map(([id, p]) => (
          <option key={id} value={id}>
            {p.label}
            {stage === 'research' && !p.web ? ' — no web search' : ''}
          </option>
        ))}
      </select>

      {isCustom && (
        <>
          <label className="field-label">Base URL</label>
          <input
            className="text-input"
            placeholder="https://your-endpoint/v1"
            value={value.baseURL}
            onChange={(e) => set({ baseURL: e.target.value })}
          />
        </>
      )}

      <label className="field-label">Model</label>
      {isCustom ? (
        <input
          className="text-input"
          placeholder="model id"
          value={value.model}
          onChange={(e) => set({ model: e.target.value })}
        />
      ) : (
        <>
          <select
            className="preset-select"
            value={other ? '__other__' : value.model}
            onChange={(e) => {
              const v = e.target.value
              if (v === '__other__') {
                setOther(true)
                set({ model: '' })
              } else {
                setOther(false)
                set({ model: v })
              }
            }}
          >
            <option value="">
              {recommended ? `Recommended — ${recommended}` : 'Recommended (auto)'}
            </option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value="__other__">Other…</option>
          </select>
          {other && (
            <input
              className="text-input"
              placeholder="model id"
              value={value.model}
              onChange={(e) => set({ model: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </>
      )}

      <label className="field-label">API key</label>
      <input
        className="text-input"
        type="password"
        placeholder={hasEnvKey ? 'Server already has a key — leave blank' : 'Enter API key'}
        value={value.apiKey}
        onChange={(e) => set({ apiKey: e.target.value })}
      />
      {stage === 'research' && meta.web && (
        <p className="settings-info">
          Does live web search on the research stage automatically.
        </p>
      )}
      {stage === 'research' && !meta.web && (
        <p className="settings-warn">
          A custom endpoint only searches the web if the model you point it at does. With a
          plain chat model, research will invent segments instead of mining real customer
          voice — point it at a web-capable model.
        </p>
      )}
    </div>
  )
}

export default function Settings({ status, settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings)
  const registry = status?.registry
  const providers = status?.providers

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>LLM settings</h2>
          <button className="banner-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">
          Use any provider per stage — Perplexity + Claude are the defaults. Paste your own API
          key for the stage you want to run; it&apos;s stored in this browser only.
        </p>

        <div className="settings-grid">
          <StageEditor
            title="Research stage"
            note="Mines real customer voice from the live web. Perplexity, OpenAI, OpenRouter and Claude do this automatically here."
            stage="research"
            registry={registry}
            providers={providers}
            value={draft.research}
            onChange={(research) => setDraft((d) => ({ ...d, research }))}
          />
          <StageEditor
            title="Writing stage"
            note="Structures research, then writes angles + headlines. Any chat model works."
            stage="writing"
            registry={registry}
            providers={providers}
            value={draft.writing}
            onChange={(writing) => setDraft((d) => ({ ...d, writing }))}
          />
        </div>

        <p className="settings-foot">
          Your keys are stored in this browser and sent to the server only to make your calls —
          never saved server-side or shared.
        </p>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-cta inline"
            onClick={() => {
              onSave(draft)
              onClose()
            }}
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  )
}
