import { useState } from 'react'

// Step 3 — the offer brief. Headlines are only as good as the offer behind
// them, so we pre-fill a draft from the product + chosen segment and let the
// user sharpen it. This text feeds the angle + headline prompts verbatim.
export default function StepBrief({ segment, draft, busy, onGenerate, onBack }) {
  const [brief, setBrief] = useState(draft)

  return (
    <div className="step-pane">
      <div className="step-head-row">
        <div>
          <h2 className="step-title">Confirm the offer</h2>
          <p className="step-sub">
            Targeting <strong>{segment.name}</strong>. Sharpen the brief — add real
            numbers or proof if you have them.
          </p>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          ← Segments
        </button>
      </div>

      <textarea
        className="field-textarea tall"
        rows={9}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
      />

      <button
        className="btn-cta"
        disabled={busy || !brief.trim()}
        onClick={() => onGenerate(brief.trim())}
      >
        {busy ? 'Generating…' : 'Generate angles & headlines →'}
      </button>
      <p className="cta-note">
        Extracts every angle this segment supports, then one headline each.
      </p>
    </div>
  )
}
