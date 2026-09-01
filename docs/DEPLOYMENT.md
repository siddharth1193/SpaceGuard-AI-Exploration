# SpaceGuard AI — Deployment Guide

## Production Target Architecture

| Component | Host / Platform | URL / Endpoint |
|-----------|-----------------|----------------|
| **Frontend** | **GitHub Pages** | `https://<GITHUB_USER>.github.io/SpaceGuard-AI-Exploration/` |
| **Backend** | **Render** | `<RENDER_BACKEND_URL>` (e.g. `https://spaceguard-api.onrender.com`) |

---

## 1. Backend Deployment (Render)

### Step 1: Create Web Service on Render
1. Sign in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your repository (`SpaceGuard-AI-Exploration`).

### Step 2: Configure Render Settings
- **Name**: `spaceguard-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Region**: Choose closest to target users (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health-check`

### Step 3: Set Render Environment Variables
In the **Environment** section of your Render Web Service, configure:

| Key | Recommended Value | Secret / Required |
|-----|-------------------|-------------------|
| `PORT` | Auto-set by Render (default 10000) | Automatic |
| `CORS_ORIGIN` | `https://<GITHUB_USER>.github.io` | Required in prod |
| `GEMINI_API_KEY` | Your Google Gemini API Key | **SECRET / Required for AI** |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Optional |

---

## 2. Frontend Deployment (GitHub Pages)

### Step 1: Configure Repository Variables on GitHub
1. Go to repository → **Settings** → **Secrets and variables** → **Actions** → **Variables** tab.
2. Add the following repository variables:
   - `VITE_API_URL` = `<RENDER_BACKEND_URL>` (e.g., `https://spaceguard-api.onrender.com`)
   - `VITE_SOCKET_URL` = `<RENDER_BACKEND_URL>` (e.g., `https://spaceguard-api.onrender.com`)

### Step 2: Enable GitHub Actions Deployment
1. Go to repository → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.

### Step 3: Trigger Workflow
Push a commit to `main` or trigger manually from **Actions** → **Deploy Frontend to GitHub Pages**.

---

## SPA Routing on GitHub Pages

GitHub Pages does not support SPA client-side routing out-of-the-box. SpaceGuard AI uses:
1. `public/404.html` — intercepts 404s and redirects to `index.html?/<path>`
2. `App.jsx` — parses query string redirect on startup to restore client-side React Router state seamlessly.

---

## Verification & Health Check

After deployment:
```bash
# Check Render backend health
curl https://<RENDER_BACKEND_URL>/api/health-check

# Test satellite API endpoint
curl https://<RENDER_BACKEND_URL>/api/satellites
```
