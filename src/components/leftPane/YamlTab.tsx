import { useRef, useCallback, useEffect, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as MonacoType from 'monaco-editor'
import { useAppStore } from '../../store/appStore'
import { ErrorBanner } from '../common/ErrorBanner'

type SaveStatus = 'saved' | 'unsaved' | 'saving'

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-400">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
        Saving…
      </span>
    )
  }
  if (status === 'unsaved') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
        Unsaved
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-500">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-500" />
      Saved
    </span>
  )
}

const AUTOSAVE_DELAY = 1500 // ms

export function YamlTab() {
  const rawYaml = useAppStore((s) => s.rawYaml)
  const yamlError = useAppStore((s) => s.yamlError)
  const mapYamlPath = useAppStore((s) => s.mapYamlPath)
  const updateRawYaml = useAppStore((s) => s.updateRawYaml)
  const renderMap = useAppStore((s) => s.renderMap)
  const saveFile = useAppStore((s) => s.saveFile)
  const theme = useAppStore((s) => s.theme)
  const setTabDirty = useAppStore((s) => s.setTabDirty)

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use refs so callbacks always see fresh values without stale closures
  const mapYamlPathRef = useRef(mapYamlPath)
  useEffect(() => { mapYamlPathRef.current = mapYamlPath }, [mapYamlPath])

  // When the active map file switches, reset dirty/save status
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setSaveStatus('saved')
    setTabDirty('yaml', false)
  }, [mapYamlPath, setTabDirty])

  const doSave = useCallback(async (andRender = false) => {
    const path = mapYamlPathRef.current
    const content = editorRef.current?.getValue() ?? rawYaml
    if (!path) return
    if (autosaveTimer.current) { clearTimeout(autosaveTimer.current); autosaveTimer.current = null }
    setSaveStatus('saving')
    try {
      await saveFile(path, content)
      if (andRender) renderMap()
      setSaveStatus('saved')
      setTabDirty('yaml', false)
    } catch {
      setSaveStatus('unsaved')
    }
  }, [rawYaml, saveFile, renderMap, setTabDirty])

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        doSave(true)
      })
    },
    [doSave],
  )

  const handleChange = useCallback((v: string | undefined) => {
    const content = v ?? ''
    updateRawYaml(content)
    setSaveStatus('unsaved')
    setTabDirty('yaml', true)

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => doSave(true), AUTOSAVE_DELAY)
  }, [updateRawYaml, setTabDirty, doSave])

  // Flush autosave on unmount
  useEffect(() => () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-700 bg-neutral-800 px-3 py-1.5">
        <SaveIndicator status={saveStatus} />
        <div className="flex-1" />
        <button
          onClick={() => doSave(false)}
          disabled={saveStatus === 'saved'}
          className="rounded bg-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-600 disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => doSave(true)}
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
          onChange={handleChange}
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
