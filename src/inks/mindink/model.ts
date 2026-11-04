export type Endpoint = {
  kind: 'node' | 'edge'
  id: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}
export type MapNode = {
  id: string
  shape: 'box' | 'circle'
  text: string
  x: number
  y: number
}
export type MapEdge = {
  id: string
  source: Endpoint
  target: Endpoint
  bend?: { x: number; y: number }
  kind?: 'arrow' | 'line'
  arrowType?: 'end' | 'start' | 'both'
  text?: string
}
export type Layout = 'free' | 'tree' | 'radial' | 'mobile'
export type Mindmap = {
  id: string
  title: string
  layout: Layout
  nodes: MapNode[]
  edges: MapEdge[]
  manualPositions?: { id: string; x: number; y: number }[]
}
export function size(node: MapNode) {
  const height = Math.max(
    node.shape === 'circle' ? 180 : 100,
    60 +
      node.text
        .split('\n')
        .reduce(
          (n, line) =>
            n +
            Math.max(
              1,
              Math.ceil(line.length / (node.shape === 'circle' ? 14 : 23)),
            ),
          0,
        ) *
        24,
  )
  return { width: node.shape === 'circle' ? height : 220, height }
}
export function position(
  end: Endpoint,
  map: Mindmap,
  seen = new Set<string>(),
  cache = new Map<string, { x: number; y: number }>(),
): { x: number; y: number } {
  if (end.kind === 'node') {
    const node = map.nodes.find((n) => n.id === end.id)
    if (!node) return { x: 0, y: 0 }
    const dimensions = size(node)
    return {
      x:
        node.x +
        (end.side === 'left'
          ? 0
          : end.side === 'right'
            ? dimensions.width
            : dimensions.width / 2),
      y:
        node.y +
        (end.side === 'top'
          ? 0
          : end.side === 'bottom'
            ? dimensions.height
            : dimensions.height / 2),
    }
  }
  const cached = cache.get(end.id)
  if (cached) return cached
  const edge = map.edges.find((e) => e.id === end.id)
  if (!edge || seen.has(end.id)) return { x: 0, y: 0 }
  if (edge.bend) return edge.bend
  const next = new Set(seen).add(end.id)
  const a = position(edge.source, map, next, cache),
    b = position(edge.target, map, next, cache)
  const result = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  cache.set(end.id, result)
  return result
}
export function arrange(map: Mindmap, layout: Layout): Mindmap {
  if (layout === 'free')
    return {
      ...map,
      layout,
      nodes: map.nodes.map((node) => {
        const old = map.manualPositions?.find((p) => p.id === node.id)
        return old ? { ...node, x: old.x, y: old.y } : node
      }),
    }
  const manualPositions =
    map.layout === 'free'
      ? map.nodes.map(({ id, x, y }) => ({ id, x, y }))
      : map.manualPositions
  const nodeById = new Map(map.nodes.map((node) => [node.id, node]))
  const edgeById = new Map(map.edges.map((edge) => [edge.id, edge]))
  function origins(end: Endpoint, seen = new Set<string>()): string[] {
    if (end.kind === 'node') return [end.id]
    if (seen.has(end.id)) return []
    const edge = edgeById.get(end.id)
    if (!edge) return []
    return origins(edge.source, new Set(seen).add(end.id))
  }
  const connections = map.edges.flatMap((edge) =>
    edge.target.kind === 'node'
      ? origins(edge.source).map((source) => ({
          source,
          target: edge.target.id,
        }))
      : [],
  )
  const levels = new Map<string, number>()
  const targets = new Set(connections.map((e) => e.target))
  const queue = map.nodes.filter((n) => !targets.has(n.id)).map((n) => n.id)
  if (!queue.length && map.nodes[0]) queue.push(map.nodes[0].id)
  for (const id of queue) levels.set(id, 0)
  for (let i = 0; i < queue.length; i++) {
    for (const edge of connections) {
      if (edge.source === queue[i] && !levels.has(edge.target)) {
        levels.set(edge.target, (levels.get(queue[i]) ?? 0) + 1)
        queue.push(edge.target)
      }
    }
  }
  for (const node of map.nodes)
    if (!levels.has(node.id)) {
      levels.set(node.id, 0)
      queue.push(node.id)
    }
  const columnWidths = new Map<number, number>()
  for (const node of map.nodes) {
    const level = levels.get(node.id) ?? 0
    columnWidths.set(
      level,
      Math.max(columnWidths.get(level) ?? 220, size(node).width),
    )
  }
  const columns = new Map<number, number>()
  let columnX = 40
  for (let level = 0; level <= Math.max(0, ...levels.values()); level++) {
    columns.set(level, columnX)
    columnX += (columnWidths.get(level) ?? 220) + 100
  }
  const rows = new Map<number, number>()
  let mobileY = 40
  const largest = Math.max(
    220,
    ...map.nodes.map((n) => Math.max(size(n).width, size(n).height)),
  )
  const radius = Math.max(
    300,
    (map.nodes.length * (largest + 60)) / (2 * Math.PI),
  )
  return {
    ...map,
    layout,
    manualPositions,
    nodes: queue.flatMap((id, index) => {
      const node = nodeById.get(id)
      if (!node) return []
      const level = levels.get(id) ?? 0
      const rowY = rows.get(level) ?? 40
      rows.set(level, rowY + size(node).height + 50)
      if (layout === 'mobile') {
        const y = mobileY
        mobileY += size(node).height + 60
        return { ...node, x: 30, y }
      }
      if (layout === 'radial') {
        const angle = (index * 2 * Math.PI) / Math.max(1, queue.length)
        return {
          ...node,
          x: radius + 60 + radius * Math.cos(angle),
          y: radius + 60 + radius * Math.sin(angle),
        }
      }
      return { ...node, x: columns.get(level) ?? 40, y: rowY }
    }),
  }
}
export function removeElement(map: Mindmap, end: Endpoint): Mindmap {
  const removed = new Set([end.id])
  let changed = true
  while (changed) {
    changed = false
    for (const edge of map.edges)
      if (
        !removed.has(edge.id) &&
        (removed.has(edge.source.id) || removed.has(edge.target.id))
      ) {
        removed.add(edge.id)
        changed = true
      }
  }
  return {
    ...map,
    nodes: map.nodes.filter((n) => !removed.has(n.id)),
    edges: map.edges.filter((e) => !removed.has(e.id)),
  }
}

export function connectionTextHeight(text = '') {
  return Math.max(
    44,
    24 +
      text
        .split('\n')
        .reduce(
          (count, line) => count + Math.max(1, Math.ceil(line.length / 18)),
          0,
        ) *
        24,
  )
}
