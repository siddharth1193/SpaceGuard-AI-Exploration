import { useState, useEffect, useCallback } from 'react'
import { fetchSatellites, fetchHealth, fetchAnomalies, fetchAlerts, fetchSpaceWeather } from '../services/api'
import { getSocket } from '../services/socket'

export function useSpaceGuardData() {
  const [satellites, setSatellites] = useState([])
  const [healthSummary, setHealthSummary] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [alerts, setAlerts] = useState([])
  const [spaceWeather, setSpaceWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const loadAll = useCallback(async () => {
    try {
      const [satsRes, healthRes, anomRes, alertRes, weatherRes] = await Promise.all([
        fetchSatellites(),
        fetchHealth(),
        fetchAnomalies(),
        fetchAlerts(),
        fetchSpaceWeather(),
      ])
      setSatellites(satsRes.data || [])
      setHealthSummary(healthRes.data || null)
      setAnomalies(anomRes.data || [])
      setAlerts(alertRes.data || [])
      setSpaceWeather(weatherRes.data || null)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()

    const socket = getSocket()
    socket.on('satellite:update', (update) => {
      setSatellites(update.satellites || [])
      setLastUpdate(new Date(update.timestamp))
    })

    return () => {
      socket.off('satellite:update')
    }
  }, [loadAll])

  return {
    satellites,
    healthSummary,
    anomalies,
    alerts,
    spaceWeather,
    loading,
    error,
    lastUpdate,
    refresh: loadAll,
  }
}
