# SpaceGuard AI — Environment Configuration

## Overview

Configuration is strictly separated by environment. Secrets are ONLY managed on the backend and are NEVER exposed to the frontend bundle.

## Environment Variables Reference

### Backend (`backend/.env` / Render Dashboard)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | Config | No | `3001` | HTTP server port. Auto-set on Render. |
| `CORS_ORIGIN` | Config | Production | `http://localhost:3000` | Allowed CORS origin (`http://localhost:3000` for dev, `https://<user>.github.io` for prod). |
| `GEMINI_API_KEY` | **SECRET** | Optional | — | Google Gemini API key from Google AI Studio. |
| `GEMINI_MODEL` | Config | No | `gemini-2.5-flash` | Gemini model identifier. |

### Frontend (`frontend/.env` / GitHub Actions Variables)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `VITE_API_URL` | Config | Production | `""` (uses proxy) | Base URL for REST API (e.g., `<RENDER_BACKEND_URL>`). |
| `VITE_SOCKET_URL` | Config | Production | `""` (uses proxy) | URL for Socket.IO WebSocket server (e.g., `<RENDER_BACKEND_URL>`). |
| `VITE_BASE_PATH` | Config | GitHub Pages | `/` | Base path for router assets (e.g., `/SpaceGuard-AI-Exploration/`). |

---

## Local Development vs. Production Setup

### Local Development
- Backend uses `backend/.env` or defaults (`PORT=3001`, `CORS_ORIGIN=http://localhost:3000`).
- Frontend uses Vite dev proxy (`/api` → `http://localhost:3001`, `/socket.io` → `http://localhost:3001`).

### Production Setup
- **Render Backend**: `GEMINI_API_KEY`, `CORS_ORIGIN=https://<user>.github.io`.
- **GitHub Pages Frontend**: `VITE_API_URL=<RENDER_BACKEND_URL>`, `VITE_SOCKET_URL=<RENDER_BACKEND_URL>`, `VITE_BASE_PATH=/SpaceGuard-AI-Exploration/`.
