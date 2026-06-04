import { useState, useLayoutEffect, useCallback } from 'react'

// Interactive walkthrough. Keeps the real screen visible, spotlights each tab/
// element in turn, and points an arrowed tooltip at it. `target` is a
// data-tour attribute on the element; null = a centered intro card.
const STEPS = [
  {
    target: null,
    title: 'Turn your product into research-backed Meta ads',
    body: "Give it a product; it finds who really buys it and why, then writes the angles, headlines, and ad images. Six steps — here's a quick tour of each tab up top.",
  },
  {
    target: 'stepper-0',
    title: 'Step 1 · Setup',
    body: 'Start here: describe what you sell and your market. The more specific, the sharper the research.',
  },
  {
    target: 'product',
    title: 'Your product goes here',
    body: 'One clear line is enough. Hover the example chips to see the level of detail that researches well.',
  },
  {
    target: 'stepper-1',
    title: 'Step 2 · Sources',
    body: 'First it finds the specific places your buyers actually talk (subreddits, reviewers, forums). You review and edit that list — add the sources you trust — before the deep research runs. Better sources = stronger evidence.',
  },
  {
    target: 'stepper-2',
    title: 'Step 3 · Segments',
    body: 'Real, sourced customer segments — overview, top pains, top desired outcomes, with an evidence tag. Open each for the full breakdown (objections, quotes, angles) and pick one to target.',
  },
  {
    target: 'stepper-3',
    title: 'Step 4 · Offer',
    body: 'Confirm a short offer brief so the copy stays grounded in what you actually sell.',
  },
  {
    target: 'stepper-4',
    title: 'Step 5 · Headlines',
    body: 'Every angle the research supports becomes a headline — as many as the research earns, not a fixed number. Edit them, drop weak ones, or add your own.',
  },
  {
    target: 'stepper-5',
    title: 'Step 6 · Creatives',
    body: 'One 1080×1080 ad image per headline, on your brand, across distinct designs. You can also add your own template from a winning ad. Export the whole set.',
  },
  {
    target: 'settings',
    title: 'Use any AI you like',
    body: 'Perplexity + Claude are the defaults, but you can switch provider and model per stage here — including free options for the writing stages.',
  },
  {
    target: 'cta',
    title: 'Ready? Kick it off',
    body: 'This first finds your sources (quick), then you approve them and the deep research runs — that part takes several minutes. Start it, then let it run.',
  },
]

export default function Tour({ onClose }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  const measure = useCallback(() => {
    if (!step.target) {
      setRect(null)
      return
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`)
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      setRect(el.getBoundingClientRect())
    } else {
      setRect(null)
    }
  }, [step.target])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  // Position the tooltip relative to the target (below if there's room, else above).
  let pos = 'center'
  let tipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  if (rect) {
    const below = rect.bottom + 230 < window.innerHeight
    pos = below ? 'below' : 'above'
    const cx = Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180)
    tipStyle = below
      ? { top: rect.bottom + 14, left: cx, transform: 'translateX(-50%)' }
      : { top: rect.top - 14, left: cx, transform: 'translate(-50%, -100%)' }
  }

  const next = () => (last ? onClose() : setI(i + 1))

  return (
    <>
      <div className={`tour-blocker ${rect ? '' : 'dim'}`} />
      {rect && (
        <div
          className="tour-spotlight"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}
      <div className={`tour-tip tour-${pos}`} style={tipStyle}>
        {rect && <span className="tour-arrow" />}
        <span className="tour-count">
          Step {i + 1} of {STEPS.length}
        </span>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <div className="tour-actions">
          <button className="btn-link" onClick={onClose}>
            Skip tour
          </button>
          <div className="tour-actions-right">
            {i > 0 && (
              <button className="btn-ghost" onClick={() => setI(i - 1)}>
                Back
              </button>
            )}
            <button className="btn-cta inline" onClick={next}>
              {last ? 'Done' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
