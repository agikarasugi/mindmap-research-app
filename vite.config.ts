import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Tauri expects a fixed port
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Prevent Vite from watching the src-tauri directory
      ignored: ['**/src-tauri/**'],
    },
  },

  // Produce ES module output compatible with Tauri's WebView
  build: {
    target: 'esnext',
  },

  // Env variables starting with VITE_ are exposed to frontend;
  // TAURI_* variables are also needed
  envPrefix: ['VITE_', 'TAURI_'],
})
