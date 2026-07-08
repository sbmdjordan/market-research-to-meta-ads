// Upstash Redis (REST) for the money layer: one-time free-run claims + lead
// capture. Disabled (no-op) when creds are unset, so local dev still boots and
// treats every request as allowed.
import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN
export const kv = url && token ? new Redis({ url, token }) : null
export const kvReady = Boolean(kv)

const norm = (email) => String(email || '').trim().toLowerCase()
const FREE = (email) => `metaads:free:${norm(email)}`
const LEAD = (email) => `metaads:lead:${norm(email)}`
const SUB = (email) => `metaads:sub:${norm(email)}`
const USAGE = (email, ym) => `metaads:usage:${norm(email)}:${ym}`

// Monthly runs included per paid plan. Free plan = 1 run, ever (see claimFreeRun).
export const PLAN_LIMITS = { starter: 10, pro: 30 }

const currentYearMonth = () => new Date().toISOString().slice(0, 7) // 'YYYY-MM'

// Record the email as a lead (first-seen only; NX = don't overwrite).
export async function captureLead(email, meta = {}) {
  if (!kv) return
  try {
    await kv.set(LEAD(email), JSON.stringify({ ...meta, at: new Date().toISOString() }), { nx: true })
  } catch (err) {
    console.error('[kv] captureLead failed:', err.message)
  }
}

// Has this email already used its free run? (Early UX check; the real gate is
// claimFreeRun below, which is atomic.)
export async function freeRunUsed(email) {
  if (!kv) return false
  return Boolean(await kv.get(FREE(email)))
}

// Atomically claim the single free run for this email. Returns true if claimed
// (fresh), false if it was already used. NX makes this race-safe.
export async function claimFreeRun(email) {
  if (!kv) return true // no KV configured (dev) -> allow
  const res = await kv.set(FREE(email), new Date().toISOString(), { nx: true })
  return res === 'OK'
}

// Look up an active paid subscription for this email. Written by the site's
// Stripe webhook (pricing-landing-page/api/meta-ads-stripe-webhook.js) into
// the SAME Upstash database (shared via matching UPSTASH_* env vars on both
// Render and Vercel), so a checkout completed on the site is immediately
// visible here. Returns null if there's no subscription or it isn't active.
export async function getSubscription(email) {
  if (!kv) return null
  const raw = await kv.get(SUB(email))
  const sub = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!sub || sub.status !== 'active' || !PLAN_LIMITS[sub.plan]) return null
  return sub
}

// This month's usage for a paid subscriber -> { used, limit }.
export async function getUsage(email, plan) {
  const limit = PLAN_LIMITS[plan] || 0
  if (!kv) return { used: 0, limit }
  const used = Number((await kv.get(USAGE(email, currentYearMonth()))) || 0)
  return { used, limit }
}

// Atomically consume one run of this month's quota. INCR is atomic, so
// concurrent requests can't double-spend the same slot. Sets a ~35-day expiry
// on first use each month so old counters don't linger. Returns
// { allowed, used, limit } — allowed is false once used > limit (the request
// that pushed it over is the one that's blocked; nothing already run is undone).
export async function consumeQuota(email, plan) {
  const limit = PLAN_LIMITS[plan] || 0
  if (!kv) return { allowed: true, used: 0, limit }
  const key = USAGE(email, currentYearMonth())
  const used = await kv.incr(key)
  if (used === 1) await kv.expire(key, 60 * 60 * 24 * 35)
  return { allowed: used <= limit, used, limit }
}
