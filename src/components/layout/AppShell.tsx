import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { SplitPane } from './SplitPane'
import { FileNavigator } from './FileNavigator'
import { LeftPane } from '../leftPane/LeftPane'
import { RightPane } from '../rightPane/RightPane'
import { HelpModal } from '../common/HelpModal'

function SunIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.061l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.061ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.061 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06L5.404 4.343a.75.75 0 1 0-1.06 1.061l1.06 1.06Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
    </svg>
  )
}

export function AppShell() {
  const openProject = useAppStore((s) => s.openProject)
  const projectRoot = useAppStore((s) => s.projectRoot)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
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
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="rounded bg-neutral-700 px-2 py-1 text-neutral-300 hover:bg-neutral-600"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
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
