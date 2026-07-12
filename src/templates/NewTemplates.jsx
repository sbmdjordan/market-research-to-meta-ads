import { forwardRef } from 'react'
import { FONT_STACK, fitFont, lines } from './shared'

/* ============================================================================
   20 NEW ad-creative templates for The Marketing Startup · Ad Studio.
   Same contract as the existing set: forwardRef({ headline, palette, brand }).
   Inline styles only · html2canvas-safe (solid fills, gradients, borders,
   shapes; "offset shadows" are solid divs — never box-shadow/filter/mask).
   Drop these into current-templates/ (or split into one file each) and add to
   index.js. Spread: 5 dark · 3 light · 2 green.
   ============================================================================ */

const H = (size, color, align = 'center', weight = 800) => ({
  fontSize: size, fontWeight: weight, lineHeight: 1.08, color,
  textAlign: align, letterSpacing: '-0.02em',
})
const Lines = (headline) => lines(headline).map((l, i) => <div key={i}>{l}</div>)

/* 1 · Frame — light cream, thick navy inset border, centered ink headline. */
export const Frame = forwardRef(function Frame({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 86, min: 44, longAt: 86 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.offWhite, boxSizing: 'border-box', padding: 48 }}>
      <div style={{ width: '100%', height: '100%', border: `14px solid ${palette.navy}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 86px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 30, height: 30, background: palette.mint }} />
        <div style={H(size, palette.navyMid)}>{Lines(headline)}</div>
        {brand?.wordmark && <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', color: palette.accentDark, fontSize: 25, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
      </div>
    </div>
  )
})

/* 2 · Diagonal — hard diagonal navy→green split, white headline on navy. */
export const Diagonal = forwardRef(function Diagonal({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 92, min: 46, longAt: 82 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: `linear-gradient(118deg, ${palette.navy} 0%, ${palette.navy} 57%, ${palette.accent} 57%, ${palette.accent} 100%)`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 130px' }}>
      <div style={{ position: 'absolute', top: 96, left: 130, width: 30, height: 30, background: palette.mint, transform: 'rotate(45deg)' }} />
      <div style={{ maxWidth: 600, ...H(size, palette.white, 'left') }}>{Lines(headline)}</div>
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 84, left: 130, color: palette.white, fontSize: 25, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 3 · OffsetCard — green field, white card w/ navy border + solid offset block. */
export const OffsetCard = forwardRef(function OffsetCard({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 84, min: 44, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.accent, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120 }}>
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: 820 }}>
        <div style={{ position: 'absolute', inset: 0, transform: 'translate(22px, 22px)', background: palette.navy, borderRadius: 20 }} />
        <div style={{ position: 'relative', background: palette.white, border: `7px solid ${palette.navy}`, borderRadius: 20, padding: '84px 74px' }}>
          <div style={H(size, palette.navy)}>{Lines(headline)}</div>
        </div>
      </div>
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', color: palette.navy, fontSize: 25, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 4 · SideRail — slim green left rail with vertical wordmark, navy panel. */
export const SideRail = forwardRef(function SideRail({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 88, min: 46, longAt: 86 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex' }}>
      <div style={{ width: 150, height: '100%', background: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', color: palette.navy, fontSize: 30, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase' }}>{brand?.wordmark || ''}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 110px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 96, right: 110, width: 28, height: 28, background: palette.mint, transform: 'rotate(45deg)' }} />
        <div style={H(size, palette.white, 'left')}>{Lines(headline)}</div>
        {brand?.url && <div style={{ position: 'absolute', bottom: 80, left: 110, color: palette.mint, fontSize: 24, fontWeight: 600 }}>{brand.url}</div>}
      </div>
    </div>
  )
})

/* 5 · MintField — soft-mint field, centered navy headline between two rules. */
export const MintField = forwardRef(function MintField({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 88, min: 44, longAt: 84 })
  const rule = { width: 88, height: 7, background: palette.accent, borderRadius: 4 }
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.mintTint, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 120 }}>
      <div style={{ ...rule, marginBottom: 54 }} />
      <div style={{ ...H(size, palette.navy), lineHeight: 1.1 }}>{Lines(headline)}</div>
      <div style={{ ...rule, marginTop: 54 }} />
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 66, left: 0, right: 0, textAlign: 'center', color: palette.accentDark, fontSize: 25, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 6 · Spotlight — navy field, bold solid green circle, white headline on it. */
export const Spotlight = forwardRef(function Spotlight({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 76, min: 40, longAt: 70 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 780, height: 780, borderRadius: '50%', background: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 90, boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 560, ...H(size, palette.white), lineHeight: 1.1 }}>{Lines(headline)}</div>
      </div>
      <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 26, height: 26, background: palette.mint }} />
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 66, left: 0, right: 0, textAlign: 'center', color: palette.mint, fontSize: 25, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 7 · CropMarks — navy field, green L-corner marks, centered white headline. */
export const CropMarks = forwardRef(function CropMarks({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 84, min: 42, longAt: 84 })
  const m = 70, len = 78, th = 6
  const Corner = ({ pos }) => {
    const outer = { tl: { top: m, left: m }, tr: { top: m, right: m }, bl: { bottom: m, left: m }, br: { bottom: m, right: m } }[pos]
    const edge = { tl: { top: 0, left: 0 }, tr: { top: 0, right: 0 }, bl: { bottom: 0, left: 0 }, br: { bottom: 0, right: 0 } }[pos]
    return (
      <div style={{ position: 'absolute', width: len, height: len, ...outer }}>
        <div style={{ position: 'absolute', width: len, height: th, background: palette.accent, ...edge }} />
        <div style={{ position: 'absolute', width: th, height: len, background: palette.accent, ...edge }} />
      </div>
    )
  }
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 150 }}>
      {['tl', 'tr', 'bl', 'br'].map((p) => <Corner key={p} pos={p} />)}
      {brand?.wordmark && <div style={{ color: palette.accent, fontSize: 22, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 30 }}>{brand.wordmark}</div>}
      <div style={{ ...H(size, palette.white), lineHeight: 1.1 }}>{Lines(headline)}</div>
      {brand?.url && <div style={{ position: 'absolute', bottom: 84, left: 0, right: 0, textAlign: 'center', color: palette.mint, fontSize: 22, fontWeight: 600 }}>{brand.url}</div>}
    </div>
  )
})

/* 8 · Highlighter — cream field, left navy headline on a navy-keylined mint block. */
export const Highlighter = forwardRef(function Highlighter({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 84, min: 42, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.offWhite, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 110px' }}>
      {brand?.wordmark && <div style={{ color: palette.accentDark, fontSize: 24, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 34 }}>{brand.wordmark}</div>}
      <div style={{ alignSelf: 'flex-start', maxWidth: 840, background: palette.mint, border: `4px solid ${palette.navy}`, padding: '34px 38px' }}>
        <div style={H(size, palette.navy, 'left')}>{Lines(headline)}</div>
      </div>
      <div style={{ position: 'absolute', left: 110, right: 110, bottom: 96, borderTop: `3px solid ${palette.navy}`, opacity: 0.14 }} />
    </div>
  )
})

/* 9 · GreenBottom — green field, big navy headline bottom-left, navy hairline up top. */
export const GreenBottom = forwardRef(function GreenBottom({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 94, min: 48, longAt: 82 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.accent, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 120px 120px' }}>
      <div style={{ position: 'absolute', top: 110, left: 120, right: 120, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: palette.navy, fontSize: 25, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{brand?.wordmark || ''}</div>
        <div style={{ width: 26, height: 26, background: palette.navy, transform: 'rotate(45deg)' }} />
      </div>
      <div style={{ position: 'absolute', top: 172, left: 120, right: 120, height: 3, background: palette.navy, opacity: 0.85 }} />
      <div style={{ maxWidth: 840, ...H(size, palette.navy, 'left'), lineHeight: 1.05 }}>{Lines(headline)}</div>
    </div>
  )
})

/* 10 · Masthead — navy field, white centered headline framed by two thick green rules. */
export const Masthead = forwardRef(function Masthead({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 82, min: 44, longAt: 84 })
  const rule = { width: 520, maxWidth: '100%', height: 10, background: palette.accent }
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '130px 120px' }}>
      <div style={{ ...rule, marginBottom: 54 }} />
      <div style={{ ...H(size, palette.white), lineHeight: 1.1 }}>{Lines(headline)}</div>
      <div style={{ ...rule, marginTop: 54 }} />
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 74, left: 0, right: 0, textAlign: 'center', color: palette.mint, fontSize: 24, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 11 · CornerWedge — navy field, bold accent corner wedge, white headline. */
export const CornerWedge = forwardRef(function CornerWedge({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 88, min: 46, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 130px' }}>
      <div style={{ position: 'absolute', right: -200, bottom: -200, width: 720, height: 720, background: palette.accent, transform: 'rotate(45deg)' }} />
      <div style={{ position: 'absolute', top: 120, left: 130, width: 28, height: 28, background: palette.mint, transform: 'rotate(45deg)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, ...H(size, palette.white, 'left') }}>{Lines(headline)}</div>
      {brand?.wordmark && <div style={{ position: 'absolute', left: 130, bottom: 90, color: palette.mint, fontSize: 24, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', zIndex: 2 }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 12 · ThreeBand — navy / cream / accent horizontal bands. */
export const ThreeBand = forwardRef(function ThreeBand({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 86, min: 44, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, overflow: 'hidden', fontFamily: FONT_STACK, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 150, background: palette.navy, display: 'flex', alignItems: 'center', padding: '0 110px' }}><div style={{ color: palette.mint, fontSize: 25, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand?.wordmark || ''}</div></div>
      <div style={{ flex: 1, background: palette.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 110px' }}><div style={{ ...H(size, palette.navy), lineHeight: 1.1 }}>{Lines(headline)}</div></div>
      <div style={{ height: 120, background: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 110px' }}><div style={{ color: palette.navy, fontSize: 26, fontWeight: 800, letterSpacing: '0.04em' }}>{brand?.url || ''}</div><div style={{ width: 26, height: 26, background: palette.navy, transform: 'rotate(45deg)' }} /></div>
    </div>
  )
})

/* 13 · DotCluster — navy field, accent dot-grid corner, headline bottom-left. */
export const DotCluster = forwardRef(function DotCluster({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 88, min: 46, longAt: 84 })
  const dots = []
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) dots.push(<div key={`${r}-${c}`} style={{ position: 'absolute', top: r * 34, left: c * 34, width: 14, height: 14, borderRadius: '50%', background: palette.accent }} />)
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 130 }}>
      <div style={{ position: 'absolute', top: 120, right: 120, width: 198, height: 198 }}>{dots}</div>
      <div style={{ maxWidth: 780, ...H(size, palette.white, 'left') }}>{Lines(headline)}</div>
      {brand?.wordmark && <div style={{ marginTop: 40, color: palette.mint, fontSize: 24, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 14 · InsetPanel — accent field framing a navy panel with a mint keyline. */
export const InsetPanel = forwardRef(function InsetPanel({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 84, min: 44, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.accent, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 110 }}>
      <div style={{ width: '100%', height: '100%', background: palette.navy, border: `4px solid ${palette.mint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '90px 80px', boxSizing: 'border-box' }}><div style={{ ...H(size, palette.white), lineHeight: 1.1 }}>{Lines(headline)}</div></div>
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 52, left: 0, right: 0, textAlign: 'center', color: palette.navy, fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 15 · TopBanner — cream field, accent banner across the top, headline below. */
export const TopBanner = forwardRef(function TopBanner({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 88, min: 46, longAt: 82 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.offWhite, boxSizing: 'border-box' }}>
      <div style={{ height: 150, background: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 120px' }}><div style={{ color: palette.navy, fontSize: 25, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{brand?.wordmark || ''}</div><div style={{ width: 28, height: 28, background: palette.navy, transform: 'rotate(45deg)' }} /></div>
      <div style={{ padding: '120px 120px 0' }}><div style={{ maxWidth: 840, ...H(size, palette.navy, 'left'), lineHeight: 1.06 }}>{Lines(headline)}</div></div>
      <div style={{ position: 'absolute', bottom: 90, left: 120, width: 120, height: 8, background: palette.accent }} />
    </div>
  )
})

/* 16 · VerticalSplit — cream half (headline) + navy half (layered diamonds). */
export const VerticalSplit = forwardRef(function VerticalSplit({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 84, min: 44, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, overflow: 'hidden', fontFamily: FONT_STACK, boxSizing: 'border-box', display: 'flex' }}>
      <div style={{ width: 660, background: palette.offWhite, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 90px', flexShrink: 0 }}>
        {brand?.wordmark && <div style={{ color: palette.accentDark, fontSize: 22, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 28 }}>{brand.wordmark}</div>}
        <div style={H(size, palette.navy, 'left')}>{Lines(headline)}</div>
      </div>
      <div style={{ flex: 1, background: palette.navy, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(45deg)', width: 128, height: 128, background: palette.accent }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(45deg)', width: 60, height: 60, background: palette.mint }} />
      </div>
    </div>
  )
})

/* 17 · Ribbon — cream field, accent diagonal sash w/ wordmark, centered headline. */
export const Ribbon = forwardRef(function Ribbon({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 86, min: 44, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.offWhite, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120 }}>
      <div style={{ position: 'absolute', top: 150, right: -110, width: 600, height: 80, background: palette.accent, transform: 'rotate(38deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: palette.navy, fontSize: 23, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand?.wordmark || ''}</span></div>
      <div style={{ ...H(size, palette.navy), lineHeight: 1.1 }}>{Lines(headline)}</div>
      {brand?.url && <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', color: palette.accentDark, fontSize: 22, fontWeight: 700, letterSpacing: '0.04em' }}>{brand.url}</div>}
    </div>
  )
})

/* 18 · BlockQuoteBar — navy field, accent bar hugging the headline block. */
export const BlockQuoteBar = forwardRef(function BlockQuoteBar({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 88, min: 46, longAt: 84 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 130px' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 40 }}>
        <div style={{ width: 14, background: palette.accent, flexShrink: 0, borderRadius: 7 }} />
        <div style={{ maxWidth: 740, ...H(size, palette.white, 'left'), lineHeight: 1.1 }}>{Lines(headline)}</div>
      </div>
      {brand?.wordmark && <div style={{ position: 'absolute', left: 184, bottom: 90, color: palette.mint, fontSize: 24, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 19 · StackedRules — accent field, three navy rules above a left headline. */
export const StackedRules = forwardRef(function StackedRules({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 90, min: 46, longAt: 82 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.accent, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 120px' }}>
      <div style={{ marginBottom: 44 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 130, height: 7, background: palette.navy, marginBottom: 12 }} />)}</div>
      <div style={{ maxWidth: 820, ...H(size, palette.navy, 'left'), lineHeight: 1.06 }}>{Lines(headline)}</div>
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 90, left: 120, color: palette.navy, fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* 20 · Bracketed — navy field, oversized accent brackets around centered headline. */
export const Bracketed = forwardRef(function Bracketed({ headline, palette, brand }, ref) {
  const size = fitFont(headline, { max: 80, min: 44, longAt: 80 })
  return (
    <div ref={ref} style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_STACK, background: palette.navy, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 40 }}>
        <div style={{ width: 54, border: `8px solid ${palette.accent}`, borderRight: 'none', flexShrink: 0 }} />
        <div style={{ maxWidth: 660, ...H(size, palette.white), lineHeight: 1.1, display: 'flex', alignItems: 'center' }}>{Lines(headline)}</div>
        <div style={{ width: 54, border: `8px solid ${palette.accent}`, borderLeft: 'none', flexShrink: 0 }} />
      </div>
      {brand?.wordmark && <div style={{ position: 'absolute', bottom: 74, left: 0, right: 0, textAlign: 'center', color: palette.mint, fontSize: 24, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{brand.wordmark}</div>}
    </div>
  )
})

/* Convenience registry — mirror index.js's shape if useful. */
export const NEW_TEMPLATES = [
  { key: 'frame', label: 'Frame', Component: Frame },
  { key: 'diagonal', label: 'Diagonal', Component: Diagonal },
  { key: 'offsetCard', label: 'Offset Card', Component: OffsetCard },
  { key: 'sideRail', label: 'Side Rail', Component: SideRail },
  { key: 'mintField', label: 'Mint Field', Component: MintField },
  { key: 'spotlight', label: 'Spotlight', Component: Spotlight },
  { key: 'cropMarks', label: 'Crop Marks', Component: CropMarks },
  { key: 'highlighter', label: 'Highlighter', Component: Highlighter },
  { key: 'greenBottom', label: 'Green Bottom', Component: GreenBottom },
  { key: 'masthead', label: 'Masthead', Component: Masthead },
  { key: 'cornerWedge', label: 'Corner Wedge', Component: CornerWedge },
  { key: 'threeBand', label: 'Three Band', Component: ThreeBand },
  { key: 'dotCluster', label: 'Dot Cluster', Component: DotCluster },
  { key: 'insetPanel', label: 'Inset Panel', Component: InsetPanel },
  { key: 'topBanner', label: 'Top Banner', Component: TopBanner },
  { key: 'verticalSplit', label: 'Vertical Split', Component: VerticalSplit },
  { key: 'ribbon', label: 'Ribbon', Component: Ribbon },
  { key: 'blockQuoteBar', label: 'Block Quote Bar', Component: BlockQuoteBar },
  { key: 'stackedRules', label: 'Stacked Rules', Component: StackedRules },
  { key: 'bracketed', label: 'Bracketed', Component: Bracketed },
]
