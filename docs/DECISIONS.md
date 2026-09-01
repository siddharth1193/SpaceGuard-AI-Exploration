# SpaceGuard AI — Architecture Decisions

## ADR-001: Monorepo Without Workspace

**Decision:** Keep `frontend/` and `backend/` as independent packages (not a pnpm/npm workspace).

**Rationale:** The frontend deploys to GitHub Pages and the backend to a separate host. A workspace adds complexity without benefit when packages don't share dependencies or build steps.

---

## ADR-002: In-Memory Demo Data

**Decision:** Use static demo satellite data in `demoSatellites.js` rather than a database.

**Rationale:** The platform is designed to work without any external dependencies. Demo data demonstrates all functionality including anomaly detection (CubeSat Demo-1/2 trigger warnings and critical states). A database can be added later without changing the service layer interface.

---

## ADR-003: Environment Variables for Production URLs

**Decision:** Use `VITE_API_URL`, `VITE_SOCKET_URL`, and `VITE_BASE_PATH` rather than hardcoded URLs.

**Rationale:** GitHub Pages serves static files — the frontend cannot use a Vite proxy in production. Environment variables allow the same build to work in any environment by configuring at build time.

---

## ADR-004: Leaflet via CDN

**Decision:** Load Leaflet CSS from unpkg CDN in `index.html` rather than bundling via npm.

**Rationale:** Leaflet's CSS includes image references that are complex to handle in Vite bundling. CDN loading is simpler and leverages browser caching.

---

## ADR-005: Local AI Fallback

**Decision:** Implement a deterministic local text engine that generates coherent responses without IBM watsonx.

**Rationale:** The platform must be fully functional without API keys. The fallback uses template-based generation with real satellite data, clearly labeled as `LOCAL_FALLBACK` so operators know it's not AI-generated.

---

## ADR-006: Socket.IO Broadcast Model

**Decision:** Server pushes satellite updates every 30 seconds to all connected clients. Clients do not request specific data via Socket.IO.

**Rationale:** All clients need the same fleet-wide data. A broadcast model is simpler than request-response over WebSocket and reduces server-side complexity.

---

## ADR-007: Health Computed on Request

**Decision:** Health assessments are computed fresh on every API request rather than stored.

**Rationale:** Health depends on data age (time since `lastUpdate`), which changes every second. Computing on request ensures freshness. With only 12 satellites, the computation cost is negligible.
