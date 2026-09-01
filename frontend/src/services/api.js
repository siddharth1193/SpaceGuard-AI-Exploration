import axios from 'axios'

// In development, Vite proxy handles /api → localhost:3001
// In production, VITE_API_URL must point to the deployed backend
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

export async function fetchSatellites() {
  const { data } = await api.get('/satellites')
  return data
}

export async function fetchSatellite(id) {
  const { data } = await api.get(`/satellites/${id}`)
  return data
}

export async function fetchHealth() {
  const { data } = await api.get('/health')
  return data
}

export async function fetchAnomalies(params = {}) {
  const { data } = await api.get('/anomalies', { params })
  return data
}

export async function fetchAlerts(params = {}) {
  const { data } = await api.get('/alerts', { params })
  return data
}

export async function fetchSpaceWeather() {
  const { data } = await api.get('/space-weather')
  return data
}

export async function analyzeWithAI(satelliteId) {
  const { data } = await api.post('/ai/analyze', { satelliteId })
  return data
}

export async function chatWithAI(messages, includeContext = true) {
  const { data } = await api.post('/ai/chat', { messages, includeContext })
  return data
}
