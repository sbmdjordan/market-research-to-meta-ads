import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Flat navy, left accent bar, left-aligned headline, asymmetric.
const SolidLeft = forwardRef(function SolidLeft(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 96, min: 46, longAt: 84 })
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
        justifyContent: 'center',
        padding: '110px 130px 110px 150px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 20,
          background: palette.accent,
        }}
      />
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
      {brand?.wordmark && (
        <div
          style={{
            position: 'absolute',
            left: 150,
            bottom: 80,
            color: palette.accent,
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

export default SolidLeft
