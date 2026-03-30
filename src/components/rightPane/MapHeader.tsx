import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import type { ExportFormat } from '../../lib/exporter'
import type { FontSize, NodePadding, NodeSpacing } from '../../types/settings'

interface Props {
  onExport: (format: ExportFormat) => void
  onFitView: () => void
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded border border-neutral-600 overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-2.5 py-1 text-xs transition-colors ${
            i > 0 ? 'border-l border-neutral-600' : ''
          } ${
            value === opt.value
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function MapHeader({ onExport, onFitView }: Props) {
  const [exportOpen, setExportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  const mapSettings = useAppStore((s) => s.mapSettings)
  const setMapSettings = useAppStore((s) => s.setMapSettings)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex shrink-0 items-center border-b border-neutral-700 bg-neutral-800 px-4 py-2 gap-2">
      <span className="flex-1 text-xs font-medium text-neutral-400">Mind Map</span>

      {/* Fit view button */}
      <button
        onClick={onFitView}
        title="Fit view (Ctrl+Shift+F)"
        className="flex items-center gap-1.5 rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600"
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

      {/* Display settings popover */}
      <div ref={settingsRef} className="relative">
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          title="Display settings"
          className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
            settingsOpen
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17 2.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5ZM17 14.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5ZM3.75 14a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75ZM4.5 5.25a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5ZM10 11a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 10 11ZM10.75 2.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5ZM6.25 8a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.5 5a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM15.25 11a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
          </svg>
          Display
        </button>

        {settingsOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded border border-neutral-700 bg-neutral-800 p-4 shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                  Text size
                </label>
                <SegmentedControl<FontSize>
                  value={mapSettings.fontSize}
                  options={[
                    { value: 'sm', label: 'Small' },
                    { value: 'base', label: 'Normal' },
                    { value: 'lg', label: 'Large' },
                  ]}
                  onChange={(v) => setMapSettings({ fontSize: v })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                  Node padding
                </label>
                <SegmentedControl<NodePadding>
                  value={mapSettings.padding}
                  options={[
                    { value: 'compact', label: 'Compact' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'relaxed', label: 'Relaxed' },
                  ]}
                  onChange={(v) => setMapSettings({ padding: v })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                  Node spacing
                </label>
                <SegmentedControl<NodeSpacing>
                  value={mapSettings.spacing}
                  options={[
                    { value: 'compact', label: 'Compact' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'relaxed', label: 'Relaxed' },
                  ]}
                  onChange={(v) => setMapSettings({ spacing: v })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export dropdown */}
      <div ref={exportRef} className="relative">
        <button
          onClick={() => setExportOpen((o) => !o)}
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

        {exportOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded border border-neutral-700 bg-neutral-800 shadow-lg">
            {(['png', 'jpg', 'svg'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  setExportOpen(false)
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
