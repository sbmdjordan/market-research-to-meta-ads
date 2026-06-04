import { useState } from 'react'
import { templateFromAd } from './api'
import { DEFAULT_CONFIG } from './customTemplates'
import ConfigTemplate from './templates/ConfigTemplate'
import ScaledPreview from './ScaledPreview'

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })

const SAMPLE = 'Your Headline Goes Here'

// Derive a reusable layout template from a screenshot of a successful ad.
// The vision model reads the composition; the user tweaks a few knobs; saved
// to the library. The reference image is only analysed, never reused as art.
export default function AddTemplate({ palette, brand, settings, onSave, onClose }) {
  const [refImage, setRefImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [config, setConfig] = useState(null)
  const [name, setName] = useState('Custom')
  const [ownImage, setOwnImage] = useState(null) // user's own background for image templates

  const pickRef = async (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setRefImage(await readFile(f))
      setError('')
    }
  }

  const analyze = async () => {
    setAnalyzing(true)
    setError('')
    try {
      const { config: c } = await templateFromAd({ image: refImage, providers: settings })
      setConfig(c)
      if (c.name) setName(c.name)
    } catch (e) {
      setError(e.message || 'Could not read that ad. Try a clearer screenshot or a vision-capable model.')
    } finally {
      setAnalyzing(false)
    }
  }

  const patch = (section, key, val) =>
    setConfig((c) => ({ ...c, [section]: { ...c[section], [key]: val } }))

  const pickOwnImage = async (e) => {
    const f = e.target.files?.[0]
    if (f) setOwnImage(await readFile(f))
  }

  // Bake the user's own image into image-type backgrounds for preview + save.
  const effective = config
    ? {
        ...config,
        background:
          config.background?.type === 'image'
            ? { ...config.background, image: ownImage || null }
            : config.background,
      }
    : DEFAULT_CONFIG

  const Select = ({ section, k, options }) => (
    <select
      className="card-template-select"
      value={config?.[section]?.[k] ?? ''}
      onChange={(e) => patch(section, k, e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal add-template" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Add a template from an ad</h2>
          <button className="banner-x" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">
          Upload a screenshot of a Meta ad that works. The vision model reads its layout and
          builds a reusable template — your headline, brand, and colours drop in. (Uses your
          Writing-stage model; it must be vision-capable, e.g. Claude or GPT-4o.)
        </p>

        <div className="add-template-body">
          <div className="add-template-left">
            <label className="field-label">Reference ad</label>
            <input type="file" accept="image/*" onChange={pickRef} />
            {refImage && <img className="ref-thumb" src={refImage} alt="reference ad" />}
            <button className="btn-cta inline" disabled={!refImage || analyzing} onClick={analyze}>
              {analyzing ? 'Reading the ad…' : config ? 'Re-analyze' : 'Analyze ad →'}
            </button>
            {error && <p className="settings-warn">{error}</p>}

            {config && (
              <div className="add-template-controls">
                <label className="field-label">Template name</label>
                <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} />

                <label className="field-label">Background</label>
                <Select section="background" k="type" options={['solid', 'gradient', 'split', 'image']} />
                {config.background?.type === 'image' && (
                  <>
                    <p className="helper-text">Your own background image (the reference photo isn’t reused):</p>
                    <input type="file" accept="image/*" onChange={pickOwnImage} />
                  </>
                )}

                <label className="field-label">Headline position</label>
                <div className="control-row">
                  <Select section="headline" k="vertical" options={['top', 'center', 'bottom']} />
                  <Select section="headline" k="horizontal" options={['left', 'center', 'right']} />
                  <Select section="headline" k="align" options={['left', 'center', 'right']} />
                </div>

                <label className="field-label">Accent</label>
                <Select
                  section="accent"
                  k="type"
                  options={['none', 'bar-left', 'bar-top', 'bar-bottom', 'underline']}
                />
              </div>
            )}
          </div>

          <div className="add-template-right">
            <label className="field-label">Preview</label>
            <div className="add-template-preview">
              <ScaledPreview>
                <ConfigTemplate config={effective} headline={SAMPLE} palette={palette} brand={brand} />
              </ScaledPreview>
            </div>
            {!config && <p className="helper-text">Analyze an ad to see the template here.</p>}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-cta inline"
            disabled={!config}
            onClick={() => {
              onSave({ name: name.trim() || 'Custom', config: effective })
              onClose()
            }}
          >
            Save template
          </button>
        </div>
      </div>
    </div>
  )
}
