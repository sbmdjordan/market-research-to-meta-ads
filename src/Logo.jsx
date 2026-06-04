// Efficiency Works brand mark — a blocky "E" monogram in a 120×120 space.
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
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Efficiency Works">
      {tile && <rect width="120" height="120" rx="26" fill={tile} />}
      <rect x="35" y="34" width="15" height="52" fill={ink} />
      <rect x="50" y="34" width="34" height="14" fill={ink} />
      <rect x="50" y="72" width="34" height="14" fill={ink} />
      <rect x="50" y="53" width="25" height="14" fill={accent} />
    </svg>
  )
}
