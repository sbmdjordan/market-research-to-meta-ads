import { useState, useEffect } from 'react'
import { getStatus, discoverSources, runResearch, runAngles, runHeadlines } from './api'
import { loadSettings, saveSettings, stageReady } from './settingsStore'
import Settings from './Settings'
import Tour from './Tour'
import { LogoMark } from './Logo'
import { Stepper } from './Stepper'
import StepSetup from './steps/StepSetup'
import StepSources from './steps/StepSources'
import StepSegments from './steps/StepSegments'
import StepBrief from './steps/StepBrief'
import StepHeadlines from './steps/StepHeadlines'
import CreativeStudio from './CreativeStudio'
import './Pipeline.css'

// Varied sample messages for the no-key template preview — different angle
// types (pain, desire, proof, question, contrarian, number) so the designs
// show a real spread.
const SAMPLE_HEADLINES = [
  'Stop Guessing What Your Customers Want',
  'Most Brands Test One Ad. Winners Test Twenty.',
  'Your Best Customer Is Already Searching for This',
  'Tired of Creative That Looks Good but Never Converts?',
  'Real Research. Not Another Guess.',
  'Test the Message Before You Spend the Budget',
  'What If Your Ads Wrote Themselves?',
  'The 3-Minute Fix for a Flatlining Campaign',
  'Why Your Last Launch Fell Flat',
  'One Product. Twelve Angles. Let the Data Pick.',
]

// Pre-fill an offer brief from the product + chosen segment. The user edits it;
// it then feeds the angle and headline prompts verbatim.
function draftBrief(product, segment) {
  return [
    `What it is: ${product}`,
    `Who it's for: ${segment.name}${segment.hook ? ` — ${segment.hook}` : ''}`,
    `What the ad must drive: a click through to the landing page.`,
    `Proof / numbers (optional): add any ROI, time saved, or price here.`,
  ].join('\n')
}

export default function Pipeline() {
  const [step, setStep] = useState(0)
  // Furthest step whose data actually exists — tabs up to here are clickable.
  const [maxStep, setMaxStep] = useState(0)
  const advance = (n) => {
    setStep(n)
    setMaxStep((m) => Math.max(m, n))
  }
  const [setup, setSetup] = useState({ product: '', market: '', context: '' })
  const [sources, setSources] = useState([])
  const [research, setResearch] = useState(null)
  const [segment, setSegment] = useState(null)
  const [brief, setBrief] = useState('')
  const [headlineItems, setHeadlineItems] = useState([])

  const [busy, setBusy] = useState(false)
  const [busyMsg, setBusyMsg] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)

  const [settings, setSettings] = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  // Show the intro on first visit; reopenable via "How it works".
  const [intro, setIntro] = useState(() => !localStorage.getItem('pipeline-onboarded'))
  // No-key template preview — jump straight to the creative studio with samples.
  const [preview, setPreview] = useState(false)

  const startApp = () => {
    localStorage.setItem('pipeline-onboarded', '1')
    setIntro(false)
  }

  useEffect(() => {
    getStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [])

  const onSaveSettings = (s) => {
    setSettings(s)
    saveSettings(s)
  }

  const fail = (e) => {
    setError(e.message || 'Something went wrong')
    setBusy(false)
    setBusyMsg('')
  }

  // Setup → discover sources (fast), then show them for review before the
  // slow, paid deep-research call.
  const onDiscoverSources = async (input) => {
    setSetup(input)
    setError('')
    setBusy(true)
    setBusyMsg('Finding the specific places your buyers actually talk…')
    try {
      const { sources: found } = await discoverSources({ ...input, providers: settings })
      setSources(found || [])
      advance(1)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
      setBusyMsg('')
    }
  }

  // Sources approved → run the deep research on exactly those.
  const onResearch = async (approvedSources) => {
    setSources(approvedSources)
    setError('')
    setBusy(true)
    setBusyMsg(
      'Mining real customer voice from these sources. Deep research takes several minutes — often 5–10, sometimes longer. Hang tight, this is the part that makes everything downstream good.'
    )
    try {
      const data = await runResearch({ ...setup, sources: approvedSources, providers: settings })
      if (!data.segments?.length)
        throw new Error('No segments came back. Try a more specific product description.')
      setResearch(data)
      advance(2)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
      setBusyMsg('')
    }
  }

  const onPickSegment = (seg) => {
    setSegment(seg)
    setBrief(draftBrief(setup.product, seg))
    setError('')
    advance(3)
  }

  const onGenerate = async (briefText) => {
    setBrief(briefText)
    setError('')
    setBusy(true)
    try {
      setBusyMsg('Extracting every angle this segment supports…')
      const { angles } = await runAngles({
        product: setup.product,
        market: setup.market,
        offerBrief: briefText,
        segment,
        providers: settings,
      })
      if (!angles?.length) throw new Error('No angles came back. Try sharpening the offer brief.')

      setBusyMsg(`Writing ${angles.length} headlines…`)
      const { headlines } = await runHeadlines({
        offerBrief: briefText,
        angles,
        providers: settings,
      })

      setHeadlineItems(
        (headlines || []).map((h) => ({ headline: h.headline || '', angle: h.angle || '' }))
      )
      advance(4)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
      setBusyMsg('')
    }
  }

  const editHeadline = (i, val) =>
    setHeadlineItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, headline: val } : it)))
  const removeHeadline = (i) =>
    setHeadlineItems((prev) => prev.filter((_, idx) => idx !== i))
  const addHeadline = () =>
    setHeadlineItems((prev) => [...prev, { headline: '', angle: 'your own' }])

  // The creative studio is its own full-screen app; render it without the
  // wizard chrome once we hand off the final headline list.
  // No-key preview: show the templates with sample headlines, no pipeline run.
  if (preview) {
    return (
      <CreativeStudio
        headlines={SAMPLE_HEADLINES}
        settings={settings}
        preview
        onBack={() => setPreview(false)}
      />
    )
  }

  if (step === 5) {
    const headlines = headlineItems.map((it) => it.headline.trim()).filter(Boolean)
    return (
      <CreativeStudio
        headlines={headlines}
        settings={settings}
        onBack={() => setStep(4)}
        step={step}
        maxStep={maxStep}
        onStepClick={setStep}
      />
    )
  }

  // Which stages can't run with the current provider/key setup.
  const notReady = [
    !stageReady(settings.research, status) && 'research',
    !stageReady(settings.writing, status) && 'writing',
  ].filter(Boolean)

  return (
    <div className="pipeline">
      <header className="pipeline-header">
        <div className="brand-lockup">
          <LogoMark size={34} />
          <span className="brand-word">
            Efficiency <span className="works">Works</span>
          </span>
          <span className="brand-divider" />
          <span className="brand-product">Ad Studio</span>
        </div>
        <div className="header-right">
          <Stepper index={step} maxStep={maxStep} onClick={setStep} />
          <button className="btn-settings" onClick={() => setIntro(true)} title="What this tool does">
            How it works
          </button>
          <button className="btn-settings" onClick={() => setShowSettings(true)} title="LLM settings">
            ⚙ LLMs
          </button>
        </div>
      </header>

      {notReady.length > 0 && (
        <div className="banner banner-warn">
          Add your own API key in{' '}
          <button className="banner-link" onClick={() => setShowSettings(true)}>
            ⚙ LLMs
          </button>{' '}
          to begin — it&apos;s needed for the {notReady.join(' and ')} stage
          {notReady.length > 1 ? 's' : ''}. Your key is stored in your browser.
        </div>
      )}

      {error && (
        <div className="banner banner-error">
          {error}
          <button className="banner-x" onClick={() => setError('')}>
            ✕
          </button>
        </div>
      )}

      <main className="pipeline-body">
        {busy && (
          <div className="busy-overlay">
            <div className="spinner" />
            <p>{busyMsg}</p>
          </div>
        )}

        {step === 0 && (
          <StepSetup
            initial={setup}
            busy={busy}
            onRun={onDiscoverSources}
            onPreview={() => setPreview(true)}
          />
        )}
        {step === 1 && (
          <StepSources
            sources={sources}
            busy={busy}
            onResearch={onResearch}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && research && (
          <StepSegments research={research} onPick={onPickSegment} onBack={() => setStep(1)} />
        )}
        {step === 3 && segment && (
          <StepBrief
            segment={segment}
            draft={brief}
            busy={busy}
            onGenerate={onGenerate}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepHeadlines
            items={headlineItems}
            onEdit={editHeadline}
            onRemove={removeHeadline}
            onAdd={addHeadline}
            onContinue={() => advance(5)}
            onBack={() => setStep(3)}
          />
        )}
      </main>

      {showSettings && (
        <Settings
          status={status}
          settings={settings}
          onSave={onSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {intro && <Tour onClose={startApp} />}
    </div>
  )
}
