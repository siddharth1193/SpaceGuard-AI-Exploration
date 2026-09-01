# SpaceGuard AI — API Reference

Base URL: `http://localhost:3001` (development) or `<RENDER_BACKEND_URL>` (production).

All endpoints return JSON with the structure:
```json
{
  "success": true|false,
  "data": { ... },
  "meta": { "source": "DEMO|NOAA|GEMINI|LOCAL_FALLBACK", "timestamp": "ISO-8601" }
}
```

Rate limit: **120 requests per minute per IP** on all `/api` routes.

---

## GET /

Root health check.

**Response:**
```json
{
  "service": "SpaceGuard AI Backend",
  "version": "1.0.0",
  "status": "operational",
  "timestamp": "2026-09-01T00:00:00.000Z"
}
```

---

## GET /api/health-check

Server health check (distinct from satellite health).

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "timestamp": "2026-09-01T00:00:00.000Z"
}
```

---

## GET /api/satellites

Returns all satellites enriched with health assessments.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sat-25544",
      "name": "ISS (ZARYA)",
      "noradId": 25544,
      "lat": 51.6,
      "lng": -120.3,
      "altitude": 408,
      "velocity": 7.66,
      "orbitalPeriod": 92.68,
      "inclination": 51.64,
      "lastUpdate": "2026-09-01T00:00:00.000Z",
      "dataSource": "DEMO",
      "type": "LEO",
      "description": "International Space Station",
      "health": {
        "satelliteId": "sat-25544",
        "status": "HEALTHY",
        "riskLevel": "LOW",
        "issues": [],
        "explanation": "ISS (ZARYA) is operating within all nominal parameters...",
        "recommendedAction": "No action required. Continue routine monitoring."
      }
    }
  ],
  "meta": { "source": "DEMO", "timestamp": "..." }
}
```

---

## GET /api/satellites/:id

Returns a single satellite with health, anomalies, AI analysis, and weather context.

---

## GET /api/health

Returns health summary across all monitored satellites.

---

## GET /api/anomalies

Returns all detected anomalies.

Query params: `severity` (LOW, MEDIUM, HIGH, CRITICAL), `type` (STALE_DATA, etc.)

---

## GET /api/alerts

Returns all active alerts sorted by severity (CRITICAL first).

---

## GET /api/space-weather

Returns current space weather conditions from NOAA SWPC (or DEMO fallback).

---

## POST /api/ai/analyze

Run AI analysis for a specific satellite powered by Google Gemini (or local fallback if GEMINI_API_KEY is not set).

**Request Body:**
```json
{ "satelliteId": "sat-25544" }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "satelliteId": "sat-25544",
    "analysis": "ISS (ZARYA) is currently healthy at 408 km altitude...",
    "primaryRisk": "No issues detected",
    "recommendedAction": "No action required. Continue routine monitoring.",
    "source": "GEMINI",
    "generatedAt": "2026-09-01T00:00:00.000Z"
  }
}
```

---

## POST /api/ai/chat

AI assistant conversational endpoint powered by Google Gemini.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Which satellites require immediate attention?" }
  ],
  "includeContext": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "I currently detect active anomalies across the constellation...",
    "source": "GEMINI",
    "generatedAt": "2026-09-01T00:00:00.000Z"
  }
}
```

---

## Socket.IO Events

**Connection:** `io('ws://localhost:3001')` or `io('<RENDER_BACKEND_URL>')`

### Server → Client

| Event | Payload | Frequency |
|-------|---------|-----------|
| `satellite:update` | `{ satellites: [...], weather: {...}, anomalyCount: N, timestamp: "..." }` | Every 30 seconds |
