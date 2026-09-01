# SpaceGuard AI — Project Memory

> Durable record of architecture decisions, constraints, environment configuration, and fixes.

## Key Architectural Decisions

1. **Google Gemini Integration**: Replaced watsonx.ai with official Google Gemini JavaScript SDK (`@google/genai`).
2. **Server-Side AI Proxying**: Gemini API key (`GEMINI_API_KEY`) is stored strictly in backend environment variables and is never exposed to the frontend.
3. **Target Production Architecture**:
   - Frontend: GitHub Pages (`/SpaceGuard-AI-Exploration/`)
   - Backend: Render Web Service (`<RENDER_BACKEND_URL>`)
4. **Resilient AI Fallback**: If `GEMINI_API_KEY` is not set or network fails, `aiService` seamlessly falls back to deterministic local domain analysis (`LOCAL_FALLBACK`).
5. **No Persistence Needed**: Fleet status, health evaluations, and anomalies are computed dynamically on each request or Socket.IO 30s broadcast tick.

## Environment Variables

### Backend (`backend/.env`)
- `PORT` (default 3001)
- `CORS_ORIGIN` (default `http://localhost:3000`)
- `GEMINI_API_KEY` (Google AI Studio Key)
- `GEMINI_MODEL` (default `gemini-2.5-flash`)

### Frontend (`frontend/.env` / CI)
- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_BASE_PATH` (e.g. `/SpaceGuard-AI-Exploration/`)

## Previous Fixes & Rebuild History
- Replaced IBM watsonx with Google Gemini (`@google/genai` SDK).
- Hardened CORS, rate limiting, and security headers.
- Implemented SPA 404 redirection for GitHub Pages deep-linking.
- Built automated unit testing suite (34/34 tests passing).
