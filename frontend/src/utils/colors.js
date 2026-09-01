export function getStatusColor(status) {
  switch (status) {
    case 'HEALTHY': return 'text-green-400'
    case 'WARNING': return 'text-yellow-400'
    case 'DEGRADED': return 'text-orange-400'
    case 'CRITICAL': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function getStatusBg(status) {
  switch (status) {
    case 'HEALTHY': return 'bg-green-500/15 border-green-500/25 text-green-400'
    case 'WARNING': return 'bg-yellow-500/15 border-yellow-500/25 text-yellow-400'
    case 'DEGRADED': return 'bg-orange-500/15 border-orange-500/25 text-orange-400'
    case 'CRITICAL': return 'bg-red-500/15 border-red-500/25 text-red-400'
    default: return 'bg-gray-500/15 border-gray-500/25 text-gray-400'
  }
}

export function getRiskColor(risk) {
  switch (risk) {
    case 'LOW': return 'text-green-400'
    case 'MEDIUM': return 'text-yellow-400'
    case 'HIGH': return 'text-orange-400'
    case 'CRITICAL': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function getAlertLevelColor(level) {
  switch (level) {
    case 'GREEN': return 'text-green-400'
    case 'YELLOW': return 'text-yellow-400'
    case 'ORANGE': return 'text-orange-400'
    case 'RED': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function getAlertLevelBg(level) {
  switch (level) {
    case 'GREEN': return 'bg-green-500/10 border-green-500/20 text-green-400'
    case 'YELLOW': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    case 'ORANGE': return 'bg-orange-500/10 border-orange-500/20 text-orange-400'
    case 'RED': return 'bg-red-500/10 border-red-500/20 text-red-400'
    default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
  }
}

export function getSeverityColor(severity) {
  switch (severity) {
    case 'LOW': return 'text-blue-400'
    case 'MEDIUM': return 'text-yellow-400'
    case 'HIGH': return 'text-orange-400'
    case 'CRITICAL': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function getSeverityBg(severity) {
  switch (severity) {
    case 'LOW': return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    case 'MEDIUM': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    case 'HIGH': return 'bg-orange-500/10 border-orange-500/20 text-orange-400'
    case 'CRITICAL': return 'bg-red-500/10 border-red-500/20 text-red-400'
    default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
  }
}

export function formatAgo(dateStr) {
  if (!dateStr) return 'Unknown'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatNumber(n, decimals = 2) {
  if (n == null) return 'N/A'
  return Number(n).toFixed(decimals)
}
