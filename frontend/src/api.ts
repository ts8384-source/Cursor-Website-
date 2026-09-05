/** Same-host `/api` (Vite proxy) or `VITE_API_ORIGIN` when the pad talks to the backend directly. */
const origin = (import.meta.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '')

export function apiUrl(path: string) {
  return `${origin}${path}`
}
