import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Light editorial: off-white, small accent kicker, large left
// headline, generous whitespace, thin footer divider.
const Minimal = forwardRef(function Minimal(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 90, min: 44, longAt: 86 })
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        background: palette.offWhite,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '130px 120px',
        boxSizing: 'border-box',
      }}
    >
      {brand?.wordmark && (
        <div
          style={{
            color: palette.accentDark,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          {brand.wordmark}
        </div>
      )}
      <div
        style={{
          width: 90,
          height: 6,
          background: palette.accent,
          marginBottom: 48,
        }}
      />
      <div
        style={{
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.12,
          color: palette.navy,
          textAlign: 'left',
          letterSpacing: '-0.015em',
        }}
      >
        {lines(headline).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          bottom: 96,
          borderTop: `2px solid ${palette.navy}`,
          opacity: 0.12,
        }}
      />
    </div>
  )
})

export default Minimal
