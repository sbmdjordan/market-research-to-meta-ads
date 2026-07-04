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
