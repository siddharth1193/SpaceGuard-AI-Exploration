# SpaceGuard AI — Roadmap

## Current State (v1.1.0)

- ✅ 12-satellite fleet monitoring with 5-factor health evaluation
- ✅ 5-rule anomaly detection with severity classification
- ✅ NOAA SWPC live space weather with demo fallback
- ✅ IBM Granite AI integration with local fallback
- ✅ Conversational AI assistant
- ✅ Interactive satellite map (Leaflet)
- ✅ Analytics dashboard (Chart.js)
- ✅ Real-time Socket.IO updates
- ✅ GitHub Pages deployment pipeline
- ✅ Backend test suite
- ✅ Complete engineering documentation

## Near-Term (v1.2)

- [ ] Live TLE integration from CelesTrak for real satellite positions
- [ ] SGP4 orbital propagation for position prediction
- [ ] Historical telemetry snapshots (in-memory or SQLite)
- [ ] Frontend unit tests with Vitest
- [ ] E2E smoke tests with Playwright

## Mid-Term (v1.3)

- [ ] Multi-satellite comparison view
- [ ] Alert notification channels (email, Slack webhook)
- [ ] Conjunction/close-approach analysis
- [ ] Dashboard customization (widget layout)
- [ ] Export data as CSV/JSON

## Long-Term (v2.0)

- [ ] Multi-user authentication and roles
- [ ] Persistent database (PostgreSQL + TimescaleDB for time-series)
- [ ] Maneuver planning assistant
- [ ] Mobile companion app
- [ ] Custom satellite fleet configuration
- [ ] Integration with commercial satellite APIs (Planet, Spire, etc.)

## Explicitly Out of Scope

- Real satellite command & control
- Regulatory compliance features
- Multi-tenant SaaS architecture
- On-premises deployment
