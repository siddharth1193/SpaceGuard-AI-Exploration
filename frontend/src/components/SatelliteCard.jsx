import { getStatusBg, getRiskColor } from '../utils/colors'
import { formatAgo } from '../utils/colors'
import { Link } from 'react-router-dom'

export default function SatelliteCard({ satellite }) {
  const health = satellite.health || {}
  const status = health.status || 'UNKNOWN'
  const risk = health.riskLevel || 'UNKNOWN'

  return (
    <Link
      to={`/satellites/${satellite.id}`}
      className="block card hover:border-gray-600/70 hover:bg-gray-800/60 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {satellite.name}
          </div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">
            NORAD {satellite.noradId} · {satellite.type}
          </div>
        </div>
        <span className={`status-badge flex-none ${getStatusBg(status)}`}>
          {status}
        </span>
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <div>
          <div className="data-label">Latitude</div>
          <div className="data-value">{Number(satellite.lat).toFixed(2)}°</div>
        </div>
        <div>
          <div className="data-label">Longitude</div>
          <div className="data-value">{Number(satellite.lng).toFixed(2)}°</div>
        </div>
        <div>
          <div className="data-label">Altitude</div>
          <div className="data-value">{Number(satellite.altitude).toLocaleString()} km</div>
        </div>
        <div>
          <div className="data-label">Velocity</div>
          <div className="data-value">{Number(satellite.velocity).toFixed(2)} km/s</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Updated {formatAgo(satellite.lastUpdate)}
        </div>
        <div className={`text-xs font-semibold ${getRiskColor(risk)}`}>
          {risk} RISK
        </div>
      </div>

      {/* Issues */}
      {health.issues && health.issues.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="text-xs text-gray-400 line-clamp-2">
            ⚠ {health.issues[0]}
          </div>
        </div>
      )}
    </Link>
  )
}
