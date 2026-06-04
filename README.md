# Market Research → Meta Ads

One tool that takes you from *"here's my product"* to *a folder of ready-to-run Meta (Facebook/Instagram) static ad creatives* — through the full marketing pipeline, automated:

```
Your product  →  Customer-segment research  →  Pick a segment  →  Angles
              →  Headlines (edit / add your own)  →  1080×1080 ad PNGs  →  Export
```

You type what you sell. The tool does deep customer research, you pick the segment to attack, and it generates the angles, the headlines, and one ad creative per headline — spread across distinct designs so a real headline test isn't sabotaged by Meta's delivery collapsing look-alike creatives.

## What runs each stage

| Stage | Default engine | Why |
|---|---|---|
| Research | **Perplexity** deep research | Live web retrieval — mines real customer voice from reviews/forums, not guesses |
| Segments · Angles · Headlines | **Claude** | Strong copy and faithful structuring of the research |
| Ad creatives | In-app render (`html2canvas`) | No AI, no key — pure design templates |

Perplexity + Claude are the **recommended defaults, not a lock-in.** Don't have or want them? Open the **⚙ LLMs** panel and pick a different provider per stage: **OpenAI**, **OpenRouter** (which reaches almost every model — GPT, Claude, Gemini, Llama…), Groq/Together/Mistral/DeepSeek, or any **custom OpenAI-compatible endpoint** (incl. self-hosted Ollama/LM Studio). You bring your own API keys; nothing is hardcoded.

> The **research** stage does live web search, and the app handles that for you per provider: **Perplexity** (native), **OpenAI** (auto-uses a `search-preview` model), **OpenRouter** (auto-appends `:online`), and **Claude** (web-search tool). Pick any of them and research just works. Only a **Custom** endpoint is on you — point it at a web-capable model, or research will invent segments instead of finding them (the app flags this in Settings). The **writing** stages work on any chat model.

## Cost & why these defaults

A subscription (ChatGPT Plus, Claude Pro, Perplexity Pro) **can't run this app** — those unlock each provider's chat website, not its API. Apps call the API, which is billed separately per use. So you pay per run, not per month.

You don't have to pay much, though, and you choose per stage in **⚙ LLMs**:

- **Writing stages (segments, angles, headlines)** — these are pure text generation. A **free-tier key works fine here**: Gemini's free tier, Groq, an OpenRouter `:free` model, or a local model (Ollama/LM Studio). Quality is good enough and the cost is $0. Use the recommended Claude default if you want the sharpest copy, but free is a legitimate choice.
- **Research stage** — this is the part we **recommend keeping on the paid default (Perplexity)**, and here's the honest reason: it's the only stage that does live web search, and it's the foundation everything else is built on. Free web-capable models are scarce and weak — point this stage at one and you get shallow or invented segments, which quietly poisons every angle and headline downstream. A real research run is only a few cents, and it's the cheapest stage to *not* cut corners on.

Bottom line: **go free on the writing if you like; keep a few cents of real web research at the top.** But it's your call — every stage is swappable.

## Prerequisites

- **Node 18+**
- An API key for **whichever providers you'll use**. For the recommended defaults:
  - **Perplexity** (research) — https://www.perplexity.ai/settings/api (pay-as-you-go; a research run is usually a few cents to ~$0.30)
  - **Anthropic / Claude** (writing) — https://console.anthropic.com/
  - Prefer something else? Set an OpenAI / OpenRouter / custom key instead and pick it in **⚙ LLMs** (see above).

## Setup

```bash
npm install
cp .env.example .env      # add the key(s) for the providers you'll use
npm run dev               # http://localhost:5173
```

`npm run dev` starts both the web app (port 5173) and the backend API (port 8787) together. Open **http://localhost:5173** and walk the steps. The app tells you up front if a stage has no key, and you can set keys/providers in **⚙ LLMs** instead of `.env` if you prefer.

> Your keys live only in `.env` on the backend — they're never sent to the browser, and `.env` is git-ignored.

## How it works (6 steps)

First load runs a quick **guided tour** over the screen; replay it anytime with **How it works** (top right).

1. **Setup** — type your product/service, pick B2C/B2B, add any context. Hit *Run*.
2. **Sources** — it finds the specific places your buyers actually talk (subreddits, reviewers, forums). Review the list, add the ones you trust, remove any that don't fit — then run the deep research on exactly those. Better sources = stronger evidence.
3. **Segments** — the research comes back as pickable cards (overview, top pains, top desired outcomes, an evidence tag, and a "see full breakdown" with objections, quotes, and angles). The sources used and the raw research are one click away. Pick one segment to target.
4. **Offer** — a draft offer brief is pre-filled from your product + segment; sharpen it (add real numbers/proof). This grounds the headlines.
5. **Headlines** — every angle the segment supports becomes one headline (as many as the research earns — not a fixed number). Edit them, drop weak ones, or add your own.
6. **Creatives** — one 1080×1080 PNG per headline, across distinct designs. Tweak brand/palette, add your own template from a winning ad, then **Export All**.

## Architecture

```
server/                 Backend — holds keys, runs the AI stages
  index.js              Express API: /api/sources, /api/research, /api/angles, /api/headlines, /api/template-from-ad, /api/status
  providers.js          Provider registry + per-stage resolution (.env default + override)
  llm/                  index.js (dispatch) · openaiCompatible.js · anthropic.js
  prompts/              sources · research · structure · angles · headlines · templateFromAd (+ bundled writing rules)
src/                    Frontend — Vite + React
  Pipeline.jsx          The 6-step wizard (state + flow) + guided tour
  Settings.jsx          ⚙ LLMs panel — provider/model/key per stage
  steps/                One component per step (Setup · Sources · Segments · Offer · Headlines)
  CreativeStudio.jsx    The creative engine (final step)
  templates/            7 built-in designs + ConfigTemplate (renders custom & Official ones)
  presets/              Brand/palette presets (ships with one neutral starter)
```

**Add a provider:** most are already covered by the generic OpenAI-compatible caller — just pick "Custom" in Settings and give a base URL, or add an entry to `server/providers.js` for a nicer label/default.

**Add a design — in-app, from a winning ad:** in the Creatives step, "Designs in the spread" → **+ Add template from an ad**. Upload a screenshot of a Meta ad that works; a vision model reads its layout and builds a reusable template (your headline/brand/colours drop in). It saves to your browser and joins the spread. The reference photo is only analysed, never reused — photo ads become an image slot you fill with your own shot. *(Needs a vision-capable Writing-stage model — Claude or GPT-4o.)*
**Add a design — in code:** a new `templates/Name.jsx` + one line in `templates/index.js`.
**Save a brand:** copy `presets/example.js`, edit palette/wordmark, add it to `presets/index.js`.

**Shared "Official" templates (push winners to everyone):** the app fetches a curated `curated-templates.json` on load and shows those as read-only **Official** designs. To publish a winner to every install: build it in-app → copy its config (the ⧉ button on a custom template) → paste it into `curated-templates.json` → push. Point all installs at your file with `VITE_CURATED_TEMPLATES_URL` (the raw URL); everyone gets it on their next load. A bundled copy ships as the offline fallback.

## Deploy

It's a Node app (needs the backend to hold keys), not a static site:

```bash
npm run build     # builds the frontend into dist/
npm start         # Express serves dist/ + the API on PORT (default 8787)
```

Host anywhere that runs Node (Render, Railway, Fly, a VPS). Set the same `.env` keys in the host's environment.

See `CLAUDE.md` for the design rationale (the Andromeda spread) and extension notes.
