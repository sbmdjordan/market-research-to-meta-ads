# Market Research → Meta Ads

One cohesive, shareable tool: type a product → deep customer-segment research (Perplexity) → pick a segment → angles → headlines (Claude) → one 1080×1080 static-ad PNG per headline, spread across designs (in-app) → export. The whole pipeline that used to be two Claude Code skills + a separate creative app, fused into a single web app a non-Claude-Code user can clone and run.

> Project: `C:\Users\Jordan\Projects\Personal\ad-creative-generator\` (Personal, sbmdjordan).
> Stack: React + Vite frontend; thin Express backend holding the API keys; `html2canvas` for PNG export.
> Folder name predates the rebrand to the full pipeline — repo name decided at GitHub push time.

## Productization plan — public tool on efficiencyworks.io (decided 2026-07-03)

**PHASE 1 BUILT 2026-07-03 — fold-in + gate; runs locally, NOT yet deployed.**
- Frontend merged into the site: `pricing-landing-page/src/meta-ads/` (copied tree; the standalone `main.jsx`/`App.jsx`/`index.css` are left in place but unused), wrapped by `src/meta-ads/MetaAdsApp.jsx` (the `.meta-ads-app` scope), routed at `/meta-ads` in `src/App.jsx`, with a homepage Tools card in `src/pages/Umbrella.jsx`. Theme isolation was tiny: only `.btn-cta` collided with RentRange, plus 4 global selectors in `efficiency-e3.css` (`:root`/`body`/`#root`/`h1-3`) — all scoped to `.meta-ads-app`. Tool API base = `VITE_API_BASE` (`src/meta-ads/api.js` + password header); dev value in the site's `.env.development`; `html2canvas` added to site deps.
- Backend (this repo) hardened in `server/index.js`: CORS (`ALLOWED_ORIGINS`), password gate (`TOOL_PASSWORD`, open when unset), and `server.requestTimeout = 0` (Node's 5-min default would clip long research). `render.yaml` added for an always-on Render deploy (free tier cold-starts; upgrade to starter to avoid).
- Run locally: this repo `node server/index.js` (:8787) + site `npm run dev` (:5173) → http://localhost:5173/meta-ads. Needs keys via the tool's ⚙ Settings panel or this repo's `.env`.
- Verified: site `npm run build` compiles the merge clean (69 modules); both servers boot; `/meta-ads` + `/api/status` return 200.
- **PHASE 2 BUILT 2026-07-04 — per-stage model split, deployed.** `server/providers.js` STAGE_DEFAULTS now has 5 stages (discovery=perplexity/sonar · research=perplexity/sonar-deep-research · structure=openai/gpt-4o · angles=openai/gpt-4o · headlines=anthropic · plus `writing`=anthropic for the template-from-ad vision call). Each overridable via `<STAGE>_PROVIDER`/`<STAGE>_MODEL` env. Endpoints in `server/index.js` call the new stages; `server/llm/index.js` logs `[stage:X] provider/model` (visible in Render logs). Web search also enabled for discovery. **REQUIRES `OPENAI_API_KEY` on Render** (structure + angles) — Perplexity + Anthropic keys already set.
- **Phase 3 (money layer) - pricing model LOCKED 2026-07-04; 3a + 3b + 3c + 3d BUILT 2026-07-05, NOT yet deployed (needs Stripe products + env vars — see below).** Tiered margin profile: free runs on `sonar-pro` (~£0.42/run), paying subscribers on `sonar-deep-research` (~£0.80/run) — backend picks the research model by the caller's plan. Funnel: **Free run** = 1 run, ONE-TIME per email, email-gated (= lead capture), sonar-pro. **No trial.** **Starter £19/mo = 10 runs**, **Pro £49/mo = 30 runs**, both deep-research, hard-capped (a subscriber can't cost more than they pay). Margins: Starter £11 (58%), Pro £25 (51%). Per-run cost basis: discovery ~£0.01 (perplexity sonar) · research ~£0.60 deep-research / ~£0.20 sonar-pro · structure ~£0.14 (gpt-4o) · angles ~£0.08 (gpt-4o) · headlines ~£0.10 (claude sonnet). ~50-58% gross-margin business; near-zero fixed cost (~£7/mo Render); break-even at ~2-3% free->paid conversion.
- **Phase 3 status (2026-07-04):**
  - **3a DONE + LIVE - landing page.** `efficiencyworks.io/meta-ads` is now the marketing front door (`pricing-landing-page/src/meta-ads/MetaAdsLanding.jsx` + `.css`, scoped to `.ma-landing`); the tool moved to `/meta-ads/app` (routes in `src/App.jsx`). Homepage Tools card points at `/meta-ads`.
  - **3b DONE + LIVE - email-gated free run.** Landing email form -> `POST /api/free-run` (captures the lead, reports if the email already ran). Gate reworked in `server/index.js`: owner (`TOOL_PASSWORD` header) = deep-research unlimited; a valid `x-user-email` header = FREE plan -> research forced to `sonar-pro`, claimed ONCE per email atomically (`server/kv.js` `claimFreeRun` via Upstash `SET NX`). `src/meta-ads/api.js` sends `x-user-email`. Env added on Render + local `.env`: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. KV keys: leads `metaads:lead:<email>`, free-run flag `metaads:free:<email>`. **PENDING: Jordan's end-to-end test** (email -> run -> confirm `perplexity/sonar-pro` in Render logs -> second attempt blocked).
  - **3c BUILT 2026-07-05 - accounts + Stripe, NOT deployed.** Reused RentRange's exact Stripe/webhook/magic-link pattern (`pricing-landing-page/api/`). New site-repo Vercel functions: `meta-ads-checkout.js` (flat-rate Checkout Session, plan in metadata — no quantity dance needed), `meta-ads-stripe-webhook.js` (OWN signing secret; writes `metaads:sub:<email>` on `checkout.session.completed`/`.updated`/`.deleted`), `meta-ads-welcome.js` (mirrors `welcome-info.js` — retrieves the session immediately post-redirect, mints a signed manage token via the existing generic `_lib/token.js`), `meta-ads-billing-portal.js` (verifies the signed token, opens Stripe Customer Portal). Shared KV client `api/_lib/meta-ads-kv.js` uses ITS OWN env var names (`META_ADS_UPSTASH_URL`/`META_ADS_UPSTASH_TOKEN`, NOT `UPSTASH_REDIS_REST_URL`/`TOKEN`) so it doesn't collide with RentRange's existing Redis config in the same Vercel project — but points at the SAME physical Upstash DB the Render backend already uses (Phase 3b), so a checkout completed on Vercel is instantly visible to the backend's gate. New pages `MetaAdsWelcome.jsx` (`/meta-ads/welcome`) and `MetaAdsManage.jsx` (`/meta-ads/manage?token=`); pricing section (Starter/Pro cards) added to `MetaAdsLanding.jsx`/`.css`. Reuses `STRIPE_SECRET_KEY` and `MANAGE_TOKEN_SECRET` already set for RentRange (same Stripe account, generic token helper) — only NEW Vercel env vars needed: `META_ADS_STRIPE_PRICE_STARTER`, `META_ADS_STRIPE_PRICE_PRO`, `META_ADS_STRIPE_WEBHOOK_SECRET`, `META_ADS_UPSTASH_URL`, `META_ADS_UPSTASH_TOKEN`.
  - **3d BUILT 2026-07-05 - metering, NOT deployed.** `server/kv.js`: `PLAN_LIMITS = {starter:10, pro:30}`, `getSubscription(email)` (reads what the Vercel webhook wrote), `getUsage(email, plan)`, `consumeQuota(email, plan)` (atomic `INCR` then compare — can't be double-spent by concurrent requests; ~35-day key expiry, resets on the CALENDAR month not the exact billing date — a deliberate simplicity call, not Stripe-period-synced). Gate in `server/index.js` now resolves 3 plans per request: owner (password) unlimited deep-research; paid (active sub) deep-research metered against quota, 402 with a clear message once exhausted; free (bare email) sonar-pro one-time. `/api/status` now returns an `account` object (`{plan, subPlan, used, limit}` or `{plan:'free', freeRunUsed}`) that the frontend's new `AccountChip` (`Pipeline.jsx` header) renders — plan/usage for paid, "free run available/used" for free, nothing for owner.
  - **KNOWN v1 GAP (accepted, not a blocker):** no transactional email — the manage-billing link only lands in the SAME browser that completed checkout (via localStorage `ma_manage_url`), not emailed. Managing from a different device needs an email-sending integration (Resend/Postmark) as a fast-follow. RentRange has this identical gap today (see its own webhook's `// TODO: send welcome email` comment) — not a regression, a shared scope call.
  - **NEXT to go live:** (1) In Stripe Dashboard — create 2 Products/Prices (Starter £19/mo, Pro £49/mo recurring), copy their Price IDs; add a 2nd webhook endpoint `https://efficiencyworks.io/api/meta-ads-stripe-webhook` (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`), copy its signing secret; confirm Customer Portal is activated (Settings -> Billing). (2) Create a 2nd Upstash Redis DB (or reuse the Phase-3b one — same DB, values are just `META_ADS_UPSTASH_*` pointing at it) and set `META_ADS_UPSTASH_URL`/`TOKEN` in Vercel to match what's already in Render. (3) Set all 5 new env vars in Vercel (site project). (4) Push both repos; build/deploy; test one real Starter checkout end to end.
- **Deploy setup (done):** backend on Render (`meta-ads-backend`, `https://meta-ads-backend-leyp.onrender.com`, always-on, all API keys + Upstash creds set); site on Vercel with `VITE_API_BASE` = that URL. Both repos auto-deploy from `main`. Keys also in this repo's git-ignored `.env` (Jordan's backup).


Direction: fold this tool into the Efficiency Works site as a public, freemium SaaS at `efficiencyworks.io/meta-ads`, reached from a new "Tools" section on the homepage. It stops being a local-only clone-and-run tool. Site = the `pricing-landing-page` project (repo `sbmdjordan/efficiency-works`), a Vite/React SPA on Vercel.

**Per-stage model stack (multi-vendor, decided 2026-07-03):**

| # | Stage | Model |
|---|---|---|
| 1 | Source discovery | Perplexity `sonar` |
| 2 | Research | Perplexity `sonar-deep-research` (drop to `sonar-pro` if cost needs cutting) |
| 3 | Segment structuring | OpenAI GPT-4o |
| 4 | Angles | OpenAI GPT-4o |
| 5 | Headlines | Claude (Sonnet) |

**Backend change this forces:** today only TWO provider slots exist (`research`, `writing`); stages 1/3/4/5 all share the `writing` slot (see `server/providers.js` STAGE_DEFAULTS + every endpoint calling `stage:'writing'`). To run this mixed stack, split the writing stage into per-stage provider overrides so each step can use a different vendor.

**Cost per run:** ~$1.00 with deep-research (~$0.60 with sonar-pro). Perplexity deep-research reasoning tokens are the swing factor and unpredictable; budget up to ~$1.50 on deep topics. Research ≈ 60% of the run cost.

**Freemium model (proposed 2026-07-03, pending final sign-off):**
- Free: 1 run, EMAIL REQUIRED (abuse cap + doubles as lead capture; anonymous = uncapped cost).
- Trial on signup: 3 runs to sample quality.
- Starter £19/mo = 10 runs. Pro £49/mo = 30 runs. HARD CAP per tier so a user can't cost more than they pay. Margins ~55% at $1/run, ~85% on cheaper config.

**Build implications:**
- Frontend: copy tool `src/` into the site under `src/meta-ads/`, add `<Route path="/meta-ads">`, add `html2canvas` dep, add a Tools section to `src/pages/Umbrella.jsx` (cards: RentRange, Meta Ads Generator, Content Engine "coming soon").
- Backend: do NOT port to Vercel serverless functions. Perplexity deep-research can run several minutes, sometimes >5 min (confirmed by Jordan's own use), which exceeds even Vercel Pro's 300s function ceiling. Instead deploy the existing Express server (`server/index.js`) as-is to an always-on host (Render/Railway), which has no per-request timeout, so deep research runs to completion exactly as it does on Jordan's laptop today. Less work than a functions port, and removes the timeout risk entirely instead of testing against it. Keep `server/llm/*`, `providers.js`, `prompts/*`, `util.js` unchanged.
- Frontend still folds into the site: `/meta-ads` lives in the Vite app (Tools-section card on the homepage) and calls the Express backend on the always-on host (direct URL or a Vercel rewrite), so from the user's view it's all under efficiencyworks.io/meta-ads. Backend-host choice (Render vs Railway) + paid tier to avoid idle cold-starts: decide at build time. Pending Jordan's confirm.
- Add auth + usage metering + Stripe tiers. Reuse RentRange's Stripe + Upstash KV plumbing (same repo).

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
  Stepper.jsx          Shared clickable step-tab bar (STEPS + <Stepper/>) — used by both Pipeline's header and CreativeStudio's header so tabs work from any screen
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
- 2026-07-09 — Stepper tabs made clickable (jump back to any completed step, output preserved). Extracted the inline `Stepper` component + `STEPS` out of `Pipeline.jsx` into its own `Stepper.jsx` so `CreativeStudio.jsx` could reuse it too — the Creatives screen previously had no stepper at all, so "click any tab, any screen" wasn't actually true until it got one. Added a `maxStep` (furthest step reached) tracked via an `advance(n)` wrapper around forward-only transitions; tabs beyond `maxStep` render inert since there's no saved data yet to show. This repo and the deployed copy in `pricing-landing-page/src/meta-ads/` are hand-kept in sync (no build step links them) — every change here needs the identical edit ported there before pushing either.
- 2026-07-09 — `git push` to `sbmdjordan/market-research-to-meta-ads` (and the site repo) fails with "Repository not found" if the `gh`/git credential helper's active account is `jjohnson-oasi` instead of `sbmdjordan` — this is a personal repo. Fix: `gh auth switch -u sbmdjordan` before pushing. Same gotcha as `feedback_gh_auth_active_account` in cross-project memory.
- 2026-07-09 — Source Picker prompt (`server/prompts/sources.js`) rewritten, porting the custom-GPT source-selection logic: minimum covering set (no fixed 10-18 count), market-branched source palette (B2B vs B2C), always-include named competitors + Meta Ad Library/Google Ads Transparency/LinkedIn ads, reality discipline (only name sources confirmed real via web search, describe venue type instead of inventing one), thin-data decomposition for novel/hyper-local products. Why: old prompt forced a fixed count → invented fake sources, and its backpack/physical-product examples biased every product (including B2B) toward Amazon/consumer channels.
- 2026-07-09 — Pipeline state now persists to localStorage (`pipeline-state-v1`) and rehydrates on mount, with a "Start over" button to clear it, so a refresh/tab-close no longer wipes in-progress work or the paid deep-research result. Why: state lived only in React `useState`, so an accidental refresh dumped the user back to step 0 after paying for research. Both `Pipeline.jsx` copies (this repo + `pricing-landing-page/src/meta-ads/`) got the identical edit.
- 2026-07-09 — "fetch failed" on the research step was Node's built-in fetch (undici) 5-minute `headersTimeout`, which `sonar-deep-research` routinely exceeds. The earlier `server.requestTimeout=0` only fixed the INBOUND request; the OUTBOUND call had its own cap. Fix: added `undici` dep + `server/llm/http.js` exporting undici's `fetch` and a shared `Agent` with 20-min header/body timeouts; both callers (`openaiCompatible.js`, `anthropic.js`) pass it as `dispatcher`. NOTE: undici isn't importable as a core module and wasn't a dep — had to `npm i undici` and use ITS `fetch` (passing an external Agent as `dispatcher` to the global fetch risks an instanceof mismatch).
- 2026-07-09 — Discovery (`sonar`) returns malformed JSON ~half the time: sometimes a clean array, sometimes a double-encoded JSON string (`"[\"...\"]"`), sometimes prose with no array. Old code called `extractJson` once → 500 or empty on those runs. Fix in `server/index.js`: `parseSourceArray()` (tolerant — unwraps the double-encoded case) + `discoverSources()` retry loop (up to 4 attempts; discovery is cheap + ~4s). Also sharpened the prompt's final line to forbid double-encoding. Verified 5/5 endpoint calls now return sources (was ~50%).

## Current status
- ✅ Full pipeline built (Milestone 1): research → segments → offer → headlines → creatives, Perplexity + Claude defaults, genericized to one neutral preset, `.env` + `.env.example` + README for sharing.
- ✅ Provider choice built (Milestone 2): per-stage provider/model/key via ⚙ LLMs panel + `.env`; OpenAI/OpenRouter/custom-OpenAI-compatible supported via one generic caller.
- ✅ Research web search across providers: Perplexity (native), OpenAI (search-preview model), OpenRouter (`:online`), Claude (web_search tool) all do real research. Gemini deferred. Custom = soft warning.
- ✅ Onboarding = interactive Tour (spotlight + arrows over the live screen, walks the tabs); "How it works" replays it. Time estimate corrected to "several minutes, often 5–10+".
- ✅ Segments step shows full per-segment breakdown (expandable) + evidence legend; structure prompt extracts all detail; angle/headline count is research-driven (no fixed ~40).
- ✅ Brand editing surfaced at top of Creative Studio sidebar; preset renamed "Your Brand".
- ✅ In-app template builder: "+ Add template from an ad" (vision → editable layout config → saved to library, joins the spread). Needs a vision-capable Writing model (Claude/GPT-4o).
- ✅ Milestone 3 done: pushed to `sbmdjordan/market-research-to-meta-ads` (private). Site copy lives in `pricing-landing-page` → `sbmdjordan/efficiency-works`, deployed live at efficiencyworks.io/meta-ads (see that repo's CLAUDE.md "Current status / next steps").
- ✅ Live AI flow confirmed running end-to-end in production (Phase 3 build), not just locally.
- ✅ 2026-07-09 — Stepper tabs clickable: jump to any completed step (back or forward-to-already-done) from anywhere, including the Creatives screen. Pushed to both repos (commits `2ef2f45` here, `31a3685` in the site repo); Vercel auto-deploys the site on push to `main`.
- ⚠ Pending, uncommitted in both repos: a small `StepSetup.jsx` copy tweak (dropped "and uses paid API credits" from the CTA note) — left out of the 2026-07-09 commit since it wasn't part of that task. Still sitting as an uncommitted local diff; fold it in next time this file is touched, or ask Jordan if it should be committed alone.
- ⚠ Open, unconfirmed: Jordan hit a "fetch failed" error mid-pipeline on the live site (2026-07-09, Sources→Research step). That string is Node's generic failed-outbound-fetch message, not one our code throws — points at the backend's own call to Perplexity/OpenAI/Anthropic dropping mid-request (deep-research runs several minutes; a dropped connection during that idle wait is the leading theory), not a code bug from the recent metering changes. `/api/status` was 200 immediately after. No Render log access to confirm root cause — retry first; if it recurs, get Render dashboard/API access to check server-side logs for the actual `[stage:research]` error.
- ▶ Next (future): more templates from user-supplied reference ads.
