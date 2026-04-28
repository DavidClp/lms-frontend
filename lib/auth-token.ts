/**
 * Verifica expiração do JWT (claim `exp`). Tokens que não são JWT (ex.: mock)
 * não são tratados como expirados aqui.
 */
export function isAccessTokenExpired(token: string | null): boolean {
  if (!token) return true
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = decodeJwtPayloadSegment(parts[1])
    if (!payload || typeof payload.exp !== 'number') return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

function decodeJwtPayloadSegment(segment: string): { exp?: number } | null {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const json = atob(padded)
  return JSON.parse(json) as { exp?: number }
}
