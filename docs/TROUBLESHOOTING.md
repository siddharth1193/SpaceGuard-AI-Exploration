# SpaceGuard AI — Troubleshooting

## Blank Screen / White Page

**Symptom:** App loads but shows a blank white screen.

**Diagnostic:** Open browser DevTools → Console tab. Look for red error messages.

| Root Cause | Fix |
|-----------|-----|
| React render error (uncaught exception) | Check component for null/undefined data access. ErrorBoundary should now catch this. |
| Wrong base path (GitHub Pages) | Verify `VITE_BASE_PATH` matches your repo name. Check that assets load (Network tab → 404s). |
| Missing CSS (Tailwind not built) | Run `pnpm run build` and check that `dist/assets/` contains `.css` files. |

---

## "Loading…" Spinner Never Stops

**Symptom:** The loading spinner displays indefinitely.

**Diagnostic:** Check Network tab for failed API requests.

| Root Cause | Fix |
|-----------|-----|
| Backend not running | Start backend: `cd backend && npm run dev` |
| Wrong API URL in production | Set `VITE_API_URL` to your deployed backend URL |
| CORS error | Check browser console for CORS errors. Set `CORS_ORIGIN` on backend. |
| Network/firewall blocking | Try `curl http://localhost:3001/api/satellites` from terminal |

---

## Socket.IO Connection Error

**Symptom:** Connection status shows "error" or "disconnected" in sidebar.

| Root Cause | Fix |
|-----------|-----|
| Backend not running | Start backend |
| Wrong Socket URL | Set `VITE_SOCKET_URL` environment variable |
| GitHub Pages (no backend) | Expected behavior — Socket.IO requires a running backend |
| Proxy not configured (dev) | Check `vite.config.js` has `/socket.io` proxy entry |

---

## API Returns 429 (Too Many Requests)

**Symptom:** API calls fail with rate limit error.

**Fix:** Wait 60 seconds. The limit is 120 requests per minute per IP. If legitimate usage exceeds this, increase `max` in `server.js` rate limiter config.

---

## AI Analysis Shows "LOCAL_FALLBACK"

**Symptom:** AI responses are labeled LOCAL_FALLBACK instead of WATSONX.

**Cause:** watsonx.ai credentials are not configured or are invalid.

**Fix:**
1. Set `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` in `backend/.env`
2. Verify the key is valid: check IBM Cloud console
3. Check backend logs for `[aiService] watsonx call failed` messages

---

## Build Fails: "esbuild not found"

**Symptom:** `pnpm run build` fails with esbuild-related errors.

**Fix:**
```bash
cd frontend
pnpm install  # Ensure esbuild is installed
# If issues persist, delete node_modules and reinstall:
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## GitHub Pages 404 on Direct Navigation

**Symptom:** Navigating directly to `/satellites/sat-25544` returns GitHub's 404 page.

**Fix:** Ensure `public/404.html` exists in the frontend. This file redirects back to `index.html` with the path preserved. The `App.jsx` SPA redirect handler parses it.

---

## Satellite Map Not Rendering

**Symptom:** Map page shows a blank area or console errors about Leaflet.

| Root Cause | Fix |
|-----------|-----|
| Leaflet CSS not loaded | Check that `index.html` has the Leaflet CSS `<link>` tag |
| `window.L` is undefined | Leaflet is loaded via CDN — check network connectivity |
| No satellite data | Verify API is returning satellites with lat/lng values |
