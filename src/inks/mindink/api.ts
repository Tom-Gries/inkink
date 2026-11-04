import { getApiBaseUrl } from '../../api/client'
import type { Mindmap } from './model'
export async function request<T>(
  path = '',
  method = 'GET',
  map?: Mindmap,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}/api/mindmaps${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: map
      ? JSON.stringify({
          title: map.title,
          layout: map.layout,
          nodes: map.nodes,
          edges: map.edges,
          manualPositions: map.manualPositions,
        })
      : undefined,
  })
  if (!response.ok) throw new Error(`Mindmap: ${response.status}`)
  return response.status === 204 ? (undefined as T) : response.json()
}
