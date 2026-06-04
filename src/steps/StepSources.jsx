import { useState } from 'react'

// Step 2 — review and edit the sources before the deep research runs. This is
// the gate: hand-feeding it the subreddits/reviewers you trust is the most
// reliable way to get strong evidence. Editable list; add your own; remove any.
export default function StepSources({ sources, busy, onResearch, onBack }) {
  const [list, setList] = useState(sources || [])
  const [draft, setDraft] = useState('')

  const remove = (i) => setList((l) => l.filter((_, idx) => idx !== i))
  const add = () => {
    const v = draft.trim()
    if (v) {
      setList((l) => [...l, v])
      setDraft('')
    }
  }

  return (
    <div className="step-pane wide">
      <div className="step-head-row">
        <div>
          <h2 className="step-title">Sources to research</h2>
          <p className="step-sub">
            These are the places we&apos;ll mine for real customer voice. Add the
            subreddits, reviewers, or forums you trust, and remove any that don&apos;t fit —
            better sources mean stronger evidence.
          </p>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          ← Setup
        </button>
      </div>

      <div className="source-edit-list">
        {list.map((s, i) => (
          <div key={i} className="source-edit-row">
            <span className="source-edit-text">{s}</span>
            <button className="btn-icon btn-icon-danger" title="Remove" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <p className="helper-text">No sources yet — add the ones you want researched below.</p>
        )}
      </div>

      <div className="source-add-row">
        <input
          className="text-input"
          placeholder="Add a source (e.g. r/onebag, Carryology, a competitor site)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn-ghost" onClick={add}>
          Add
        </button>
      </div>

      <button
        className="btn-cta"
        disabled={busy || list.length === 0}
        onClick={() => onResearch(list)}
      >
        {busy ? 'Researching…' : `Research these ${list.length} source${list.length !== 1 ? 's' : ''} →`}
      </button>
      <p className="cta-note">
        This is the slow, paid step — deep research takes several minutes (often 5–10).
      </p>
    </div>
  )
}
