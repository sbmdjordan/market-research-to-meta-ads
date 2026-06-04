// Step 4 — the generated headlines, each mapped back to its angle so you can
// see why it exists. Fully editable: tweak wording, drop weak ones, or add
// your own before they become creatives.
export default function StepHeadlines({ items, onEdit, onRemove, onAdd, onContinue, onBack }) {
  const usable = items.filter((it) => it.headline.trim()).length

  return (
    <div className="step-pane wide">
      <div className="step-head-row">
        <div>
          <h2 className="step-title">Headlines</h2>
          <p className="step-sub">
            {usable} headline{usable !== 1 ? 's' : ''}, one per angle. Edit, remove, or add
            your own — then turn them into ad creatives.
          </p>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          ← Offer brief
        </button>
      </div>

      <div className="headline-list">
        {items.map((it, i) => (
          <div key={i} className="headline-row">
            <span className="headline-num">{i + 1}</span>
            <div className="headline-main">
              <input
                className="headline-input"
                value={it.headline}
                placeholder="Headline"
                onChange={(e) => onEdit(i, e.target.value)}
              />
              {it.angle && <span className="headline-angle">{it.angle}</span>}
            </div>
            <button
              className="btn-icon btn-icon-danger"
              title="Remove"
              onClick={() => onRemove(i)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn-ghost add-headline" onClick={onAdd}>
        + Add your own headline
      </button>

      <button className="btn-cta" disabled={!usable} onClick={onContinue}>
        Make {usable} creative{usable !== 1 ? 's' : ''} →
      </button>
    </div>
  )
}
