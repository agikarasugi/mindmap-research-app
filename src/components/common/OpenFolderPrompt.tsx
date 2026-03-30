import { useAppStore } from '../../store/appStore'

export function OpenFolderPrompt() {
  const openProject = useAppStore((s) => s.openProject)

  return (
    <div className="flex h-full items-center justify-center bg-neutral-900">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800 p-10 shadow-2xl">
        <svg
          className="h-16 w-16 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9A2.25 2.25 0 0 0 19.5 6.75h-9.69Z"
          />
        </svg>
        <h1 className="text-xl font-semibold text-neutral-100">Open a Project Folder</h1>
        <p className="max-w-xs text-center text-sm text-neutral-400">
          Select any folder. Existing{' '}
          <code className="font-mono text-neutral-300">.yaml</code> files become mind maps.
          A starter <code className="font-mono text-neutral-300">map.yaml</code> is created
          automatically if the folder is empty.
        </p>
        <button
          onClick={openProject}
          className="mt-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-500 active:bg-blue-700"
        >
          Open Folder…
        </button>
      </div>
    </div>
  )
}
