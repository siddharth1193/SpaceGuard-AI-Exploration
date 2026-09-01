# SpaceGuard AI — Architecture

## System Context

SpaceGuard AI is a two-tier web application:

1. **Frontend** — React SPA deployed to **GitHub Pages**
2. **Backend** — Node.js/Express API server deployed to **Render**

The frontend communicates with the backend via REST API and WebSocket (Socket.IO).
The backend connects to Google Gemini API for AI features.

```mermaid
graph TB
    subgraph "Browser"
        FE["React SPA<br/>Vite + Tailwind"]
    end
    
    subgraph "Render Backend Server"
        API["Express REST API"]
        WS["Socket.IO Server"]
        HS["HealthService"]
        AS["AnomalyService"]
        ALS["AlertService"]
        AIS["AIService (Gemini)"]
        SWS["SpaceWeatherService"]
        SS["SatelliteService"]
        DD["Demo Data"]
    end
    
    subgraph "External Services"
        NOAA["NOAA SWPC API"]
        GEMINI["Google Gemini API"]
    end
    
    FE -->|"HTTPS REST"| API
    FE <-->|"WebSocket"| WS
    API --> SS
    API --> HS
    API --> AS
    API --> ALS
    API --> AIS
    API --> SWS
    SS --> DD
    SS --> HS
    SWS --> NOAA
    AIS --> GEMINI
```

## AI Architecture (Google Gemini)

- **Flow**: `React Frontend → SpaceGuard Backend (Node.js) → Google Gemini API`
- **Security**: `GEMINI_API_KEY` is kept strictly server-side in Node.js backend environment variables (`.env`). It is NEVER exposed to the client bundle or `VITE_` variables.
- **Provider**: Official `@google/genai` JavaScript SDK.
- **Models**: Configurable via `GEMINI_MODEL` (default: `gemini-2.5-flash`).
- **Resilience**: Timeout handling (15s), sanitized log masking for API keys, rate-limit & error handling, fallback to local deterministic telemetry analysis if `GEMINI_API_KEY` is missing or un-contactable.

## Deployment Architecture

```mermaid
graph TB
    subgraph "GitHub Pages (Static)"
        FE["Frontend SPA<br/>Base: /SpaceGuard-AI-Exploration/"]
    end
    
    subgraph "Render (Node.js Web Service)"
        BE["Express + Socket.IO Backend<br/>PORT: process.env.PORT"]
    end
    
    subgraph "External APIs"
        NOAA["NOAA SWPC"]
        GEMINI["Google Gemini API"]
    end
    
    User -->|"HTTPS"| FE
    FE -->|"HTTPS REST (VITE_API_URL)"| BE
    FE <-->|"WSS (VITE_SOCKET_URL)"| BE
    BE -->|"HTTPS"| NOAA
    BE -->|"HTTPS (GEMINI_API_KEY)"| GEMINI
```
