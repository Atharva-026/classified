const DEFAULT_API_URL = "http://localhost:3001"

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "")
}

export function apiUrl(path) {
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
}
