// Preset registry. Add a product = add a preset file and one line here.
// Shipped genericized: one neutral starter. The pipeline drives real headlines.

import example from './example'

// Order matters — first preset is the default in the UI.
export const PRESETS = [example]

export const getPreset = (id) =>
  PRESETS.find((p) => p.id === id) || PRESETS[0]
