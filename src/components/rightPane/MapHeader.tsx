import { useState, useRef, useEffect } from 'react'
import type { ExportFormat } from '../../lib/exporter'

interface Props {
  onExport: (format: ExportFormat) => void
  onFitView: () => void
}

export function MapHeader({ onExport, onFitView }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex shrink-0 items-center border-b border-neutral-700 bg-neutral-800 px-4 py-2">
      <span className="flex-1 text-xs font-medium text-neutral-400">Mind Map</span>

      {/* Fit view button */}
      <button
        onClick={onFitView}
        title="Fit view (Ctrl+Shift+F)"
        className="flex items-center gap-1.5 rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600 mr-2"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.28 2.22a.75.75 0 0 0-1.06 1.06L5.44 6.5H3.75a.75.75 0 0 0 0 1.5H7.5A.75.75 0 0 0 8.25 7.25V3.5a.75.75 0 0 0-1.5 0v1.69L3.28 2.22ZM13.5 3.5a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V5.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06l3.22-3.22H14.25a.75.75 0 0 1-.75-.75ZM3.75 13a.75.75 0 0 0 0 1.5h1.69l-3.22 3.22a.75.75 0 1 0 1.06 1.06L6.5 15.56v1.69a.75.75 0 0 0 1.5 0V13.5A.75.75 0 0 0 7.25 12.75H3.75ZM12.78 14.5l3.22 3.22a.75.75 0 1 0 1.06-1.06L13.84 13.5l1.91-.01a.75.75 0 0 0-.01-1.5l-3.75.01a.75.75 0 0 0-.74.75v3.75a.75.75 0 0 0 1.5 0V14.5Z"
            clipRule="evenodd"
          />
        </svg>
        Fit
      </button>

      {/* Export dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded bg-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-600"
        >
          Export
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded border border-neutral-700 bg-neutral-800 shadow-lg">
            {(['png', 'jpg', 'svg'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  setOpen(false)
                  onExport(fmt)
                }}
                className="block w-full px-4 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-700"
              >
                Export as {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
