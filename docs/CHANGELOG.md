# SpaceGuard AI — Changelog

## [1.2.0] — 2026-09-01

### Added
- Integrated official Google Gemini JavaScript SDK (`@google/genai`).
- Added support for `GEMINI_API_KEY` and `GEMINI_MODEL` (`gemini-2.5-flash`).
- Created unit tests for `aiService` (`backend/tests/aiService.test.js`).
- Render + GitHub Pages production deployment configuration documentation.

### Changed
- Replaced IBM watsonx.ai integration with Google Gemini across `/api/ai/analyze` and `/api/ai/chat`.
- Updated `backend/.env.example` and root `.env.example` to reference `GEMINI_API_KEY` and `GEMINI_MODEL`.
- Enhanced `server.js` startup logging to display Gemini configuration status.
- Updated documentation suite (`API.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `ENVIRONMENT.md`, `SECURITY.md`, `MEMORY.md`, `CHANGELOG.md`, `README.md`).

### Removed
- Removed IBM watsonx integration and obsolete dependencies.

---

## [1.1.0] — 2026-08-31

### Security
- Fixed leaked API key in `backend/.env.example`.
- Added HTTP security headers.

### Added
- `ErrorBoundary` component.
- Graceful shutdown handler.
- `/api/health-check` server health route.
- GitHub Actions CI & GitHub Pages deployment workflows.
- Backend unit test suite with 30 passing tests.
