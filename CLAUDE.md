# Market Research → Meta Ads

One cohesive, shareable tool: type a product → deep customer-segment research (Perplexity) → pick a segment → angles → headlines (Claude) → one 1080×1080 static-ad PNG per headline, spread across designs (in-app) → export. The whole pipeline that used to be two Claude Code skills + a separate creative app, fused into a single web app a non-Claude-Code user can clone and run.

> Project: `C:\Users\Jordan\Projects\Personal\ad-creative-generator\` (Personal, sbmdjordan).
> Stack: React + Vite frontend; thin Express backend holding the API keys; `html2canvas` for PNG export.
> Folder name predates the rebrand to the full pipeline — repo name decided at GitHub push time.

## Run

```
cd C:\Users\Jordan\Projects\Personal\ad-creative-generator
npm install
cp .env.example .env       # add PERPLEXITY_API_KEY + ANTHROPIC_API_KEY
npm run dev                # web :5173 + api :8787 (concurrently). Open http://localhost:5173
npm run build && npm start # prod: Express serves dist/ + api on :8787
```

## Why a backend exists

The AI stages call Perplexity/Anthropic, which **can't be called from the browser** (CORS + key exposure). The Express server holds keys from `.env` and proxies the stage calls, so keys never reach the client. This is the architectural change from the old pure-static app — and what gives the tool a real, documented `.env` (the shareability the user wanted).

## Why design variety matters (the core constraint)

Meta's Andromeda delivery system collapses visually-near-identical creatives, which kills a messaging test (the point is testing *headlines*, not one design). So the tool renders **one creative per headline** and **spreads designs across the set** — headlines cycle a shuffled list of enabled templates. Some repeated designs are fine; uniform designs are not.

## Architecture

```
server/                Backend — holds keys, runs the 3 AI stages
  index.js             Express: POST /api/sources|research|angles|headlines|template-from-ad, GET /api/status.
                       Endpoints pass per-stage provider overrides (providers:{research,writing})
                       from the body to run(); fall back to .env. Prod: also serves dist/.
  providers.js         Provider registry (perplexity/anthropic/openai/openrouter/custom) +
                       resolveStage(stage, override) merging .env defaults ← Settings override.
                       Also applies research-stage web search per provider via webSearch.mode:
                       native (perplexity) · model→search-preview (openai) · suffix :online
                       (openrouter) · tool flag (anthropic). statusSnapshot() = env-key booleans
                       + registry (web flags), never key values.
  config.js            port only (.env via dotenv)
  util.js              extractJson() — tolerant parse of model JSON (strips fences)
  llm/
    index.js           run({stage,override,...,image}) → resolve + dispatch by type → {text,citations};
                       passes webSearch flag + optional image (data URL → multimodal/vision)
    openaiCompatible.js  any OpenAI /chat/completions provider; image → content array w/ image_url;
                         citations from `citations`/annotations/search_results
    anthropic.js       Claude Messages API; web_search_20250305 tool when webSearch set; image → base64
                       image block; parses citations from result + text-citation blocks
  prompts/
    sources.js         source-discovery step — find specific named sources for the product (the
                       original workflow's separate "find me the sources" prompt; writing model)
    research.js        ported /customer-segments prompt; mines the discovered sources, evidence honesty
    structure.js       research prose → segments JSON (exhaustive extraction, no inventing)
    angles.js          ported /segment-angles-headlines Step 5 (avatar language; count driven by research, no padding)
    headlines.js       ported Step 6 — one headline per angle
    writing.js         WRITING_RULES string (banned words etc.) bundled into headlines
    templateFromAd.js  vision prompt: reference ad → layout-template config JSON (style, not pixels)
src/                   Frontend — Vite + React
  App.jsx              Mounts <Pipeline/>
  Pipeline.jsx         6-step wizard (Setup·Sources·Segments·Offer·Headlines·Creatives): state + flow + banners; first-run Tour overlay
  Tour.jsx             interactive walkthrough — spotlight + arrowed tooltip over the real screen
  Settings.jsx         ⚙ LLMs modal — per-stage provider/model/key/baseURL
  settingsStore.js     load/save settings (localStorage) + stageReady()
  api.js               fetch client for /api/* (sends providers:{research,writing})
  customTemplates.jsx  load/save custom templates (localStorage) + map config → engine entries
  AddTemplate.jsx      ⊕ builder: upload ad → vision → config → tweak → save to library
  steps/               StepSetup · StepSources (approve/edit sources) · StepSegments (expandable breakdown) · StepBrief · StepHeadlines
  CreativeStudio.jsx   The creative engine (was App.jsx): parse → spread → preview → export.
                       Merges built-in + custom templates; hosts the Add-template builder.
  ScaledPreview.jsx    Scales the 1080×1080 node down to fit a card
  templates/           7 built-in 1080×1080 designs (+ index registry, shared.js fitFont)
                       + ConfigTemplate.jsx: ONE generic renderer for config-driven custom templates
  presets/             Brand/palette registry — ships ONE neutral starter (example.js)
```

**Custom templates (from a reference ad):** AddTemplate sends the uploaded ad image to `/api/template-from-ad` → vision model returns a layout config (background/headline/accent/brand; palette KEYS not hex; photo → image slot the user fills, never the reference pixels). Stored in localStorage; `customToEntries` maps each config to an engine entry rendered by `ConfigTemplate`.

**Curated "Official" templates (owner → everyone):** `curatedTemplates.js` fetches `VITE_CURATED_TEMPLATES_URL` (a `curated-templates.json` the owner maintains) on load, falling back to the bundled `src/curated/curatedTemplates.json` when offline/unset. `curatedToEntries` marks them `official` (read-only, enabled in the spread by default). Publish flow: build a template in-app → ⧉ copy its config → paste into root `curated-templates.json` → push; all installs pointing at that URL get it on next load. Three sources share the spread, per-card select, and export: built-in (code) · official (curated config) · custom (personal config).

**Pipeline data flow:** Setup → `/api/sources` (Claude discovers specific named sources) → **StepSources: user reviews/edits/adds the list (approval gate)** → `/api/research` with the approved sources = (1) Perplexity deep-researches mining them (16k cap) → (2) Claude structures prose into segment cards (16k cap). Returns segments + rawResearch + citations + sources (sources shown in StepSegments). User picks a segment → draft offer brief → `/api/angles` → `/api/headlines` → headline list (editable, add-your-own) → CreativeStudio renders PNGs. (`/api/research` still self-discovers if no sources are passed — backward-compatible.)

**Token caps + truncation:** model calls cap at 12–16k tokens (was 8k — caused mid-segment cutoffs once structure extraction went exhaustive). `extractJson` also salvages a truncated array by keeping the complete elements, so a cut-off run still yields whole segments rather than a 500.

**Template = one self-contained design**: a `forwardRef` component rendering a 1080×1080 root, styled inline. Add one: build `templates/Name.jsx` + a line in `templates/index.js`.

**Preset = per-brand config** (palette, wordmark/url, templates, placeholder headlines). Genericized for sharing — ships only `example.js`. Add a brand = copy it + one line in `presets/index.js`. Headlines now come from the pipeline, not a baked-in product.

## Source-of-truth prompts (ported, kept in sync)

The backend prompts are ports of the Claude Code skills. If the skills are sharpened, port the change here too:
- `~/.claude/commands/customer-segments.md` → `server/prompts/research.js` (+ `structure.js`)
- `~/.claude/commands/segment-angles-headlines.md` → `server/prompts/angles.js` + `headlines.js`
- `~/.claude/commands/writing.md` → `server/prompts/writing.js`

## Templates (7)

`gradient-center` (dark, original look) · `solid-left` (flat navy, left bar) · `accent-block` (light, accent card) · `top-rule` (navy, top accent rule) · `big-quote` (full-accent field) · `split-panel` (navy/accent split) · `minimal` (light editorial). 4 dark / 1 bold-accent / 2 light — a deliberate spread so Andromeda sees distinct creatives.

## Lessons learnt
- 2026-06-04 — Fused the two skills + the creative app into one web app for non-Claude-Code sharing. The AI stages need a backend because browsers can't call LLM APIs (CORS + key exposure) — that backend is also what finally gives the tool a documented `.env`. Why: "share like the IG tool" only works once keys have a server-side home.
- 2026-06-04 — Provider choice (Milestone 2) built right after M1: any-provider per stage so nobody's locked into Perplexity/Claude. Key realisation — one generic OpenAI-compatible caller covers OpenAI, OpenRouter (≈ every model), Groq/Together/Mistral/DeepSeek, Perplexity, and custom/local; only Claude needs its own transport. So "any provider" was a small abstraction, not N integrations. Local-specific UI stays cut; the generic Custom option covers it without extra weight.
- 2026-06-04 — Thin-evidence fix: restored the original workflow's separate source-discovery step (a "find me the real, named sources" call before deep research), so research mines specific communities instead of self-selecting shallow ones. Also the 8k token cap was truncating research + cutting structure off mid-segment (worsened once structure went exhaustive) → raised to 12–16k and made extractJson salvage truncated arrays. Why: thin evidence + an incomplete 2nd segment on a rich category (premium backpacks) were both symptoms — wrong sources AND truncation.
- 2026-06-04 — In-app "add template from a reference ad" (config approach, not generated code). User's model: templates are always derived from winning Meta ads, and should get more creative over time. So the feature is upload ad → vision model → editable layout CONFIG → rendered by one generic `ConfigTemplate`. Chose config over generated-code for safety/editability; the schema (and renderer) is the thing we extend as new ad patterns show up. Capture layout/style, never the competitor's pixels — photo ads become a user-filled image slot. Onboarding earlier flipped from a full-screen card to an interactive spotlight Tour on the user's call (keep the real screen visible, point arrows at the tabs).
- 2026-06-04 — Web search for research across providers (OpenAI/OpenRouter/Claude; Gemini deferred). Principle behind it: a provider choice that can't actually do research isn't a real choice. Complexity insight — "web search" splits into native (model searches via the plain chat call: Perplexity sonar, OpenAI `*-search-preview`, OpenRouter `:online`) vs tool-based (pass a tools param + parse a provider-specific response: Claude, Gemini). Native = config only (model swap / suffix in resolveStage), zero new transport — that's why OpenAI+OpenRouter were cheap. Claude = small (one conditional tool param + citation parse, same endpoint). Gemini = its own native transport (OpenAI-compat endpoint won't ground) → medium, deferred as the one place complexity stops paying. Custom stays web:false (unknown endpoint) with a soft Settings warning.
- 2026-05-19 — Reusability came from *extracting* product data into a preset, not duplicating the project. The fix for a fused tool is separation, not a fork.
- 2026-05-19 — Body-copy generation removed: out of scope, the PNG is headline-only. Keep the tool to one job.
- 2026-05-19 — html2canvas: templates use inline styles + solid shapes/gradients/borders only (no backdrop-filter) so exports rasterize faithfully.
- 2026-05-21 — html2canvas + `transform: scale()` on a parent renders text scrambled (positions from the scaled context, rasterized at full size — characters stack). `ScaledPreview` wraps each template in a scaled div, so `capture()` walks up the tree and neutralizes transforms + overflow:hidden during export, then restores. Also `await document.fonts.ready` before rasterizing (FOUT breaks metrics). ALWAYS spot-check one PNG at full resolution before trusting the batch.
- 2026-05-21 — Spot-check exports at full size, not File Explorer thumbnails. A scrambled PNG can read as "abstract design" in a 100px tile.

## Current status
- ✅ Full pipeline built (Milestone 1): research → segments → offer → headlines → creatives, Perplexity + Claude defaults, genericized to one neutral preset, `.env` + `.env.example` + README for sharing.
- ✅ Provider choice built (Milestone 2): per-stage provider/model/key via ⚙ LLMs panel + `.env`; OpenAI/OpenRouter/custom-OpenAI-compatible supported via one generic caller.
- ✅ Research web search across providers: Perplexity (native), OpenAI (search-preview model), OpenRouter (`:online`), Claude (web_search tool) all do real research. Gemini deferred. Custom = soft warning.
- ✅ Onboarding = interactive Tour (spotlight + arrows over the live screen, walks the tabs); "How it works" replays it. Time estimate corrected to "several minutes, often 5–10+".
- ✅ Segments step shows full per-segment breakdown (expandable) + evidence legend; structure prompt extracts all detail; angle/headline count is research-driven (no fixed ~40).
- ✅ Brand editing surfaced at top of Creative Studio sidebar; preset renamed "Your Brand".
- ✅ In-app template builder: "+ Add template from an ad" (vision → editable layout config → saved to library, joins the spread). Needs a vision-capable Writing model (Claude/GPT-4o).
- ▶ Milestone 3 (future): `git init` + push to a new private GitHub repo under sbmdjordan (needs explicit go; commit email sbmdjordan@gmail.com).
- ▶ Next (future): more templates from user-supplied reference ads.
- ⚠ Live AI flow not yet run end-to-end with real keys — verified build + boot + status/validation paths only. Needs a real key to exercise actual LLM calls + JSON parsing.
