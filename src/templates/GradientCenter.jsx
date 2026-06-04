import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Dark gradient field, soft accent orbs, centered headline with an
// accent underline. The original look, kept as one option.
const GradientCenter = forwardRef(function GradientCenter(
  { headline, palette, brand },
  ref
) {
  const size = fitFont(headline, { max: 100, min: 48, longAt: 80 })
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        background: `linear-gradient(160deg, ${palette.navy} 0%, ${palette.navyLight} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 110,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          left: -180,
          bottom: -200,
          background: palette.accent,
          opacity: 0.1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 460,
          height: 460,
          borderRadius: '50%',
          right: -150,
          top: -160,
          background: palette.accent,
          opacity: 0.08,
        }}
      />
      <div
        style={{
          fontSize: size,
          fontWeight: 800,
          lineHeight: 1.1,
          color: palette.white,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          zIndex: 1,
        }}
      >
        {lines(headline).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div
        style={{
          width: 140,
          height: 8,
          borderRadius: 4,
          background: palette.accent,
          marginTop: 56,
          zIndex: 1,
        }}
      />
      {brand?.wordmark && (
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            color: palette.accent,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {brand.wordmark}
        </div>
      )}
    </div>
  )
})

export default GradientCenter
