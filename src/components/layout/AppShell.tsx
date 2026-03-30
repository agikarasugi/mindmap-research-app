import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { SplitPane } from './SplitPane'
import { FileNavigator } from './FileNavigator'
import { LeftPane } from '../leftPane/LeftPane'
import { RightPane } from '../rightPane/RightPane'
import { HelpModal } from '../common/HelpModal'

export function AppShell() {
  const openProject = useAppStore((s) => s.openProject)
  const projectRoot = useAppStore((s) => s.projectRoot)
  const [helpOpen, setHelpOpen] = useState(false)

  const folderName = projectRoot
    ? projectRoot.replace(/\\/g, '/').split('/').pop() ?? projectRoot
    : null

  return (
    <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
      {/* Title bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-neutral-700 bg-neutral-800 px-4 py-2">
        <span className="text-sm font-semibold tracking-wide text-neutral-200">
          Mind Map{folderName ? ` — ${folderName}` : ''}
        </span>
        <div className="flex-1" />
        <button
          onClick={openProject}
          className="rounded bg-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-600"
        >
          Open Folder…
        </button>
        <button
          onClick={() => setHelpOpen(true)}
          title="Help / Reference"
          className="rounded bg-neutral-700 px-2 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-600"
        >
          ?
        </button>
      </header>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

      {/* Main content: Navigator | Editor | Map */}
      <div className="flex flex-1 overflow-hidden">
        <FileNavigator />
        <div className="flex-1 overflow-hidden">
          <SplitPane left={<LeftPane />} right={<RightPane />} />
        </div>
      </div>
    </div>
  )
}
