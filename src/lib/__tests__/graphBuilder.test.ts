import { describe, it, expect } from 'vitest'
import { buildGraph, computeHiddenIds } from '../graphBuilder'
import type { YamlNode } from '../../types/yaml'

const ROOT = '/project'

describe('buildGraph', () => {
  it('single root node → 1 node, 0 edges', () => {
    const nodes: YamlNode[] = [{ title: 'Root' }]
    const result = buildGraph(nodes, ROOT)
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(0)
    expect(result.nodes[0]!.data.label).toBe('Root')
    expect(result.nodes[0]!.data.hasChildren).toBe(false)
  })

  it('root + 2 children → 3 nodes, 2 edges', () => {
    const nodes: YamlNode[] = [
      {
        title: 'Root',
        children: [{ title: 'A' }, { title: 'B' }],
      },
    ]
    const result = buildGraph(nodes, ROOT)
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
    expect(result.nodes[0]!.data.hasChildren).toBe(true)
  })

  it('3-level nesting → correct edge chain', () => {
    const nodes: YamlNode[] = [
      { title: 'L1', children: [{ title: 'L2', children: [{ title: 'L3' }] }] },
    ]
    const result = buildGraph(nodes, ROOT)
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)

    const [l1, l2, l3] = result.nodes.map((n) => n.id)
    expect(result.edges[0]!.source).toBe(l1)
    expect(result.edges[0]!.target).toBe(l2)
    expect(result.edges[1]!.source).toBe(l2)
    expect(result.edges[1]!.target).toBe(l3)
  })

  it('resolves relative link to absolute path', () => {
    const nodes: YamlNode[] = [{ title: 'Root', link: './docs/file.md' }]
    const result = buildGraph(nodes, ROOT)
    expect(result.nodes[0]!.data.link).toBe('/project/docs/file.md')
  })

  it('multiple root nodes are all included', () => {
    const nodes: YamlNode[] = [{ title: 'A' }, { title: 'B' }]
    const result = buildGraph(nodes, ROOT)
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(0)
  })
})

describe('computeHiddenIds', () => {
  it('hides direct children', () => {
    const childMap: Record<string, string[]> = { root: ['a', 'b'] }
    const hidden = computeHiddenIds(new Set(['root']), childMap)
    expect(hidden.has('a')).toBe(true)
    expect(hidden.has('b')).toBe(true)
    expect(hidden.has('root')).toBe(false)
  })

  it('hides all descendants recursively', () => {
    const childMap: Record<string, string[]> = {
      root: ['a'],
      a: ['b'],
      b: ['c'],
    }
    const hidden = computeHiddenIds(new Set(['root']), childMap)
    expect(hidden.size).toBe(3) // a, b, c
  })

  it('returns empty set when nothing collapsed', () => {
    const childMap = { root: ['a'] }
    const hidden = computeHiddenIds(new Set(), childMap)
    expect(hidden.size).toBe(0)
  })
})
