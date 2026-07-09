// Shared HTTP transport for the LLM callers.
//
// Node's built-in fetch (undici) caps a request at a 5-minute headers timeout.
// Perplexity `sonar-deep-research` (and Claude web-search research) routinely
// run LONGER than 5 minutes, so the stock fetch aborts mid-research with a
// generic "fetch failed". We route both callers through undici's own fetch with
// a dispatcher whose header/body timeouts are raised to 20 minutes. (0 would
// disable them entirely, but a high bound still fails a genuinely hung
// connection instead of hanging forever.)
import { fetch, Agent } from 'undici'

const LONG_CALL_MS = 20 * 60 * 1000
export const longCallAgent = new Agent({
  headersTimeout: LONG_CALL_MS,
  bodyTimeout: LONG_CALL_MS,
})

export { fetch }
