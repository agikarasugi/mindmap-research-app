import { useRef, useState, useCallback, type ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
  defaultSplit?: number // 0–1, fraction for left pane width
}

export function SplitPane({ left, right, defaultSplit = 0.4 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [split, setSplit] = useState(defaultSplit)
  const dragging = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newSplit = Math.min(0.85, Math.max(0.15, (e.clientX - rect.left) / rect.width))
    setSplit(newSplit)
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragging.current = false
  }, [])

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left pane */}
      <div style={{ width: `${split * 100}%` }} className="min-w-0 overflow-hidden">
        {left}
      </div>

      {/* Divider */}
      <div
        className="w-1 shrink-0 cursor-col-resize bg-neutral-700 hover:bg-blue-500 active:bg-blue-400"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />

      {/* Right pane */}
      <div style={{ width: `${(1 - split) * 100}%` }} className="min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  )
}
