import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Navy, full-width accent rule pinned top, headline anchored
// bottom-left under a small kicker. Lots of top negative space.
const TopRule = forwardRef(function TopRule(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 94, min: 46, longAt: 84 })
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        background: palette.navy,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 130px 130px 130px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 16,
          background: palette.accent,
        }}
      />
      {brand?.wordmark && (
        <div
          style={{
            color: palette.accent,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 36,
          }}
        >
          {brand.wordmark}
        </div>
      )}
      <div
        style={{
          fontSize: size,
          fontWeight: 800,
          lineHeight: 1.08,
          color: palette.white,
          textAlign: 'left',
          letterSpacing: '-0.02em',
        }}
      >
        {lines(headline).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  )
})

export default TopRule
