# -------------------------------
# Multi-stage Dockerfile
# -------------------------------

# 1. Build stage - compile the React/Vite front-end
FROM node:20 AS builder
WORKDIR /app

# Copy website package files and install ALL deps (including devDeps like vite)
COPY website/package*.json ./website/
RUN cd website && npm install

# Copy website source and build
COPY website/ ./website/
RUN cd website && npm run build

# 2. Runtime stage - run the Express API and serve the built UI
FROM node:20-slim AS runtime
WORKDIR /app

# Install production deps for the backend only
COPY backend/package*.json ./
RUN npm ci --omit=dev --ignore-optional

# Copy backend source files
COPY backend/ ./

# Copy the compiled front-end from the builder stage
# (server.js is configured to serve from ./website/dist)
COPY --from=builder /app/website/dist ./website/dist

# Expose the API port
EXPOSE 3000

# Start the API server
CMD ["node", "server.js"]
