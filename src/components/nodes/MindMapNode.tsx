import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { CollapseButton } from './CollapseButton'
import { useAppStore } from '../../store/appStore'
import type { MindMapNodeData } from '../../types/graph'

function DocIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  )
}

function shapeStyle(shape?: 'rectangle' | 'pill' | 'diamond'): React.CSSProperties {
  if (shape === 'pill') return { borderRadius: '9999px' }
  if (shape === 'diamond') return { transform: 'rotate(45deg)' }
  return { borderRadius: '8px' }
}

function labelStyle(shape?: 'rectangle' | 'pill' | 'diamond'): React.CSSProperties {
  if (shape === 'diamond') return { transform: 'rotate(-45deg)' }
  return {}
}

export const MindMapNode = memo(function MindMapNode({
  id,
  data,
}: NodeProps & { data: MindMapNodeData }) {
  const openMarkdownTab = useAppStore((s) => s.openMarkdownTab)

  const bg = data.nodeStyle?.color ?? '#334155' // slate-700 fallback
  const shape = data.nodeStyle?.shape

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-neutral-500" />

      <div
        className="relative flex min-w-[140px] max-w-[200px] items-center justify-center px-3 py-2 text-sm font-medium text-white shadow-md"
        style={{ backgroundColor: bg, ...shapeStyle(shape) }}
      >
        {/* Document icon — top-right */}
        {data.link && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              openMarkdownTab(data.link!)
            }}
            title="Open linked document"
            className="absolute right-1 top-1 rounded p-0.5 text-white/60 hover:text-white"
          >
            <DocIcon />
          </button>
        )}

        {/* Label */}
        <span
          className="line-clamp-2 text-center leading-snug"
          style={labelStyle(shape)}
        >
          {data.label}
        </span>

        {/* Collapse badge — bottom-right */}
        {data.hasChildren && (
          <div className="absolute -bottom-2.5 right-1">
            <CollapseButton nodeId={id} isCollapsed={data.isCollapsed} />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-neutral-500" />
    </>
  )
})
