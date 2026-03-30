import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

// Prevent the WebView from treating Ctrl/Cmd+S as "save page", which would
// reload the window and reset all app state. Monaco's own addCommand handler
// is unaffected because it listens on the editor element, not the document.
document.addEventListener(
  'keydown',
  (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
    }
  },
  { capture: true },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
