// presetPalettes.js
// ----------------------------------------------------------------------------
// Curated, ready-to-use palettes for The Marketing Startup · Ad Studio.
//
// Every ad template consumes palette *keys* (never raw hex), so swapping the
// palette object recolors all templates instantly. These presets are starting
// points the app can offer in the palette picker; users can still insert a
// fully custom palette by supplying the same keys.
//
// Each palette MUST define all nine keys, and should respect their semantic
// ROLE so contrast holds across templates:
//   navy      — primary dark surface (dark backgrounds)
//   navyMid   — deepest ink (borders, deep fills)
//   navyLight — lighter dark (gradient depth, 2nd dark surface)
//   accent    — the hero brand pop (fills, CTAs-on-image)
//   accentDark— deep accent (gradients, small text on light)
//   white     — light text / light surface
//   offWhite  — warm light background
//   mint      — bright pop (diamonds, highlights, accents on dark)
//   mintTint  — soft light fill (subtle backgrounds, strips)
// ----------------------------------------------------------------------------

export const PALETTE_KEYS = [
  'navy', 'navyMid', 'navyLight', 'accent', 'accentDark', 'white', 'offWhite', 'mint', 'mintTint',
]

export const PRESET_PALETTES = [
  {
    key: 'brand', label: 'Brand', // The Marketing Startup — green + navy
    colors: { navy: '#001026', navyMid: '#06131f', navyLight: '#103154', accent: '#1f9d57', accentDark: '#16713a', white: '#ffffff', offWhite: '#f6f3ea', mint: '#46d98a', mintTint: '#d9f2e3' },
  },
  {
    key: 'ocean', label: 'Ocean · Coral', // deep blue + warm coral
    colors: { navy: '#0a2540', navyMid: '#06121f', navyLight: '#17456e', accent: '#ff5d46', accentDark: '#d83a26', white: '#ffffff', offWhite: '#f7f3ee', mint: '#ffb4a8', mintTint: '#ffe2db' },
  },
  {
    key: 'plum', label: 'Plum · Gold', // aubergine + gold
    colors: { navy: '#2a1733', navyMid: '#1c0f24', navyLight: '#46295a', accent: '#e0a83a', accentDark: '#b6841f', white: '#ffffff', offWhite: '#f6f1e9', mint: '#ffd98a', mintTint: '#f3e4c4' },
  },
  {
    key: 'mono', label: 'Slate Mono', // restrained monochrome slate
    colors: { navy: '#1f2430', navyMid: '#12161e', navyLight: '#39414f', accent: '#5b6b7e', accentDark: '#3c4654', white: '#ffffff', offWhite: '#eef0f3', mint: '#aeb9c6', mintTint: '#dfe4ea' },
  },
  {
    key: 'ember', label: 'Ember', // espresso + terracotta (warm, premium)
    colors: { navy: '#241a14', navyMid: '#18110c', navyLight: '#45342a', accent: '#e2683c', accentDark: '#b94a24', white: '#ffffff', offWhite: '#f5ede2', mint: '#f0a878', mintTint: '#f3ddc9' },
  },
  {
    key: 'tide', label: 'Tidewater', // deep teal + soft gold (cool, fresh)
    colors: { navy: '#07312f', navyMid: '#04211f', navyLight: '#155049', accent: '#f0b429', accentDark: '#c08a12', white: '#ffffff', offWhite: '#f2f0e6', mint: '#7fe0c4', mintTint: '#d6f2e8' },
  },
]

export default PRESET_PALETTES
