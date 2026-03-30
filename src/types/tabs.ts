export interface YamlTab {
  kind: 'yaml'
  id: 'yaml'
  label: 'map.yaml'
  filePath: string
}

export interface MarkdownTab {
  kind: 'markdown'
  id: string
  label: string
  filePath: string
  viewMode: 'source' | 'preview'
}

export type TabDescriptor = YamlTab | MarkdownTab
