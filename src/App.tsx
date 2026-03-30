import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { AppShell } from './components/layout/AppShell'
import { OpenFolderPrompt } from './components/common/OpenFolderPrompt'

export function App() {
  const projectRoot = useAppStore((s) => s.projectRoot)
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  if (!projectRoot) {
    return <OpenFolderPrompt />
  }

  return <AppShell />
}
