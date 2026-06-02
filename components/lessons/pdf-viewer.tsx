'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Minus, Plus, RotateCcw } from 'lucide-react'

import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export function PdfViewer({
  url,
  mode = 'continuous',
  initialScale = 0.90,
}: {
  url: string
  mode?: 'continuous' | 'paged'
  initialScale?: number
}) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(initialScale)
  const [key, setKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  const canPrev = page > 1
  const canNext = numPages > 0 && page < numPages
  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = Math.floor(el.clientWidth)
      if (w > 0) setContainerWidth(w)
    })
    ro.observe(el)
    const w = Math.floor(el.clientWidth)
    if (w > 0) setContainerWidth(w)
    return () => ro.disconnect()
  }, [])

  const pageWidthPx = containerWidth > 0 ? Math.max(320, Math.floor((containerWidth - 16) * scale)) : undefined

  return (
    <div className="relative">
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col gap-2">
        <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-lg border bg-background/90 p-2 shadow-sm backdrop-blur">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))}
            title="Diminuir zoom"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="min-w-[64px] text-center text-xs text-muted-foreground">
            {Math.round(scale * 100)}%
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setScale((s) => Math.min(2.2, Math.round((s + 0.1) * 10) / 10))}
            title="Aumentar zoom"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setKey((k) => k + 1)}
            title="Recarregar documento"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mode === 'paged' && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground min-w-[110px] text-center">
            Página {page} {numPages ? `de ${numPages}` : ''}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.min(numPages || 1, p + 1))} disabled={!canNext}>
            Próxima
          </Button>
        </div>
      )}

      <div ref={containerRef} className="rounded-lg border bg-card p-2">
        <Document
          key={key}
          file={url}
          onLoadSuccess={(p) => {
            setNumPages(p.numPages)
            setPage((cur) => Math.min(Math.max(1, cur), p.numPages))
          }}
          loading={<div className="p-6 text-sm text-muted-foreground">Carregando PDF…</div>}
          error={<div className="p-6 text-sm text-destructive">Não foi possível carregar o PDF.</div>}
          noData={<div className="p-6 text-sm text-muted-foreground">PDF não informado.</div>}
        >
          {mode === 'continuous'
            ? pages.map((n) => (
                <div key={n} className="py-2 flex justify-center">
                  <Page pageNumber={n} width={pageWidthPx} renderTextLayer renderAnnotationLayer />
                </div>
              ))
            : (
              <div className="py-2 flex justify-center">
                <Page pageNumber={page} width={pageWidthPx} renderTextLayer renderAnnotationLayer />
              </div>
            )}
        </Document>
      </div>
    </div>
  )
}

