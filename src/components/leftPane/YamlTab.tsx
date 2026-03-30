import { useRef, useCallback } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as MonacoType from 'monaco-editor'
import { useAppStore } from '../../store/appStore'
import { ErrorBanner } from '../common/ErrorBanner'

export function YamlTab() {
  const rawYaml = useAppStore((s) => s.rawYaml)
  const yamlError = useAppStore((s) => s.yamlError)
  const mapYamlPath = useAppStore((s) => s.mapYamlPath)
  const updateRawYaml = useAppStore((s) => s.updateRawYaml)
  const renderMap = useAppStore((s) => s.renderMap)
  const saveFile = useAppStore((s) => s.saveFile)
  const theme = useAppStore((s) => s.theme)

  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor

      // Ctrl+S / Cmd+S → save
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        if (mapYamlPath) {
          saveFile(mapYamlPath, editor.getValue())
        }
      })
    },
    [mapYamlPath, saveFile],
  )

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-700 bg-neutral-800 px-3 py-1.5">
        <span className="flex-1 text-xs text-neutral-400">map.yaml</span>
        <button
          onClick={renderMap}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 active:bg-blue-700"
        >
          Render
        </button>
      </div>

      <ErrorBanner message={yamlError} />

      {/* Monaco editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="yaml"
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          value={rawYaml}
          onChange={(v) => updateRawYaml(v ?? '')}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
