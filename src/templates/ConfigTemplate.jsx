import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

// Generic, config-driven 1080×1080 template. Custom templates derived from a
// reference ad are stored as a config object and rendered here — so the user
// can grow the library without writing code. Kept html2canvas-safe: inline
// styles, solid shapes + linear-gradients only, no backdrop-filter.

// Resolve a palette key (e.g. "navy") to its colour; allow a literal hex too.
const col = (palette, key, fallback = '#000') =>
  (key && (palette[key] || (key.startsWith('#') ? key : null))) || fallback

const VJUSTIFY = { top: 'flex-start', center: 'center', bottom: 'flex-end' }
const HALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' }

function background(bg, palette) {
  switch (bg?.type) {
    case 'gradient':
      return {
        backgroundImage: `linear-gradient(${bg.angle ?? 135}deg, ${col(
          palette,
          bg.fromKey,
          palette.navy
        )}, ${col(palette, bg.toKey, palette.accentDark || palette.accent)})`,
      }
    case 'split': // handled with layers below; base is the first colour
      return { background: col(palette, bg.firstKey, palette.navy) }
    case 'image':
      return { background: col(palette, bg.scrimKey, palette.navy) }
    case 'solid':
    default:
      return { background: col(palette, bg?.colorKey, palette.navy) }
  }
}

const ConfigTemplate = forwardRef(function ConfigTemplate(
  { config, headline, palette, brand },
  ref
) {
  const bg = config.background || { type: 'solid', colorKey: 'navy' }
  const h = config.headline || {}
  const accent = config.accent || { type: 'none' }
  const b = { show: true, vertical: 'bottom', horizontal: 'left', showUrl: false, colorKey: 'accent', ...(config.brand || {}) }

  const size = Math.round(fitFont(headline, { max: 100, min: 44, longAt: 84 }) * (h.sizeScale || 1))
  const headlineColor = col(palette, h.colorKey || 'white', palette.white)
  const accentColor = col(palette, accent.colorKey || 'accent', palette.accent)

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: VJUSTIFY[h.vertical] || 'center',
        alignItems: HALIGN[h.horizontal] || 'flex-start',
        padding: '120px 130px',
        ...background(bg, palette),
      }}
    >
      {/* Split background: second colour panel */}
      {bg.type === 'split' && (
        <div
          style={{
            position: 'absolute',
            ...(bg.orientation === 'horizontal'
              ? { left: 0, right: 0, bottom: 0, height: `${(1 - (bg.ratio ?? 0.5)) * 100}%` }
              : { top: 0, bottom: 0, right: 0, width: `${(1 - (bg.ratio ?? 0.5)) * 100}%` }),
            background: col(palette, bg.secondKey, palette.accent),
          }}
        />
      )}

      {/* Image background + legibility scrim */}
      {bg.type === 'image' && bg.image && (
        <img
          src={bg.image}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {bg.type === 'image' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: col(palette, bg.scrimKey, '#0a1628'),
            opacity: bg.scrimOpacity ?? 0.45,
          }}
        />
      )}

      {/* Accent shapes */}
      {accent.type === 'bar-left' && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, background: accentColor }} />
      )}
      {accent.type === 'bar-top' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 16, background: accentColor }} />
      )}
      {accent.type === 'bar-bottom' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, background: accentColor }} />
      )}

      {/* Headline */}
      <div
        style={{
          position: 'relative',
          maxWidth: `${h.maxWidthPct || 80}%`,
          textAlign: h.align || 'left',
          color: headlineColor,
          fontSize: size,
          fontWeight: h.weight || 800,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          textTransform: h.uppercase ? 'uppercase' : 'none',
        }}
      >
        {lines(headline).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        {accent.type === 'underline' && (
          <div style={{ width: 120, height: 8, marginTop: 24, background: accentColor }} />
        )}
      </div>

      {/* Brand */}
      {b.show && brand?.wordmark && (
        <div
          style={{
            position: 'absolute',
            bottom: b.vertical === 'bottom' ? 80 : undefined,
            top: b.vertical === 'top' ? 80 : undefined,
            left: b.horizontal !== 'right' ? 130 : undefined,
            right: b.horizontal === 'right' ? 130 : undefined,
            textAlign: b.horizontal === 'center' ? 'center' : 'left',
            ...(b.horizontal === 'center' ? { left: 0, right: 0 } : {}),
            color: col(palette, b.colorKey || 'accent', palette.accent),
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {brand.wordmark}
          {b.showUrl && brand.url ? <span style={{ opacity: 0.8 }}>{`  ·  ${brand.url}`}</span> : null}
        </div>
      )}
    </div>
  )
})

export default ConfigTemplate
