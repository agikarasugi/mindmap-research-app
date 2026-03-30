import { useState, useRef, useEffect } from 'react'
import type { ExportFormat } from '../../lib/exporter'

interface Props {
  onExport: (format: ExportFormat) => void
}

export function MapHeader({ onExport }: Props) {
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
