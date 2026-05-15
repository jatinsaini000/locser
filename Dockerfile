# -------------------------------
# Multi‑stage Dockerfile
# -------------------------------
# 1️⃣ Build stage – compile the React/Vite front‑end
FROM node:20 AS builder
WORKDIR /app

# Copy only front‑end package manifests first (caches layer)
COPY website/package*.json ./website/
RUN cd website && npm ci --omit=dev --ignore-optional

# Copy pre‑built UI assets (must exist locally as website/dist)
COPY website/dist ./website/dist

# 2️⃣ Runtime stage – run the Express API and serve the built UI
FROM node:20-slim AS runtime
WORKDIR /app

# Install production deps for the backend only
COPY backend/package*.json ./
RUN npm ci --omit=dev --ignore-optional

# Copy backend source files
COPY backend/ ./

# Copy the compiled front‑end from the builder stage
COPY --from=builder /app/website/dist ./website/dist

# Expose the API port (default 3000 in server.js)
EXPOSE 3000

# Default command – start the API server (which now also serves the UI)
CMD ["node", "server.js"]
