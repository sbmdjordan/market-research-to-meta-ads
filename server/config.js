// Server config. Provider keys/models now live in providers.js; this just
// holds the port.

import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT) || 8787,
}
