# Deterministic build for Railway/any container host. Pins Node 22 (Vite 8
# needs 20.19+), installs from the lockfile, builds the frontend, then runs the
# Express server which serves dist/ + the API on $PORT.
FROM node:22-slim

WORKDIR /app

# Install deps from the lockfile first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Build the frontend.
COPY . .
RUN npm run build

# Railway provides PORT at runtime; the server reads process.env.PORT.
EXPOSE 8787
CMD ["npm", "start"]
