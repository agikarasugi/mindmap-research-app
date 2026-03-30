import { useRef, useCallback, useEffect, type MutableRefObject } from 'react'
import { save } from '@tauri-apps/plugin-dialog'
import { MapHeader } from './MapHeader'
import { MindMapCanvas } from './MindMapCanvas'
import type { ExportFormat } from '../../lib/exporter'
import { useAppStore } from '../../store/appStore'

export function RightPane() {
  const fitViewRef  = useRef<(() => void) | null>(null) as MutableRefObject<(() => void) | null>
  const exportFnRef = useRef<((format: ExportFormat) => Promise<string>) | null>(null) as MutableRefObject<((format: ExportFormat) => Promise<string>) | null>

  const saveBinaryFile = useAppStore((s) => s.saveBinaryFile)
  const saveFile       = useAppStore((s) => s.saveFile)

  const handleFitView = useCallback(() => { fitViewRef.current?.() }, [])

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
      if (!exportFnRef.current) return

      const filterMap: Record<ExportFormat, { name: string; extensions: string[] }> = {
        png: { name: 'PNG Image',  extensions: ['png'] },
        jpg: { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
        svg: { name: 'SVG Image',  extensions: ['svg'] },
      }

      const savePath = await save({
        defaultPath: `mind-map.${format}`,
        filters: [filterMap[format]],
      })
      if (!savePath) return

      try {
        const dataUrl = await exportFnRef.current(format)

        if (format === 'svg') {
          const svgContent = decodeURIComponent(dataUrl.split(',')[1] ?? '')
          await saveFile(savePath, svgContent)
        } else {
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
        <MindMapCanvas fitViewRef={fitViewRef} exportFnRef={exportFnRef} />
      </div>
    </div>
  )
}
