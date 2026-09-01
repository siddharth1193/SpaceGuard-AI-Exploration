import { getAlertLevelBg, formatAgo } from '../utils/colors'

export default function SpaceWeatherCard({ weather }) {
  if (!weather) return (
    <div className="card animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-32 mb-3" />
      <div className="h-8 bg-gray-700 rounded w-16" />
    </div>
  )

  const levelBg = getAlertLevelBg(weather.alertLevel)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Space Weather</span>
        <span className={`status-badge ${levelBg}`}>
          {weather.alertLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Metric label="Kp Index" value={weather.kpIndex?.toFixed(1)} />
        <Metric label="Solar Wind" value={`${weather.solarWindSpeed} km/s`} />
        <Metric label="SW Density" value={`${weather.solarWindDensity?.toFixed(1)} p/cm³`} />
        <Metric label="Geo. Storm" value={weather.geomagneticStorm ? 'ACTIVE' : 'None'} valueClass={weather.geomagneticStorm ? 'text-red-400' : 'text-green-400'} />
      </div>

      {weather.xrayFlux && (
        <div className="data-row">
          <span className="data-label">X-Ray Flux</span>
          <span className="data-value">{weather.xrayFlux?.toExponential(2)} W/m²</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">Updated {formatAgo(weather.lastUpdate)}</span>
        <span className={`text-xs font-mono ${weather.source === 'NOAA' ? 'text-green-400' : 'text-purple-400'}`}>
          {weather.source}
        </span>
      </div>
    </div>
  )
}

function Metric({ label, value, valueClass = 'text-white' }) {
  return (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold font-mono mt-0.5 ${valueClass}`}>{value ?? 'N/A'}</div>
    </div>
  )
}
