import { useAppStore } from '../../store/appStore'
import { TabBar } from './TabBar'
import { YamlTab } from './YamlTab'
import { MarkdownTab } from './MarkdownTab'
import type { MarkdownTab as MarkdownTabType } from '../../types/tabs'

export function LeftPane() {
  const tabs = useAppStore((s) => s.tabs)
  const activeTabId = useAppStore((s) => s.activeTabId)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const closeTab = useAppStore((s) => s.closeTab)

  if (tabs.length === 0) {
    return <div className="h-full bg-neutral-900" />
  }

  return (
    <div className="flex h-full flex-col bg-neutral-900">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelect={setActiveTab}
        onClose={closeTab}
      />

      {/* Render all tabs but hide inactive ones to preserve editor state */}
      <div className="relative flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
          >
            {tab.kind === 'yaml' ? (
              <YamlTab />
            ) : (
              <MarkdownTab tab={tab as MarkdownTabType} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
