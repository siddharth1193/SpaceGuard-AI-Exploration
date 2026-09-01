# SpaceGuard AI — Security Architecture & Audit

## Security Boundaries & Design

1. **Server-Side API Key Storage**:
   - `GEMINI_API_KEY` is stored strictly in server-side environment variables on the Node.js backend (or Render dashboard).
   - `GEMINI_API_KEY` is NEVER exposed to client-side code, `VITE_` build variables, or Git repositories.
   - All AI interactions pass through: `Frontend → SpaceGuard Backend → Google Gemini API`.

2. **Log Masking & Error Sanitization**:
   - The backend service (`aiService.js`) sanitizes error logs to ensure `GEMINI_API_KEY` is never printed to logs or stdout.
   - Stack traces and raw internal error objects are masked before sending responses to clients.

3. **CORS & WebSocket Protection**:
   - Express REST API and Socket.IO use explicit CORS origins configured via `CORS_ORIGIN`.
   - In production, CORS is restricted to the exact GitHub Pages domain (`https://<user>.github.io`).

4. **Rate Limiting & Defensive Middleware**:
   - `express-rate-limit` enforces 120 requests/minute per IP on `/api` routes.
   - Security headers enforced via custom middleware: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`.

5. **Repository Cleanliness**:
   - Secrets (`.env`, `.env.local`) are excluded in `.gitignore`.
   - No sensitive tokens exist in tracked Git files or documentation.
