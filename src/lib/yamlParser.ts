import jsYaml from 'js-yaml'
import type { YamlNode } from '../types/yaml'

export function parseYaml(raw: string): YamlNode[] {
  const parsed = jsYaml.load(raw)
  if (!Array.isArray(parsed)) {
    throw new Error('map.yaml root must be a YAML list (sequence)')
  }
  return parsed as YamlNode[]
}
