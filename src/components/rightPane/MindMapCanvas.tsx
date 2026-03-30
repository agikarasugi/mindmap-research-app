import { type MutableRefObject, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
  type NodeTypes,
} from '@xyflow/react'
import { useAppStore } from '../../store/appStore'
import { MindMapNode } from '../nodes/MindMapNode'
import { exportViewportToDataUrl, boundsToImageSize, type ExportFormat } from '../../lib/exporter'

const nodeTypes: NodeTypes = {
  mindmap: MindMapNode as never,
}

interface Props {
  fitViewRef: MutableRefObject<(() => void) | null>
  exportFnRef: MutableRefObject<((format: ExportFormat) => Promise<string>) | null>
}

// Must live inside <ReactFlow> to access useReactFlow()
function InternalRegistrar({
  fitViewRef,
  exportFnRef,
  theme,
}: {
  fitViewRef: MutableRefObject<(() => void) | null>
  exportFnRef: MutableRefObject<((format: ExportFormat) => Promise<string>) | null>
  theme: 'dark' | 'light'
}) {
  const { fitView, getNodes } = useReactFlow()
  const themeRef = useRef(theme)
  useEffect(() => { themeRef.current = theme }, [theme])

  useEffect(() => {
    fitViewRef.current = () => fitView({ padding: 0.15, duration: 300 })

    exportFnRef.current = async (format: ExportFormat) => {
      const nodes = getNodes()
      if (nodes.length === 0) throw new Error('No nodes to export')

      const bounds = getNodesBounds(nodes)
      const { width, height } = boundsToImageSize(bounds)
      const rfViewport = getViewportForBounds(bounds, width, height, 0.1, 4, 48)

      const vpEl = document.querySelector<HTMLElement>('.react-flow__viewport')
      if (!vpEl) throw new Error('React Flow viewport element not found')

      const bg = themeRef.current === 'dark' ? '#0f172a' : '#f8fafc'
      return exportViewportToDataUrl(vpEl, format, width, height, rfViewport, bg)
    }

    return () => {
      fitViewRef.current = null
      exportFnRef.current = null
    }
  }, [fitView, getNodes, fitViewRef, exportFnRef])

  return null
}

export function MindMapCanvas({ fitViewRef, exportFnRef }: Props) {
  const visibleNodes = useAppStore((s) => s.visibleNodes)
  const visibleEdges = useAppStore((s) => s.visibleEdges)
  const projectRoot = useAppStore((s) => s.projectRoot)
  const theme = useAppStore((s) => s.theme)

  const isEmpty = visibleNodes.length === 0

  return (
    <div className="h-full w-full bg-neutral-950">
      {isEmpty && !projectRoot ? (
        <div className="flex h-full items-center justify-center text-sm text-neutral-600">
          Open a project to see the map
        </div>
      ) : isEmpty ? (
        <div className="flex h-full items-center justify-center text-sm text-neutral-600">
          No nodes — edit map.yaml and click Render
        </div>
      ) : (
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          colorMode={theme}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
        >
          <InternalRegistrar fitViewRef={fitViewRef} exportFnRef={exportFnRef} theme={theme} />
          <Background color={theme === 'dark' ? '#334155' : '#cbd5e1'} gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const data = n.data as { nodeStyle?: { color?: string } }
              return data.nodeStyle?.color ?? '#334155'
            }}
          />
        </ReactFlow>
      )}
    </div>
  )
}
