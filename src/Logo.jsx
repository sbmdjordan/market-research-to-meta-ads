// The Marketing Startup brand mark — three bars (tall/short/tall) in a 120×120 space.
// Geometry is fixed; only the three colors change between variants (see the
// brand handoff). Defaults = the primary navy-tile badge, which sits cleanly
// on any header background.
export function LogoMark({
  size = 32,
  tile = '#001026',
  ink = '#f6f3ea',
  accent = '#46d98a',
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="The Marketing Startup">
      {tile && <rect width="120" height="120" rx="26" fill={tile} />}
      <rect x="28" y="30" width="16" height="60" rx="2" fill={ink} />
      <rect x="52" y="50" width="16" height="40" rx="2" fill={accent} />
      <rect x="76" y="30" width="16" height="60" rx="2" fill={ink} />
    </svg>
  )
}
