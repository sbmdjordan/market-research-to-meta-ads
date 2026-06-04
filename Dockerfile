# Deterministic build for Railway/any container host. Pins Node 22 (Vite 8
# needs 20.19+), installs from the lockfile, builds the frontend, then runs the
# Express server which serves dist/ + the API on $PORT.
FROM node:22-slim

WORKDIR /app

# Install deps first (better layer caching). Use `npm install` rather than
# `npm ci` — the container's npm (10.x with Node 22) is stricter about the
# lockfile than newer npm, and `npm install` reconciles instead of hard-failing.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Build the frontend.
COPY . .
RUN npm run build

# Railway provides PORT at runtime; the server reads process.env.PORT.
EXPOSE 8787
CMD ["npm", "start"]
