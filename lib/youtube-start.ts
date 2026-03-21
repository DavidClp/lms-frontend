/** Interpreta token do YouTube: "83", "1m23s", "1h2m3s", "1:23", "1:02:03". */
export function parseYouTubeTimeToken(token: string): number | undefined {
  const s = token.trim()
  if (!s) return undefined
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10)
    return Number.isFinite(n) && n >= 0 ? n : undefined
  }
  let total = 0
  const h = s.match(/(\d+)\s*h/i)
  const m = s.match(/(\d+)\s*m/i)
  const sec = s.match(/(\d+)\s*s/i)
  if (h) total += parseInt(h[1], 10) * 3600
  if (m) total += parseInt(m[1], 10) * 60
  if (sec) total += parseInt(sec[1], 10)
  if (h || m || sec) return total
  if (s.includes(':')) {
    const parts = s.split(':').map((p) => parseInt(p.trim(), 10))
    if (parts.some((n) => Number.isNaN(n))) return undefined
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return undefined
}

/** Lê parâmetros t= / start= na URL do YouTube. */
export function parseYouTubeTimeFromUrl(videoUrl: string): number | undefined {
  if (!videoUrl || typeof videoUrl !== 'string') return undefined
  try {
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      const u = new URL(videoUrl)
      const t = u.searchParams.get('t') ?? u.searchParams.get('start')
      if (t != null && t !== '') {
        const parsed = parseYouTubeTimeToken(t)
        if (parsed !== undefined) return parsed
      }
    }
  } catch {
    /* segue para regex */
  }
  const qs = videoUrl.match(/[?&#](?:t|start)=([^&]+)/)
  if (qs) {
    const parsed = parseYouTubeTimeToken(decodeURIComponent(qs[1].replace(/\+/g, ' ')))
    if (parsed !== undefined) return parsed
  }
  return undefined
}

export function parseTimeInputToSeconds(input: string): number | undefined {
  const t = input.trim()
  if (!t) return undefined
  return parseYouTubeTimeToken(t)
}

/**
 * Tempo de início em segundos: `startSeconds` explícito no bloco tem prioridade;
 * senão usa t=/start= na URL; senão 0.
 */
export function getYouTubeStartSeconds(url: string, explicit?: number): number {
  if (typeof explicit === 'number' && !Number.isNaN(explicit) && explicit >= 0) {
    return Math.floor(explicit)
  }
  return parseYouTubeTimeFromUrl(url) ?? 0
}

export function formatSecondsAsMmSs(total: number): string {
  const s = Math.max(0, Math.floor(total))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
