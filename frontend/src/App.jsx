import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { useSpaceGuardData } from './hooks/useSpaceGuardData'
import { getSocket } from './services/socket'

import Overview from './pages/Overview'
import SatelliteExplorer from './pages/SatelliteExplorer'
import SatelliteDetail from './pages/SatelliteDetail'
import SatelliteMap from './pages/SatelliteMap'
import SpaceWeather from './pages/SpaceWeather'
import AnomaliesAlerts from './pages/AnomaliesAlerts'
import AIAssistant from './pages/AIAssistant'
import Analytics from './pages/Analytics'

// GitHub Pages SPA redirect handler — reads redirect path from query string
// set by public/404.html and replaces history state
;(function handleSpaRedirect() {
  const { search } = window.location
  if (search && search.startsWith('?/')) {
    const decoded = search
      .slice(1)
      .split('&')
      .map((s) => s.replace(/~and~/g, '&'))
      .join('?')
    window.history.replaceState(null, '', decoded)
  }
})()

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const {
    satellites,
    healthSummary,
    anomalies,
    alerts,
    spaceWeather,
    loading,
    error,
    lastUpdate,
    refresh,
  } = useSpaceGuardData()

  useEffect(() => {
    const socket = getSocket()
    socket.on('connect', () => setConnectionStatus('connected'))
    socket.on('disconnect', () => setConnectionStatus('disconnected'))
    socket.on('connect_error', () => setConnectionStatus('error'))
    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
    }
  }, [])

  const sharedProps = { satellites, healthSummary, anomalies, alerts, spaceWeather, loading, error, refresh }

  // Use VITE_BASE_PATH for GitHub Pages or '/SpaceGuard-AI-Exploration'
  const basename = (import.meta.env.VITE_BASE_PATH || '/SpaceGuard-AI-Exploration').replace(/\/$/, '')

  return (
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <Layout connectionStatus={connectionStatus}>
          <Routes>
            <Route path="/" element={<Overview {...sharedProps} />} />
            <Route path="/satellites" element={<SatelliteExplorer {...sharedProps} />} />
            <Route path="/satellites/:id" element={<SatelliteDetail />} />
            <Route path="/map" element={<SatelliteMap satellites={satellites} loading={loading} />} />
            <Route path="/space-weather" element={<SpaceWeather />} />
            <Route path="/anomalies" element={<AnomaliesAlerts {...sharedProps} />} />
            <Route path="/assistant" element={
              <AIAssistant satellites={satellites} spaceWeather={spaceWeather} anomalies={anomalies} />
            } />
            <Route path="/analytics" element={
              <Analytics satellites={satellites} anomalies={anomalies} spaceWeather={spaceWeather} loading={loading} />
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
