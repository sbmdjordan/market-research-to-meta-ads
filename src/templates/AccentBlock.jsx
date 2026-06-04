import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Light theme: off-white field, headline sitting on a solid accent
// card. High contrast against the dark templates.
const AccentBlock = forwardRef(function AccentBlock(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 92, min: 44, longAt: 84 })
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 90,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: palette.accent,
          borderRadius: 28,
          padding: '80px 70px',
          maxWidth: 860,
        }}
      >
        <div
          style={{
            fontSize: size,
            fontWeight: 800,
            lineHeight: 1.1,
            color: palette.navy,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          {lines(headline).map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
      {brand?.wordmark && (
        <div
          style={{
            position: 'absolute',
            bottom: 74,
            color: palette.accentDark,
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

export default AccentBlock
