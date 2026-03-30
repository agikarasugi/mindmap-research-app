import { useRef, useCallback, useEffect, type MutableRefObject } from 'react'
import { save } from '@tauri-apps/plugin-dialog'
import { MapHeader } from './MapHeader'
import { MindMapCanvas } from './MindMapCanvas'
import { exportToDataUrl, type ExportFormat } from '../../lib/exporter'
import { useAppStore } from '../../store/appStore'

export function RightPane() {
  const exportRef = useRef<HTMLDivElement>(null)
  const fitViewRef = useRef<(() => void) | null>(null) as MutableRefObject<(() => void) | null>
  const saveBinaryFile = useAppStore((s) => s.saveBinaryFile)
  const saveFile = useAppStore((s) => s.saveFile)

  const handleFitView = useCallback(() => {
    fitViewRef.current?.()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        handleFitView()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleFitView])

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!exportRef.current) return

      const filterMap: Record<ExportFormat, { name: string; extensions: string[] }> = {
        png: { name: 'PNG Image', extensions: ['png'] },
        jpg: { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
        svg: { name: 'SVG Image', extensions: ['svg'] },
      }

      const savePath = await save({
        defaultPath: `mind-map.${format}`,
        filters: [filterMap[format]],
      })
      if (!savePath) return

      try {
        const dataUrl = await exportToDataUrl(exportRef.current, format)

        if (format === 'svg') {
          // SVG data URL: strip the prefix and decode
          const svgContent = decodeURIComponent(dataUrl.split(',')[1] ?? '')
          await saveFile(savePath, svgContent)
        } else {
          // PNG/JPG: decode base64 to binary
          const base64 = dataUrl.split(',')[1] ?? ''
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
          await saveBinaryFile(savePath, bytes)
        }
      } catch (err) {
        console.error('Export failed:', err)
      }
    },
    [saveBinaryFile, saveFile],
  )

  return (
    <div className="flex h-full flex-col">
      <MapHeader onExport={handleExport} onFitView={handleFitView} />
      <div className="flex-1 overflow-hidden">
        <MindMapCanvas exportRef={exportRef} fitViewRef={fitViewRef} />
      </div>
    </div>
  )
}
