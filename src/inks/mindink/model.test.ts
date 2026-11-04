import { describe, expect, it } from 'vitest'
import { arrange, type Mindmap, position, removeElement, size } from './model'

const map: Mindmap = {
  id: 'test',
  title: 'Test',
  layout: 'free',
  nodes: [
    { id: 'a', shape: 'box', text: '', x: 12, y: 20 },
    { id: 'b', shape: 'circle', text: 'B', x: 330, y: 20 },
    { id: 'c', shape: 'box', text: 'C', x: 400, y: 500 },
  ],
  edges: [
    {
      id: 'ab',
      source: { kind: 'node', id: 'a' },
      target: { kind: 'node', id: 'b' },
    },
    {
      id: 'branch',
      source: { kind: 'edge', id: 'ab' },
      target: { kind: 'node', id: 'c' },
    },
  ],
}
describe('Mindmap graph', () => {
  it('anchors branches at an arrow midpoint and follows moved nodes', () => {
    const first = position({ kind: 'edge', id: 'ab' }, map)
    const moved = {
      ...map,
      nodes: map.nodes.map((n) => (n.id === 'a' ? { ...n, x: n.x + 100 } : n)),
    }
    expect(position({ kind: 'edge', id: 'ab' }, moved).x).toBe(first.x + 50)
  })
  it('removes dependent arrows recursively', () => {
    expect(removeElement(map, { kind: 'node', id: 'a' }).edges).toEqual([])
    expect(removeElement(map, { kind: 'edge', id: 'ab' }).nodes).toHaveLength(3)
  })
  it('orders a tree by connections and handles graph cycles', () => {
    const tree = arrange(map, 'tree')
    expect(tree.nodes.find((n) => n.id === 'b')?.x).toBeGreaterThan(
      tree.nodes.find((n) => n.id === 'a')?.x ?? 0,
    )
    const cyclic = {
      ...map,
      edges: [
        ...map.edges,
        {
          id: 'ba',
          source: { kind: 'node' as const, id: 'b' },
          target: { kind: 'node' as const, id: 'a' },
        },
      ],
    }
    expect(arrange(cyclic, 'tree').nodes).toHaveLength(3)
  })
  it('restores manual coordinates after a persisted automatic layout', () => {
    const automatic = JSON.parse(
      JSON.stringify(arrange(map, 'tree')),
    ) as Mindmap
    expect(arrange(automatic, 'free').nodes).toEqual(map.nodes)
  })
  it('grows with text and stacks mobile nodes without overlap', () => {
    const tall = {
      ...map,
      nodes: map.nodes.map((n) => ({
        ...n,
        text: 'Long thought\n'.repeat(30),
      })),
    }
    const mobile = arrange(tall, 'mobile')
    mobile.nodes.slice(1).forEach((node, i) => {
      expect(node.y).toBeGreaterThan(
        mobile.nodes[i].y + size(mobile.nodes[i]).height,
      )
    })
    expect(size(tall.nodes[0]).height).toBeGreaterThan(600)
  })
})
