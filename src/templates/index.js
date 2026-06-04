// Template registry. Add a design = build a <Name>.jsx that takes
// { headline, palette, brand } and renders a 1080x1080 root with the
// forwarded ref, then add one line here. Nothing else changes.

import GradientCenter from './GradientCenter'
import SolidLeft from './SolidLeft'
import AccentBlock from './AccentBlock'
import TopRule from './TopRule'
import BigQuote from './BigQuote'
import SplitPanel from './SplitPanel'
import Minimal from './Minimal'

export const TEMPLATES = [
  { id: 'gradient-center', name: 'Gradient Center', Component: GradientCenter },
  { id: 'solid-left', name: 'Solid Left', Component: SolidLeft },
  { id: 'accent-block', name: 'Accent Block', Component: AccentBlock },
  { id: 'top-rule', name: 'Top Rule', Component: TopRule },
  { id: 'big-quote', name: 'Big Quote', Component: BigQuote },
  { id: 'split-panel', name: 'Split Panel', Component: SplitPanel },
  { id: 'minimal', name: 'Minimal', Component: Minimal },
]

export const getTemplate = (id) =>
  TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]
