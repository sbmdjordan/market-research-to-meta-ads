// Neutral starter preset. The pipeline supplies real headlines for your own
// product; this just gives the creative studio sensible brand/palette defaults
// and a few placeholder lines so it renders on first load. Edit brand + palette
// live in the UI, or copy this file to make a saved preset for your product.

export default {
  id: 'example',
  name: 'Your Brand',

  palette: {
    navy: '#0f172a',
    navyMid: '#1e293b',
    navyLight: '#334155',
    accent: '#38bdf8',
    accentDark: '#0284c7',
    white: '#ffffff',
    offWhite: '#f8fafc',
  },

  brand: {
    wordmark: 'YOUR BRAND',
    url: '',
  },

  // null = spread across every registered template.
  templates: null,

  // Placeholder lines only — replaced by your generated headlines in the flow.
  headlines: [
    'Your headline goes here',
    'Paste headlines, one per line',
    'Or run the pipeline to generate them',
  ],
}
