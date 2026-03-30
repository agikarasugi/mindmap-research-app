import { useAppStore } from './store/appStore'
import { AppShell } from './components/layout/AppShell'
import { OpenFolderPrompt } from './components/common/OpenFolderPrompt'

export function App() {
  const projectRoot = useAppStore((s) => s.projectRoot)

  if (!projectRoot) {
    return <OpenFolderPrompt />
  }

  return <AppShell />
}
