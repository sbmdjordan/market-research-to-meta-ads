import { useState } from 'react'

const EVIDENCE_NOTE = {
  strong: 'Backed by multiple sources and real customer quotes.',
  moderate: 'Partially sourced — some real signal, some inferred.',
  thin: 'Mostly inferred or single-source — riskier to bet on.',
}

function List({ label, items }) {
  if (!items?.length) return null
  return (
    <div className="segment-block">
      <span className="segment-label">{label}</span>
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

function Text({ label, text }) {
  if (!text) return null
  return (
    <div className="segment-block">
      <span className="segment-label">{label}</span>
      <p>{text}</p>
    </div>
  )
}

function SegmentCard({ s, onPick }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="segment-card">
      <div className="segment-card-top">
        <h3>{s.name}</h3>
        {s.evidence && (
          <span className={`evidence evidence-${s.evidence}`} title={EVIDENCE_NOTE[s.evidence] || ''}>
            {s.evidence} evidence
          </span>
        )}
      </div>
      {s.hook && <p className="segment-hook">{s.hook}</p>}

      {/* Teaser when collapsed: overview + top 3 pains + top 3 desires */}
      {!open && (
        <>
          <List label="Pain points" items={s.pains?.slice(0, 3)} />
          <List label="Desired outcomes" items={s.desires?.slice(0, 3)} />
        </>
      )}

      {/* Full research breakdown */}
      {open && (
        <>
          <List label="Pain points" items={s.pains} />
          <List label="Desires & outcomes" items={s.desires} />
          <List label="Tried before (didn't work)" items={s.triedFailed} />
          <Text label="Why they'd buy this" text={s.whyBuy} />
          {s.objections?.length > 0 && (
            <div className="segment-block">
              <span className="segment-label">Objections → reframes</span>
              <ul>
                {s.objections.map((o, i) => (
                  <li key={i}>
                    <strong>{o.objection}</strong>
                    {o.reframe ? ` → ${o.reframe}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <List label="Emotional angles" items={s.emotionalAngles} />
          <List label="Logical angles" items={s.logicalAngles} />
          <Text label="Buying trigger" text={s.trigger} />
          {s.voiceOfCustomer?.length > 0 && (
            <div className="segment-block">
              <span className="segment-label">In their own words</span>
              <ul className="voc">
                {s.voiceOfCustomer.map((q, i) => (
                  <li key={i}>“{q}”</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button className="btn-link breakdown-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide breakdown ▴' : 'See full breakdown ▾'}
      </button>

      <button className="btn-cta small" onClick={() => onPick(s)}>
        Use this segment →
      </button>
    </div>
  )
}

// Step 2 — the research result as pickable cards. One segment per run (the
// human gate the skill insists on). Each card opens to the full breakdown, and
// the raw research + sources stay one click away.
export default function StepSegments({ research, onPick, onBack }) {
  const [openRaw, setOpenRaw] = useState(false)
  const segments = research?.segments || []

  return (
    <div className="step-pane wide">
      <div className="step-head-row">
        <div>
          <h2 className="step-title">Pick a segment to attack first</h2>
          <p className="step-sub">
            {segments.length} segment{segments.length !== 1 ? 's' : ''} found. Open each to see
            the full breakdown, then choose the one with the sharpest pain and best fit — you can
            run others later.
          </p>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          ← Start over
        </button>
      </div>

      <p className="evidence-legend">
        <strong>Evidence</strong> = how well-sourced a segment is in the research.{' '}
        <span className="evidence evidence-strong">strong</span> = multiple sources + real
        quotes · <span className="evidence evidence-moderate">moderate</span> = partial ·{' '}
        <span className="evidence evidence-thin">thin</span> = mostly inferred. Favour stronger
        evidence; thin segments are riskier bets.
      </p>

      {research.sources?.length > 0 && (
        <details className="sources-researched">
          <summary>Sources researched ({research.sources.length})</summary>
          <ul>
            {research.sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="segment-grid">
        {segments.map((s, i) => (
          <SegmentCard key={i} s={s} onPick={onPick} />
        ))}
      </div>

      <div className="raw-research">
        <button className="btn-link" onClick={() => setOpenRaw((v) => !v)}>
          {openRaw ? 'Hide' : 'View'} the raw research &amp; all sources
        </button>
        {openRaw && (
          <div className="raw-research-body">
            <pre>{research.rawResearch}</pre>
            {research.citations?.length > 0 && (
              <div className="citations">
                <span className="segment-label">Sources</span>
                <ol>
                  {research.citations.map((c, i) => (
                    <li key={i}>
                      <a href={c} target="_blank" rel="noreferrer">
                        {c}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
