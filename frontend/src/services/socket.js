import { io } from 'socket.io-client'

// In development, Vite proxy handles /socket.io → localhost:3001
// In production, VITE_SOCKET_URL must point to the deployed backend
function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }
  // In dev mode, connect to the local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3001'
  }
  // Fallback: try same origin (won't work on GitHub Pages without backend)
  return window.location.origin
}

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      // In production on static hosting, Socket.IO may not be available
      // so we set a short timeout to avoid long connection hangs
      timeout: 5000,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
