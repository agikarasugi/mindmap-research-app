import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

// Block WebView-level keyboard shortcuts that interfere with the app.
// Using capture:true so these fire before any element handler.
document.addEventListener(
  'keydown',
  (e) => {
    if (!(e.ctrlKey || e.metaKey)) return
    // Ctrl+S → would reload the page ("save page")
    // Ctrl+=/+/-/0 → would zoom the entire WebView chrome
    if (e.key === 's' || e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0') {
      e.preventDefault()
    }
  },
  { capture: true },
)

// Prevent pinch-to-zoom (trackpad) from zooming the whole UI.
// Browsers report pinch as a wheel event with ctrlKey=true.
// React Flow is unaffected: it reads the wheel delta itself and applies its
// own CSS transform — calling preventDefault() here doesn't stop that.
document.addEventListener(
  'wheel',
  (e) => {
    if (e.ctrlKey) e.preventDefault()
  },
  { passive: false, capture: true },
)

// Belt-and-suspenders for Safari/WebKit: gesture events are a separate API.
document.addEventListener('gesturestart', (e) => e.preventDefault(), { capture: true })
document.addEventListener('gesturechange', (e) => e.preventDefault(), { capture: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
