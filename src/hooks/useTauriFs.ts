import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile, writeFile as writeBinaryFileFs, exists } from '@tauri-apps/plugin-fs'
import { join, resolve, dirname } from '@tauri-apps/api/path'

export function useTauriFs() {
  const openFolderDialog = async (): Promise<string | null> => {
    const selected = await open({ directory: true, multiple: false })
    return typeof selected === 'string' ? selected : null
  }

  const openSaveDialog = async (
    defaultName: string,
    filters: { name: string; extensions: string[] }[],
  ): Promise<string | null> => {
    const path = await save({ defaultPath: defaultName, filters })
    return typeof path === 'string' ? path : null
  }

  const readFile = (path: string): Promise<string> => readTextFile(path)

  const writeFile = (path: string, content: string): Promise<void> =>
    writeTextFile(path, content)

  const writeBinary = (path: string, data: Uint8Array): Promise<void> =>
    writeBinaryFileFs(path, data)

  const fileExists = (path: string): Promise<boolean> => exists(path)

  const joinPath = (...parts: string[]): Promise<string> => join(...parts)

  const resolvePath = (base: string, relative: string): Promise<string> =>
    resolve(base, relative)

  const dirnamePath = (path: string): Promise<string> => dirname(path)

  return {
    openFolderDialog,
    openSaveDialog,
    readFile,
    writeFile,
    writeBinary,
    fileExists,
    joinPath,
    resolvePath,
    dirnamePath,
  }
}
