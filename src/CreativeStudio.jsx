import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import html2canvas from 'html2canvas'
import ScaledPreview from './ScaledPreview'
import { TEMPLATES } from './templates'
import { PRESETS, getPreset } from './presets'
import {
  loadCustomTemplates,
  saveCustomTemplates,
  customToEntries,
  curatedToEntries,
} from './customTemplates'
import { fetchCurated } from './curatedTemplates'
import { PRESET_PALETTES } from './presetPalettes'
import AddTemplate from './AddTemplate'
import { Stepper } from './Stepper'
import './App.css'

// Accept a clean headline-per-line list (what the pipeline emits, or a paste).
// Tolerant of leftover numbering, bullets, or wrapping quotes.
function parseHeadlines(text) {
  return text
    .split('\n')
    .map((l) =>
      l
        .trim()
        .replace(/^\d+[.)]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .replace(/^["']|["']$/g, '')
        .trim()
    )
    .filter(Boolean)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// One creative per headline. Designs are assigned by cycling a shuffled
// list of the enabled templates — even spread, varied order, repeats
// allowed (the Andromeda-safe spread).
function assignTemplates(headlines, enabledIds) {
  const order = shuffle(enabledIds.length ? enabledIds : TEMPLATES.map((t) => t.id))
  return headlines.map((headline, i) => ({
    headline,
    templateId: order[i % order.length],
  }))
}

const slugify = (s) =>
  s
    .replace(/\n/g, ' ')
    .slice(0, 42)
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()

// The user's brand (wordmark + URL) is edited live in the studio sidebar.
// Persist it so it survives leaving/returning to the Creatives tab (the studio
// unmounts on nav) and page refreshes. Kept in its OWN key, separate from the
// per-run pipeline state — a brand doesn't change per product, so "Start over"
// leaves it intact.
const BRAND_KEY = 'meta-ads-brand'
const loadBrand = () => {
  try {
    const v = JSON.parse(localStorage.getItem(BRAND_KEY))
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

// `incomingHeadlines` (from the pipeline) seed the studio; if absent we fall
// back to the preset's placeholder lines so the studio still renders standalone.
function CreativeStudio({
  headlines: incomingHeadlines,
  onBack,
  settings,
  preview,
  step,
  maxStep,
  onStepClick,
}) {
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const preset = getPreset(presetId)

  // Built-in templates + curated "Official" ones (the owner's winning
  // creatives, fetched on load) + the user's personal custom ones.
  const [customList, setCustomList] = useState(loadCustomTemplates)
  const [curatedList, setCuratedList] = useState([])
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [copied, setCopied] = useState('')

  const allTemplates = useMemo(
    () => [...TEMPLATES, ...curatedToEntries(curatedList), ...customToEntries(customList)],
    [curatedList, customList]
  )
  const getEntry = useCallback(
    (id) => allTemplates.find((t) => t.id === id) || allTemplates[0],
    [allTemplates]
  )

  // Pull the owner's curated winners once; enable them in the spread by default.
  useEffect(() => {
    fetchCurated().then((list) => {
      setCuratedList(list)
      const ids = list.map((t) => t.id)
      if (ids.length) setEnabledIds((prev) => [...new Set([...prev, ...ids])])
    })
  }, [])

  const allTemplateIds = TEMPLATES.map((t) => t.id)
  const initialEnabled = preset.templates || allTemplateIds
  const seedHeadlines =
    incomingHeadlines && incomingHeadlines.length
      ? incomingHeadlines
      : preset.headlines

  const [palette, setPalette] = useState(preset.palette)
  const [brand, setBrand] = useState(() => loadBrand() || preset.brand)
  const [headlinesText, setHeadlinesText] = useState(seedHeadlines.join('\n'))
  const [enabledIds, setEnabledIds] = useState(initialEnabled)
  const [items, setItems] = useState(() =>
    assignTemplates(seedHeadlines, initialEnabled)
  )
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Save brand edits so they survive an unmount (leaving Creatives) + refresh.
  useEffect(() => {
    try {
      localStorage.setItem(BRAND_KEY, JSON.stringify(brand))
    } catch {
      /* storage blocked/full — non-fatal */
    }
  }, [brand])

  const refs = useRef({})

  const switchPreset = (e) => {
    const p = getPreset(e.target.value)
    setPresetId(p.id)
    setPalette(p.palette)
    setBrand(p.brand)
    const en = p.templates || allTemplateIds
    setEnabledIds(en)
    // Keep the current headlines (they're the user's product); only swap brand.
  }

  const generate = () => {
    const headlines = parseHeadlines(headlinesText)
    if (!headlines.length) return
    setItems(assignTemplates(headlines, enabledIds))
  }

  const toggleTemplate = (id) => {
    setEnabledIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev // keep at least one
        return prev.filter((x) => x !== id)
      }
      return [...prev, id]
    })
  }

  const reroll = (index) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it
        const choices = enabledIds.filter((id) => id !== it.templateId)
        const pool = choices.length ? choices : enabledIds
        return { ...it, templateId: pool[Math.floor(Math.random() * pool.length)] }
      })
    )
  }

  const setItemTemplate = (index, templateId) =>
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, templateId } : it))
    )

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index))

  const addCustomTemplate = ({ name, config }) => {
    const id = `custom-${Date.now()}`
    const next = [...customList, { id, name, config }]
    setCustomList(next)
    saveCustomTemplates(next)
    setEnabledIds((prev) => [...prev, id]) // a new design joins the spread
  }

  const deleteCustomTemplate = (id) => {
    const next = customList.filter((t) => t.id !== id)
    setCustomList(next)
    saveCustomTemplates(next)
    setEnabledIds((prev) => (prev.length > 1 ? prev.filter((x) => x !== id) : prev))
    setItems((prev) =>
      prev.map((it) => (it.templateId === id ? { ...it, templateId: TEMPLATES[0].id } : it))
    )
  }

  // Publish helper: copy a template's JSON so you can paste it into
  // curated-templates.json and roll it out to everyone.
  const copyConfig = (t) => {
    const entry = JSON.stringify({ id: t.id, name: t.name, config: t.config }, null, 2)
    navigator.clipboard?.writeText(entry)
    setCopied(t.name)
    setTimeout(() => setCopied(''), 2500)
  }

  // html2canvas doesn't honour CSS transforms on a parent — it captures
  // the laid-out geometry from the transformed context, so a template
  // sitting inside ScaledPreview's `scale(0.35)` ends up rasterised
  // crammed into the top-left corner with characters stacked. Fix: walk
  // up the tree and temporarily neutralise any transforms during capture,
  // then restore them. Also widen any overflow:hidden so the unscaled
  // template renders into the viewport.
  const capture = async (el) => {
    const touched = []
    let p = el.parentElement
    while (p) {
      const cs = window.getComputedStyle(p)
      if (cs.transform && cs.transform !== 'none') {
        touched.push({ el: p, transform: p.style.transform })
        p.style.transform = 'none'
      }
      if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
        touched.push({ el: p, overflow: p.style.overflow })
        p.style.overflow = 'visible'
      }
      p = p.parentElement
    }
    try {
      return await html2canvas(el, { scale: 1, useCORS: true, backgroundColor: null })
    } finally {
      for (const t of touched) {
        if ('transform' in t) t.el.style.transform = t.transform
        if ('overflow' in t) t.el.style.overflow = t.overflow
      }
    }
  }

  const exportSingle = async (index) => {
    const el = refs.current[index]
    if (!el) return
    // Make sure web fonts are loaded before rasterising; otherwise
    // html2canvas can rasterise mid-FOUT and characters get bad metrics.
    if (document.fonts?.ready) await document.fonts.ready
    const canvas = await capture(el)
    const link = document.createElement('a')
    link.download = `ad-${String(index + 1).padStart(2, '0')}-${items[index].templateId}-${slugify(items[index].headline)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const exportAll = useCallback(async () => {
    setExporting(true)
    setProgress({ current: 0, total: items.length })
    if (document.fonts?.ready) await document.fonts.ready
    for (let i = 0; i < items.length; i++) {
      const el = refs.current[i]
      if (!el) continue
      setProgress({ current: i + 1, total: items.length })
      const canvas = await capture(el)
      const link = document.createElement('a')
      link.download = `ad-${String(i + 1).padStart(2, '0')}-${items[i].templateId}-${slugify(items[i].headline)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      await new Promise((r) => setTimeout(r, 300))
    }
    setExporting(false)
  }, [items])

  const setColor = (key) => (e) =>
    setPalette((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          {onBack && (
            <button className="btn-back" onClick={onBack}>
              ← {preview ? 'Back' : 'Headlines'}
            </button>
          )}
          <h1>{preview ? 'Template preview' : 'Creatives'}</h1>
          <span className="badge">
            {items.length} creative{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        {!preview && onStepClick && (
          <Stepper index={step} maxStep={maxStep} onClick={onStepClick} />
        )}
        {items.length > 0 && (
          <button className="btn-export-all" onClick={exportAll} disabled={exporting}>
            {exporting
              ? `Exporting ${progress.current}/${progress.total}...`
              : `Export All (${items.length})`}
          </button>
        )}
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <section className="sidebar-section">
            <h3>Your brand</h3>
            <p className="helper-text">
              Your name + URL appear on the ad creatives — edit them here.
            </p>
            <input
              className="text-input"
              value={brand.wordmark}
              onChange={(e) => setBrand((p) => ({ ...p, wordmark: e.target.value }))}
              placeholder="Brand name (e.g. YOUR BRAND)"
            />
            <input
              className="text-input"
              value={brand.url}
              onChange={(e) => setBrand((p) => ({ ...p, url: e.target.value }))}
              placeholder="URL (optional, shown on some designs)"
            />
          </section>

          <section className="sidebar-section">
            <h3>Brand colours</h3>
            <p className="helper-text">Pick a preset or set your own — used across every design.</p>
            <div className="palette-presets">
              {PRESET_PALETTES.map((p) => {
                const active = palette.navy === p.colors.navy && palette.accent === p.colors.accent
                return (
                  <button
                    key={p.key}
                    className={`palette-swatch ${active ? 'active' : ''}`}
                    title={p.label}
                    onClick={() => setPalette(p.colors)}
                  >
                    <span className="swatch-colors">
                      <span style={{ background: p.colors.navy }} />
                      <span style={{ background: p.colors.accent }} />
                      <span style={{ background: p.colors.mint }} />
                    </span>
                    <span className="swatch-label">{p.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="color-grid">
              {[
                ['navy', 'BG dark'],
                ['navyLight', 'BG dark 2'],
                ['accent', 'Accent'],
                ['accentDark', 'Accent dark'],
                ['offWhite', 'Light BG'],
                ['white', 'Light text'],
              ].map(([key, label]) => (
                <div className="color-field" key={key}>
                  <label>{label}</label>
                  <div className="color-input-wrap">
                    <input type="color" value={palette[key]} onChange={setColor(key)} />
                    <span className="color-hex">{palette[key]}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="sidebar-section">
            <h3>Headlines</h3>
            <p className="helper-text">
              One headline per line. Edit here, then re-spread.
            </p>
            <textarea
              className="bulk-input"
              rows={12}
              value={headlinesText}
              onChange={(e) => setHeadlinesText(e.target.value)}
            />
            <button className="btn-primary" onClick={generate}>
              Generate &amp; Spread Designs
            </button>
          </section>

          <section className="sidebar-section">
            <h3>Designs in the spread ({allTemplates.length})</h3>
            <p className="helper-text">
              Headlines spread evenly across the checked designs. Add your own from a winning ad.
            </p>
            <div className="template-list">
              {allTemplates.map((t) => (
                <label key={t.id} className="template-check">
                  <input
                    type="checkbox"
                    checked={enabledIds.includes(t.id)}
                    onChange={() => toggleTemplate(t.id)}
                  />
                  <span className="template-name">{t.name}</span>
                  {t.official && <span className="template-tag">Official</span>}
                  {t.custom && (
                    <>
                      <button
                        className="template-del"
                        title="Copy config (to publish to everyone)"
                        onClick={(e) => {
                          e.preventDefault()
                          copyConfig(t)
                        }}
                      >
                        ⧉
                      </button>
                      <button
                        className="template-del"
                        title="Delete custom template"
                        onClick={(e) => {
                          e.preventDefault()
                          deleteCustomTemplate(t.id)
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </label>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setShowAddTemplate(true)}>
              + Add template from an ad
            </button>
            {copied && (
              <p className="helper-text">
                Copied “{copied}” — paste it into <code>curated-templates.json</code> to publish to
                everyone.
              </p>
            )}
          </section>
        </aside>

        <main className="creative-grid">
          {items.map((item, i) => {
            const { Component } = getEntry(item.templateId)
            return (
              <div key={i} className="creative-card">
                <div className="card-toolbar">
                  <div className="card-meta">
                    <span className="card-number">#{i + 1}</span>
                    <select
                      className="card-template-select"
                      value={item.templateId}
                      onChange={(e) => setItemTemplate(i, e.target.value)}
                    >
                      {allTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="card-actions">
                    <button className="btn-icon" title="Re-roll design" onClick={() => reroll(i)}>
                      ↻
                    </button>
                    <button className="btn-icon" title="Export PNG" onClick={() => exportSingle(i)}>
                      ↓
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      title="Remove"
                      onClick={() => removeItem(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="card-preview">
                  <ScaledPreview>
                    <Component
                      ref={(el) => (refs.current[i] = el)}
                      headline={item.headline}
                      palette={palette}
                      brand={brand}
                    />
                  </ScaledPreview>
                </div>
                <div className="card-edit">
                  <input
                    className="edit-headline"
                    value={item.headline}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, idx) =>
                          idx === i ? { ...it, headline: e.target.value } : it
                        )
                      )
                    }
                    placeholder="Headline"
                  />
                </div>
              </div>
            )
          })}
        </main>
      </div>

      {showAddTemplate && (
        <AddTemplate
          palette={palette}
          brand={brand}
          settings={settings}
          onSave={addCustomTemplate}
          onClose={() => setShowAddTemplate(false)}
        />
      )}
    </div>
  )
}

export default CreativeStudio
