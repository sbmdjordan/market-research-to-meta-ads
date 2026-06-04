import { forwardRef } from 'react'
import ConfigTemplate from './templates/ConfigTemplate'

// Custom templates are config objects (derived from a reference ad, then
// editable) persisted in the browser. They join the built-in templates in the
// design spread. Stored as { id, name, config }.

const KEY = 'custom-templates'

export function loadCustomTemplates() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function saveCustomTemplates(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

// A sane starting point if analysis fails or the user builds one by hand.
export const DEFAULT_CONFIG = {
  background: { type: 'solid', colorKey: 'navy' },
  headline: {
    vertical: 'center',
    horizontal: 'left',
    align: 'left',
    colorKey: 'white',
    sizeScale: 1,
    uppercase: false,
    weight: 800,
    maxWidthPct: 80,
  },
  accent: { type: 'bar-left', colorKey: 'accent' },
  brand: { show: true, vertical: 'bottom', horizontal: 'left', showUrl: false, colorKey: 'accent' },
}

// Map config templates → engine entries (same shape as built-in TEMPLATES:
// { id, name, Component }), each rendering via ConfigTemplate. `flags` marks
// them as custom (personal, deletable) or official (curated, read-only).
function entriesFrom(list, flags) {
  return list.map((t) => ({
    id: t.id,
    name: t.name,
    config: t.config,
    ...flags,
    Component: forwardRef(function Tpl(props, ref) {
      return <ConfigTemplate ref={ref} config={t.config} {...props} />
    }),
  }))
}

export const customToEntries = (list) => entriesFrom(list, { custom: true })
export const curatedToEntries = (list) => entriesFrom(list, { official: true })
