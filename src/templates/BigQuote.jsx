import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Full accent colour field, navy headline, oversized quote glyph.
// The boldest, most distinct creative in the set.
const BigQuote = forwardRef(function BigQuote(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 96, min: 46, longAt: 82 })
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        background: palette.accent,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 120,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 90,
          fontSize: 420,
          lineHeight: 1,
          fontWeight: 800,
          color: palette.navy,
          opacity: 0.12,
          fontFamily: 'Georgia, serif',
        }}
      >
        &ldquo;
      </div>
      <div
        style={{
          fontSize: size,
          fontWeight: 800,
          lineHeight: 1.1,
          color: palette.navy,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          zIndex: 1,
        }}
      >
        {lines(headline).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {brand?.wordmark && (
        <div
          style={{
            position: 'absolute',
            bottom: 74,
            right: 90,
            color: palette.navy,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {brand.wordmark}
        </div>
      )}
    </div>
  )
})

export default BigQuote
