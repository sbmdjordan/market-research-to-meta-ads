import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Horizontal split: navy headline panel on top, solid accent
// footer band below. Straight seam (html2canvas-safe).
const SplitPanel = forwardRef(function SplitPanel(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 92, min: 44, longAt: 82 })
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: '0 0 760px',
          background: `linear-gradient(160deg, ${palette.navy} 0%, ${palette.navyLight} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '90px 110px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: size,
            fontWeight: 800,
            lineHeight: 1.1,
            color: palette.white,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          {lines(headline).map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          background: palette.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 110px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            color: palette.navy,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {brand?.wordmark || ''}
        </div>
        <div
          style={{
            color: palette.navy,
            fontSize: 30,
            fontWeight: 700,
            opacity: 0.85,
          }}
        >
          {brand?.url || ''}
        </div>
      </div>
    </div>
  )
})

export default SplitPanel
