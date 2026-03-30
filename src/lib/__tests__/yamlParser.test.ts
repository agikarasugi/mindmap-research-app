import { describe, it, expect } from 'vitest'
import { parseYaml } from '../yamlParser'

describe('parseYaml', () => {
  it('parses a minimal single node', () => {
    const result = parseYaml('- title: Root')
    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Root')
  })

  it('parses nested children', () => {
    const yaml = `
- title: Parent
  children:
    - title: Child A
    - title: Child B
`
    const result = parseYaml(yaml)
    expect(result[0]!.children).toHaveLength(2)
    expect(result[0]!.children![0]!.title).toBe('Child A')
  })

  it('parses optional fields', () => {
    const yaml = `
- title: Node
  content: "some content"
  link: "./docs/file.md"
  style:
    color: "#ff0000"
    shape: pill
`
    const result = parseYaml(yaml)
    const node = result[0]!
    expect(node.content).toBe('some content')
    expect(node.link).toBe('./docs/file.md')
    expect(node.style?.color).toBe('#ff0000')
    expect(node.style?.shape).toBe('pill')
  })

  it('throws when root is not a list', () => {
    expect(() => parseYaml('title: Root')).toThrow()
  })

  it('throws on invalid YAML', () => {
    expect(() => parseYaml('- title: [\nbroken')).toThrow()
  })
})
