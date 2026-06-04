// Neutral starter preset. The pipeline supplies real headlines for your own
// product; this just gives the creative studio sensible brand/palette defaults
// and a few placeholder lines so it renders on first load. Edit brand + palette
// live in the UI, or copy this file to make a saved preset for your product.

export default {
  id: 'example',
  name: 'Your Brand',

  // Default palette = Efficiency Works brand (matches the site theme): brand
  // green + deep navy on warm cream. Templates read these keys, so this recolors
  // every design. Editable live in the UI.
  palette: {
    navy: '#001026', // Deep Ocean Abyss (brand navy / "blue")
    navyMid: '#06131f', // near-navy ink
    navyLight: '#103154', // lighter navy — gradient depth / 2nd dark surface
    accent: '#1f9d57', // brand action green
    accentDark: '#16713a', // deep green
    white: '#ffffff',
    offWhite: '#f6f3ea', // warm cream
    mint: '#46d98a', // bright mint accent (available to newer designs)
    mintTint: '#d9f2e3', // soft mint
  },

  brand: {
    wordmark: 'YOUR BRAND',
    url: '',
  },

  // Default "spread" — a strong, varied subset (dark · light · green) so a run
  // doesn't fan out across all 27. The rest stay available to tick on in the UI.
  templates: [
    'diagonal', 'spotlight', 'masthead', 'blockQuoteBar', 'bracketed',
    'frame', 'mintField', 'verticalSplit', 'topBanner',
    'offsetCard', 'greenBottom', 'insetPanel',
  ],

  // Placeholder lines only — replaced by your generated headlines in the flow.
  headlines: [
    'Your headline goes here',
    'Paste headlines, one per line',
    'Or run the pipeline to generate them',
  ],
}
