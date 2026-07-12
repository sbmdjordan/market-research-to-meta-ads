import { useState } from 'react'

// One example per business type — click to fill the field. Each leads with a
// concrete deliverable + who it's for, which is the shape that researches well.
const EXAMPLES = [
  { label: 'Ecom', text: "A weighted sleep mask for people who can't switch their brain off at night, sold on Shopify" },
  { label: 'SaaS', text: 'Appointment-scheduling software with automated reminders for small dental clinics' },
  { label: 'Info product', text: 'A 6-week online course teaching complete beginners to paint with watercolors' },
  { label: 'Digital service', text: 'A done-for-you podcast editing service for founders: you record, we deliver publish-ready episodes' },
]

// Step 1 — the only thing the user types to start: what they sell + market.
// Kicks off the slow, paid deep-research call, so we flag that plainly.
export default function StepSetup({ initial, busy, onRun, onPreview }) {
  const [product, setProduct] = useState(initial.product || '')
  const [market, setMarket] = useState(initial.market || '')
  const [context, setContext] = useState(initial.context || '')
  // Hovering a chip previews its example as placeholder text (only visible
  // while the box is empty); leaving reverts to an empty box ready to type.
  const [preview, setPreview] = useState(null)

  const canRun = product.trim().length > 0 && !busy

  return (
    <div className="step-pane">
      <h2 className="step-title">What are you selling?</h2>
      <p className="step-sub">
        Describe the product or service. More detail means sharper research.
      </p>

      <label className="field-label">Product or service</label>
      <textarea
        className="field-textarea"
        data-tour="product"
        rows={3}
        placeholder={preview || ''}
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />
      <div className="example-chips">
        <span className="example-lead">Hover an example:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            className="example-chip"
            onMouseEnter={() => setPreview(ex.text)}
            onMouseLeave={() => setPreview(null)}
            onFocus={() => setPreview(ex.text)}
            onBlur={() => setPreview(null)}
            onClick={() => setProduct(ex.text)}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <label className="field-label">Market</label>
      <div className="segmented">
        {['B2C', 'B2B', 'Auto'].map((m) => {
          const val = m === 'Auto' ? '' : m
          return (
            <button
              key={m}
              type="button"
              className={`segmented-btn ${market === val ? 'active' : ''}`}
              onClick={() => setMarket(val)}
            >
              {m}
            </button>
          )
        })}
      </div>

      <label className="field-label">Context (optional)</label>
      <textarea
        className="field-textarea"
        rows={2}
        placeholder="Geography, price point, positioning, competitors, segments to exclude…"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />

      <button
        className="btn-cta"
        data-tour="cta"
        disabled={!canRun}
        onClick={() => onRun({ product: product.trim(), market, context: context.trim() })}
      >
        {busy ? 'Researching…' : 'Run research →'}
      </button>
      <p className="cta-note">
        Real deep research across the live web — it usually takes several minutes (often
        5–10, sometimes longer). Kick it off and let it run.
      </p>

      {onPreview && (
        <button className="btn-link preview-link" onClick={onPreview}>
          Just want to see the ad templates? Preview them — no key needed →
        </button>
      )}
    </div>
  )
}
