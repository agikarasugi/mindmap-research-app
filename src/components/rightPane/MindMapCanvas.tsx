import { type RefObject } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from '@xyflow/react'
import { useAppStore } from '../../store/appStore'
import { MindMapNode } from '../nodes/MindMapNode'

const nodeTypes: NodeTypes = {
  mindmap: MindMapNode as never,
}

interface Props {
  exportRef: RefObject<HTMLDivElement | null>
}

export function MindMapCanvas({ exportRef }: Props) {
  const visibleNodes = useAppStore((s) => s.visibleNodes)
  const visibleEdges = useAppStore((s) => s.visibleEdges)
  const projectRoot = useAppStore((s) => s.projectRoot)

  const isEmpty = visibleNodes.length === 0

  return (
    <div ref={exportRef as RefObject<HTMLDivElement>} className="h-full w-full bg-neutral-950">
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
          nodesDraggable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={20} />
          <Controls className="!bg-neutral-800 !border-neutral-700" />
          <MiniMap
            nodeColor={(n) => {
              const data = n.data as { nodeStyle?: { color?: string } }
              return data.nodeStyle?.color ?? '#334155'
            }}
            className="!bg-neutral-800 !border-neutral-700"
          />
        </ReactFlow>
      )}
    </div>
  )
}
