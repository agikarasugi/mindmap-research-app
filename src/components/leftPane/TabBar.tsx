import type { TabDescriptor } from '../../types/tabs'

interface Props {
  tabs: TabDescriptor[]
  activeTabId: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

export function TabBar({ tabs, activeTabId, onSelect, onClose }: Props) {
  return (
    <div className="flex shrink-0 overflow-x-auto border-b border-neutral-700 bg-neutral-800">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex cursor-pointer select-none items-center gap-1.5 border-r border-neutral-700 px-3 py-2 text-xs ${
              isActive
                ? 'border-b-2 border-b-blue-500 bg-neutral-900 text-neutral-100'
                : 'text-neutral-400 hover:bg-neutral-750 hover:text-neutral-200'
            }`}
          >
            <span className="max-w-[120px] truncate">{tab.label}</span>
            {tab.kind === 'markdown' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(tab.id)
                }}
                className="ml-0.5 rounded px-0.5 text-neutral-500 hover:text-neutral-200"
                aria-label={`Close ${tab.label}`}
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
