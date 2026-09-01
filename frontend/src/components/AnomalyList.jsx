import { getStatusBg, getSeverityBg, formatAgo } from '../utils/colors'

export default function AnomalyList({ anomalies, maxItems }) {
  const items = maxItems ? anomalies.slice(0, maxItems) : anomalies

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-2xl mb-2">✓</div>
        <div className="text-sm">No anomalies detected</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((anomaly) => (
        <div
          key={anomaly.id}
          className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`status-badge flex-none ${getSeverityBg(anomaly.severity)}`}>
                {anomaly.severity}
              </span>
              <span className="text-xs text-gray-300 font-medium truncate">
                {anomaly.satelliteName}
              </span>
            </div>
            <span className="text-xs text-gray-500 flex-none">
              {formatAgo(anomaly.detectedAt)}
            </span>
          </div>
          <div className="text-xs font-medium text-gray-200 mb-1">{anomaly.condition}</div>
          <div className="text-xs text-gray-400 line-clamp-2">{anomaly.explanation}</div>
          {anomaly.recommendedAction && (
            <div className="mt-1.5 text-xs text-blue-400">
              → {anomaly.recommendedAction}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
