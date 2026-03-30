import { useAppStore } from '../../store/appStore'

interface Props {
  nodeId: string
  isCollapsed: boolean
}

export function CollapseButton({ nodeId, isCollapsed }: Props) {
  const toggleCollapse = useAppStore((s) => s.toggleCollapse)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleCollapse(nodeId)
      }}
      title={isCollapsed ? 'Expand children' : 'Collapse children'}
      className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-500 bg-neutral-700 text-xs text-neutral-200 shadow hover:bg-neutral-500"
    >
      {isCollapsed ? '+' : '−'}
    </button>
  )
}
