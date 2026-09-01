import { useEffect, useRef, useState } from 'react'
import { getStatusColor, getStatusBg, formatAgo } from '../utils/colors'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUS_COLORS = {
  HEALTHY: '#22c55e',
  WARNING: '#eab308',
  DEGRADED: '#f97316',
  CRITICAL: '#ef4444',
  UNKNOWN: '#6b7280',
}

function createSatelliteIcon(status, L) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.UNKNOWN
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="3" fill="${color}"/>
      <line x1="2" y1="12" x2="10" y2="12" stroke="${color}" stroke-width="1.5"/>
      <line x1="14" y1="12" x2="22" y2="12" stroke="${color}" stroke-width="1.5"/>
      <line x1="12" y1="2" x2="12" y2="10" stroke="${color}" stroke-width="1.5"/>
      <line x1="12" y1="14" x2="12" y2="22" stroke="${color}" stroke-width="1.5"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

function PopupContent({ sat }) {
  const health = sat.health || {}
  const status = health.status || 'UNKNOWN'
  const statusColor = {
    HEALTHY: '#22c55e', WARNING: '#eab308', DEGRADED: '#f97316', CRITICAL: '#ef4444', UNKNOWN: '#6b7280'
  }[status] || '#6b7280'

  const basePath = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/$/, '')

  return `
    <div style="padding:12px 14px;min-width:220px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:13px;font-weight:700;color:#f3f4f6;margin-bottom:4px">${sat.name}</div>
      <div style="font-size:11px;color:#6b7280;font-family:monospace;margin-bottom:8px">NORAD ${sat.noradId} · ${sat.type}</div>
      <div style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.05em;
        background:${statusColor}22;border:1px solid ${statusColor}44;color:${statusColor};margin-bottom:10px">
        ${status}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:11px">
        <div><div style="color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-size:10px">Altitude</div>
        <div style="color:#e5e7eb;font-family:monospace">${Number(sat.altitude).toLocaleString()} km</div></div>
        <div><div style="color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-size:10px">Velocity</div>
        <div style="color:#e5e7eb;font-family:monospace">${Number(sat.velocity).toFixed(2)} km/s</div></div>
        <div><div style="color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-size:10px">Latitude</div>
        <div style="color:#e5e7eb;font-family:monospace">${Number(sat.lat).toFixed(2)}°</div></div>
        <div><div style="color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-size:10px">Longitude</div>
        <div style="color:#e5e7eb;font-family:monospace">${Number(sat.lng).toFixed(2)}°</div></div>
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(75,85,99,0.3);font-size:10px;color:#6b7280">
        Updated ${sat.lastUpdate ? new Date(sat.lastUpdate).toLocaleTimeString() : 'unknown'}
        · <span style="color:#a855f7">DEMO</span>
      </div>
      <a href="${basePath}/satellites/${sat.id}" style="display:block;margin-top:8px;padding:4px 0;text-align:center;
        font-size:11px;font-weight:600;color:#3b82f6;text-decoration:none">View Details →</a>
    </div>
  `
}

export default function SatelliteMap({ satellites, loading }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [selectedSat, setSelectedSat] = useState(null)

  // Initialize Leaflet map
  useEffect(() => {
    if (mapInstanceRef.current) return

    // Leaflet is loaded via CDN in index.html
    const L = window.L
    if (!L) {
      console.error('Leaflet not loaded')
      return
    }

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers
  useEffect(() => {
    const L = window.L
    if (!mapReady || !L || !mapInstanceRef.current) return

    // Remove old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    satellites.forEach(sat => {
      if (sat.lat == null || sat.lng == null) return

      const icon = createSatelliteIcon(sat.health?.status || 'UNKNOWN', L)
      const marker = L.marker([sat.lat, sat.lng], { icon })

      marker.bindPopup(PopupContent({ sat }), {
        maxWidth: 280,
        className: 'spaceguard-popup',
      })

      marker.addTo(mapInstanceRef.current)
      markersRef.current.push(marker)
    })
  }, [satellites, mapReady])

  return (
    <div className="p-4 lg:p-6 space-y-4 h-full flex flex-col">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center">
        <span className="card-title">Live Satellite Positions</span>
        <div className="flex gap-3">
          {Object.entries(STATUS_COLORS).filter(([k]) => k !== 'UNKNOWN').map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs text-gray-400">{status}</span>
            </div>
          ))}
        </div>
        <span className="demo-badge ml-auto">DEMO POSITIONS</span>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-96 bg-gray-900 rounded-xl overflow-hidden border border-gray-700/50">
        <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1 }} />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
            <LoadingSpinner message="Loading satellite positions..." />
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span>{satellites.length} satellites tracked</span>
        {Object.entries(STATUS_COLORS).filter(([k]) => k !== 'UNKNOWN').map(([status, color]) => {
          const count = satellites.filter(s => s.health?.status === status).length
          if (count === 0) return null
          return <span key={status} style={{ color }}>{count} {status.toLowerCase()}</span>
        })}
      </div>
    </div>
  )
}
