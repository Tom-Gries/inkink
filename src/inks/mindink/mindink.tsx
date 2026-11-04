import { Settings2 } from 'lucide-react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ConfirmDialog, PageContainer, PageHeader } from '../../ui/index'
import { useAuthStore } from '../../ui-auth/index'
import { request } from './api'
import {
  arrange,
  connectionTextHeight,
  type Endpoint,
  type Layout,
  type MapNode,
  type Mindmap,
  position,
  removeElement,
  size,
} from './model'

const empty = (): Mindmap => ({
  id: '',
  title: 'Neue Mindmap',
  nodes: [],
  edges: [],
  layout: 'free',
})
const same = (a: Endpoint | null, b: Endpoint) =>
  a?.kind === b.kind && a.id === b.id

export function Mindink() {
  const userId = useAuthStore((s) => s.user?.id)
  const [maps, setMaps] = useState<Mindmap[]>([])
  const [map, setMap] = useState<Mindmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [pendingMap, setPendingMap] = useState<Mindmap | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [saved, setSaved] = useState('')
  const [edgeSettings, setEdgeSettings] = useState<string | null>(null)
  const [selected, setSelected] = useState<Endpoint | null>(null)
  useEffect(() => {
    if (
      edgeSettings &&
      (selected?.kind !== 'edge' || selected.id !== edgeSettings)
    )
      setEdgeSettings(null)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEdgeSettings(null)
    }
    if (edgeSettings) document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selected, edgeSettings])
  const [connecting, setConnecting] = useState(false)
  const [source, setSource] = useState<Endpoint | null>(null)
  const [layout, setLayout] = useState<Layout>('free')
  const board = useRef<HTMLElement>(null)
  const [createAt, setCreateAt] = useState<{ x: number; y: number } | null>(
    null,
  )
  const createMenu = useRef<HTMLDivElement>(null)
  const createArea = useRef<HTMLButtonElement>(null)
  const pendingFocus = useRef<string | null>(null)
  useEffect(() => {
    if (!createAt) return
    createMenu.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const dismiss = (event: PointerEvent) => {
      if (!createMenu.current?.contains(event.target as Node)) setCreateAt(null)
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCreateAt(null)
        createArea.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [createAt])
  const connectionDrag = useRef<Endpoint | null>(null)
  const [draft, setDraft] = useState<{
    source: Endpoint
    x: number
    y: number
  } | null>(null)
  function boardPoint(event: ReactPointerEvent<HTMLButtonElement>) {
    const area = board.current
    const rect = area?.getBoundingClientRect()
    return {
      x: event.clientX - (rect?.left ?? 0) + (area?.scrollLeft ?? 0),
      y: event.clientY - (rect?.top ?? 0) + (area?.scrollTop ?? 0),
    }
  }
  function finishConnection(event: ReactPointerEvent<HTMLButtonElement>) {
    const origin = connectionDrag.current
    connectionDrag.current = null
    setDraft(null)
    if (!map || !origin) return
    const point = boardPoint(event)
    let target: Endpoint | undefined
    const node = [...map.nodes].reverse().find((n) => {
      if (n.id === origin.id) return false
      const d = size(n)
      return (
        point.x >= n.x - 12 &&
        point.x <= n.x + d.width + 12 &&
        point.y >= n.y - 12 &&
        point.y <= n.y + d.height + 12
      )
    })
    if (node) {
      const d = size(node)
      const sides = [
        { side: 'left' as const, distance: Math.abs(point.x - node.x) },
        {
          side: 'right' as const,
          distance: Math.abs(point.x - node.x - d.width),
        },
        { side: 'top' as const, distance: Math.abs(point.y - node.y) },
        {
          side: 'bottom' as const,
          distance: Math.abs(point.y - node.y - d.height),
        },
      ]
      sides.sort((a, b) => a.distance - b.distance)
      target = { kind: 'node', id: node.id, side: sides[0].side }
    } else {
      const edge = map.edges.find((e) => {
        if (origin.kind === 'edge' && origin.id === e.id) return false
        const p = position({ kind: 'edge', id: e.id }, map)
        return (
          Math.hypot(p.x - point.x, p.y - point.y) <= 24 ||
          Math.hypot(p.x + 30 - point.x, p.y - point.y) <= 16
        )
      })
      if (edge) target = { kind: 'edge', id: edge.id }
    }
    if (!target) return
    const destination = target
    const newId = crypto.randomUUID()
    setSelected({ kind: 'edge', id: newId })
    setMap((current) =>
      current && current.edges.length < 1000
        ? {
            ...current,
            edges: [
              ...current.edges,
              {
                id: newId,
                source: origin,
                target: destination,
                kind: 'arrow',
                arrowType: 'end',
              },
            ],
          }
        : current,
    )
  }
  const drag = useRef<{
    id: string
    x: number
    y: number
    startX: number
    startY: number
  } | null>(null)
  const edgeDrag = useRef<{
    id: string
    x: number
    y: number
    startX: number
    startY: number
  } | null>(null)
  function moveBend(id: string, x: number, y: number) {
    setMap((current) =>
      current
        ? {
            ...current,
            edges: current.edges.map((edge) =>
              edge.id === id
                ? {
                    ...edge,
                    bend: {
                      x: Math.max(0, Math.min(1000000, x)),
                      y: Math.max(0, Math.min(1000000, y)),
                    },
                  }
                : edge,
            ),
          }
        : current,
    )
  }
  const dirty = map !== null && JSON.stringify(map) !== saved

  useEffect(() => {
    let active = true
    if (!userId) {
      setLoading(false)
      setMap(null)
      setMaps([])
      return
    }
    setLoading(true)
    setMaps([])
    setMap(null)
    request<Mindmap[]>()
      .then((items) => {
        if (active) setMaps(items)
      })
      .catch(() => {
        if (active)
          setStatus('Mindmaps konnten nicht geladen werden. Bitte neu laden.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function open(next: Mindmap) {
    if (dirty) {
      setPendingMap(next)
      return
    }
    activate(next)
  }
  function activate(next: Mindmap) {
    setEdgeSettings(null)
    setCreateAt(null)
    setMap(next)
    setSaved(JSON.stringify(next))
    setSelected(null)
    setSource(null)
    setConnecting(false)
    setLayout(next.layout)
    setStatus('')
  }
  function add(shape: MapNode['shape'], x = 40, y = 40) {
    if (!map || map.nodes.length >= 500) {
      setStatus('Maximal 500 Elemente pro Mindmap.')
      return
    }
    const id = crypto.randomUUID()
    pendingFocus.current = id
    setSelected({ kind: 'node', id })
    setCreateAt(null)
    setMap((current) =>
      current && current.nodes.length < 500
        ? {
            ...current,
            nodes: [
              ...current.nodes,
              {
                id,
                shape,
                text: '',
                x: Math.max(0, x),
                y: Math.max(0, y),
              },
            ],
          }
        : current,
    )
  }
  function choose(end: Endpoint) {
    setSelected(end)
    if (!connecting) return
    if (!source) {
      setSource(end)
      return
    }
    if (same(source, end)) return
    const newId = crypto.randomUUID()
    setSelected({ kind: 'edge', id: newId })
    setMap((current) =>
      current && current.edges.length < 1000
        ? {
            ...current,
            edges: [
              ...current.edges,
              {
                id: newId,
                source,
                target: end,
                kind: 'arrow',
                arrowType: 'end',
              },
            ],
          }
        : current,
    )
    setSource(null)
    setConnecting(false)
  }
  async function save() {
    if (!map || busy) return
    const snapshot = { ...map, title: map.title.trim() || 'Neue Mindmap' }
    setBusy(true)
    setStatus('Wird gespeichert …')
    try {
      let persisted = snapshot
      if (map.id) await request(`/${map.id}`, 'PUT', snapshot)
      else persisted = await request<Mindmap>('', 'POST', snapshot)
      setMap(persisted)
      setSaved(JSON.stringify(persisted))
      setMaps((items) => [
        persisted,
        ...items.filter((item) => item.id !== persisted.id),
      ])
      setStatus('Gespeichert · nur für dich sichtbar')
    } catch {
      setStatus(
        'Speichern fehlgeschlagen. Deine Änderungen sind noch hier. Bitte erneut versuchen.',
      )
    } finally {
      setBusy(false)
    }
  }
  async function deleteMap() {
    if (!map || busy) return
    setBusy(true)
    try {
      if (map.id) await request(`/${map.id}`, 'DELETE')
      setMaps((items) => items.filter((item) => item.id !== map.id))
      setMap(null)
      setStatus('Mindmap gelöscht.')
    } catch {
      setStatus('Löschen fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setBusy(false)
    }
  }
  function applyLayout() {
    if (!map) return
    setMap(arrange(map, layout))
  }
  function startDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    node: MapNode,
  ) {
    if (connecting) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      id: node.id,
      x: node.x,
      y: node.y,
      startX: event.clientX,
      startY: event.clientY,
    }
    setSelected({ kind: 'node', id: node.id })
  }
  const node = map?.nodes.find(
    (n) => selected?.kind === 'node' && n.id === selected.id,
  )
  const width = Math.max(
    layout === 'mobile' ? 310 : 900,
    ...(map?.nodes.map((n) => n.x + size(n).width + 60) ?? []),
    ...(map?.edges.map(
      (edge) => position({ kind: 'edge', id: edge.id }, map).x + 200,
    ) ?? []),
  )
  const height = Math.max(
    600,
    ...(map?.nodes.map((n) => n.y + size(n).height + 60) ?? []),
    ...(map?.edges.map(
      (edge) =>
        position({ kind: 'edge', id: edge.id }, map).y +
        connectionTextHeight(edge.text) +
        120,
    ) ?? []),
  )
  return (
    <PageContainer>
      <ConfirmDialog
        open={pendingMap !== null}
        onOpenChange={(open) => {
          if (!open) setPendingMap(null)
        }}
        title="Änderungen verwerfen?"
        description="Deine ungespeicherten Änderungen gehen verloren, wenn du eine andere Mindmap öffnest oder eine neue erstellst."
        confirmLabel="Änderungen verwerfen"
        cancelLabel="Weiter bearbeiten"
        destructive
        onConfirm={() => {
          if (pendingMap) activate(pendingMap)
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Mindmap löschen?"
        description="Diese Mindmap wird endgültig gelöscht. Das lässt sich nicht rückgängig machen."
        confirmLabel="Endgültig löschen"
        destructive
        onConfirm={() => {
          void deleteMap()
        }}
      />
      <PageHeader
        title="Mindink"
        description="Deine privaten Mindmaps. Ideen festhalten, verbinden und ordnen."
      />
      <div className="mindink">
        <div className="mindink-toolbar">
          <label>
            Mindmap{' '}
            <select
              disabled={busy || loading}
              value={map?.id || ''}
              onChange={(e) => {
                const next = maps.find((m) => m.id === e.target.value)
                if (next) open(next)
              }}
            >
              <option value="">Mindmap auswählen</option>
              {maps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy || loading}
            onClick={() => open(empty())}
          >
            + Neue Mindmap
          </button>
          <span className="mindink-private">Privat · nur du</span>
        </div>
        {loading && <p>Mindmaps werden geladen …</p>}
        <output className="mindink-status" aria-live="polite">
          {dirty ? 'Ungespeicherte Änderungen. ' : ''}
          {status}
        </output>
        {!map && !loading && (
          <div className="mindink-empty">
            Erstelle eine Mindmap und gib deinen Gedanken Raum.
          </div>
        )}
        {map && (
          <fieldset disabled={busy} className="mindink-editor">
            <div className="mindink-toolbar">
              <input
                aria-label="Titel der Mindmap"
                maxLength={200}
                value={map.title}
                onChange={(e) => setMap({ ...map, title: e.target.value })}
              />
              <button type="button" onClick={save}>
                {busy ? 'Speichern …' : 'Speichern'}
              </button>
              <button type="button" onClick={() => setDeleteOpen(true)}>
                Mindmap löschen
              </button>
            </div>
            <div className="mindink-toolbar">
              {connecting && (
                <button
                  type="button"
                  onClick={() => {
                    setConnecting(false)
                    setSource(null)
                  }}
                >
                  Verbinden abbrechen
                </button>
              )}
              <label>
                Struktur{' '}
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as Layout)}
                >
                  <option value="free">Eigene Anordnung</option>
                  <option value="tree">Baum</option>
                  <option value="radial">Radial</option>
                  <option value="mobile">Mobil</option>
                </select>
              </label>
              <button type="button" onClick={applyLayout}>
                Anwenden
              </button>
            </div>
            <p className="mindink-hint">
              {connecting
                ? source
                  ? 'Ziel auswählen: Element oder Griff einer Verbindung.'
                  : 'Start auswählen: Element oder Griff einer Verbindung.'
                : 'Auf eine freie Stelle klicken, um ein Element zu erstellen. Von einem Randpunkt zum nächsten Element ziehen, um es zu verbinden. Text direkt im Element bearbeiten. Elemente am oberen Griff verschieben. Am runden Verbindungsgriff ziehen, um den Verlauf zu ändern. Griff anklicken, um die Verbindung zu beschriften.'}
            </p>
            {selected && (
              <div className="mindink-toolbar">
                {node && (
                  <label>
                    Form{' '}
                    <select
                      value={node.shape}
                      onChange={(e) =>
                        setMap({
                          ...map,
                          nodes: map.nodes.map((n) =>
                            n.id === node.id
                              ? {
                                  ...n,
                                  shape: e.target.value as MapNode['shape'],
                                }
                              : n,
                          ),
                        })
                      }
                    >
                      <option value="box">Kasten</option>
                      <option value="circle">Kreis</option>
                    </select>
                  </label>
                )}
                {selected.kind === 'edge' && (
                  <button
                    type="button"
                    onClick={() =>
                      setMap({
                        ...map,
                        edges: map.edges.map((edge) =>
                          edge.id === selected.id
                            ? { ...edge, bend: undefined }
                            : edge,
                        ),
                      })
                    }
                  >
                    Verbindung begradigen
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMap(removeElement(map, selected))
                    setSelected(null)
                    setSource(null)
                  }}
                >
                  Auswahl löschen
                </button>
              </div>
            )}
            <section
              className="mindink-scroll"
              aria-label="Mindmap-Arbeitsfläche"
              ref={board}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const shape = e.dataTransfer.getData(
                  'application/mindink-shape',
                )
                const rect = e.currentTarget.getBoundingClientRect()
                if (shape === 'box' || shape === 'circle')
                  add(
                    shape,
                    e.clientX - rect.left + e.currentTarget.scrollLeft,
                    e.clientY - rect.top + e.currentTarget.scrollTop,
                  )
              }}
            >
              <div className="mindink-board" style={{ width, height }}>
                <button
                  type="button"
                  ref={createArea}
                  className="mindink-create-area"
                  aria-label="Element auf Arbeitsfläche erstellen"
                  onClick={(e) => {
                    const area = board.current
                    if (!area) return
                    const rect = area.getBoundingClientRect()
                    const keyboard =
                      e.detail === 0 && e.clientX === 0 && e.clientY === 0
                    setCreateAt({
                      x: Math.max(
                        16,
                        keyboard
                          ? area.scrollLeft + 40
                          : e.clientX - rect.left + area.scrollLeft,
                      ),
                      y: Math.max(
                        16,
                        keyboard
                          ? area.scrollTop + 40
                          : e.clientY - rect.top + area.scrollTop,
                      ),
                    })
                    setSelected(null)
                    setConnecting(false)
                    setSource(null)
                  }}
                />
                {createAt && (
                  <div
                    ref={createMenu}
                    role="dialog"
                    aria-label="Element erstellen"
                    className="mindink-create-menu"
                    style={{
                      left: Math.max(
                        (board.current?.scrollLeft ?? 0) + 8,
                        Math.min(
                          createAt.x,
                          (board.current?.scrollLeft ?? 0) +
                            (board.current?.clientWidth || 900) -
                            200,
                        ),
                      ),
                      top: Math.max(
                        (board.current?.scrollTop ?? 0) + 8,
                        Math.min(
                          createAt.y,
                          (board.current?.scrollTop ?? 0) +
                            (board.current?.clientHeight || 600) -
                            160,
                        ),
                      ),
                    }}
                  >
                    <span>Was möchtest du erstellen?</span>
                    <button
                      type="button"
                      onClick={() => add('box', createAt.x, createAt.y)}
                    >
                      ▢ Kasten
                    </button>
                    <button
                      type="button"
                      onClick={() => add('circle', createAt.x, createAt.y)}
                    >
                      ◯ Kreis
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateAt(null)
                        createArea.current?.focus()
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
                <svg
                  width={width}
                  height={height}
                  className="mindink-lines"
                  aria-label="Verbindungen"
                >
                  <defs>
                    <marker
                      id="mindink-arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="9"
                      markerHeight="9"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                    </marker>
                  </defs>
                  {map.edges.map((edge) => {
                    const a = position(edge.source, map),
                      b = position(edge.target, map)
                    const bend = edge.bend ?? {
                      x: (a.x + b.x) / 2,
                      y: (a.y + b.y) / 2,
                    }
                    // Stop node arrows at the outline, so the arrowhead stays visible.
                    const target =
                      edge.target.kind === 'node' && !edge.target.side
                        ? map.nodes.find((n) => n.id === edge.target.id)
                        : undefined
                    let end = b
                    if (target) {
                      const d = size(target),
                        dx = bend.x - b.x,
                        dy = bend.y - b.y
                      const scale =
                        target.shape === 'circle'
                          ? 1 /
                            Math.sqrt(
                              (dx / (d.width / 2)) ** 2 +
                                (dy / (d.height / 2)) ** 2,
                            )
                          : Math.min(
                              d.width / 2 / Math.max(0.001, Math.abs(dx)),
                              d.height / 2 / Math.max(0.001, Math.abs(dy)),
                            )
                      if (Number.isFinite(scale))
                        end = { x: b.x + dx * scale, y: b.y + dy * scale }
                    }
                    let start = a
                    const originNode =
                      edge.source.kind === 'node' && !edge.source.side
                        ? map.nodes.find((n) => n.id === edge.source.id)
                        : undefined
                    if (originNode) {
                      const d = size(originNode),
                        dx = bend.x - a.x,
                        dy = bend.y - a.y
                      const scale =
                        originNode.shape === 'circle'
                          ? 1 /
                            Math.hypot(dx / (d.width / 2), dy / (d.height / 2))
                          : Math.min(
                              d.width / 2 / Math.max(0.001, Math.abs(dx)),
                              d.height / 2 / Math.max(0.001, Math.abs(dy)),
                            )
                      if (Number.isFinite(scale))
                        start = { x: a.x + dx * scale, y: a.y + dy * scale }
                    }
                    return (
                      <polyline
                        key={edge.id}
                        points={`${start.x},${start.y} ${bend.x},${bend.y} ${end.x},${end.y}`}
                        fill="none"
                        strokeLinejoin="round"
                        stroke="currentColor"
                        strokeWidth={
                          same(selected, { kind: 'edge', id: edge.id }) ? 3 : 2
                        }
                        markerStart={
                          edge.kind !== 'line' &&
                          (edge.arrowType === 'start' ||
                            edge.arrowType === 'both')
                            ? 'url(#mindink-arrow)'
                            : undefined
                        }
                        markerEnd={
                          edge.kind === 'line' || edge.arrowType === 'start'
                            ? undefined
                            : 'url(#mindink-arrow)'
                        }
                      />
                    )
                  })}
                  {draft && (
                    <line
                      aria-label="Verbindungsvorschau"
                      x1={position(draft.source, map).x}
                      y1={position(draft.source, map).y}
                      x2={draft.x}
                      y2={draft.y}
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      markerEnd="url(#mindink-arrow)"
                    />
                  )}
                </svg>
                {map.nodes.map((n) => {
                  const d = size(n)
                  return (
                    <div
                      key={n.id}
                      className={`mindink-node ${n.shape} ${same(selected, { kind: 'node', id: n.id }) ? 'selected' : ''} ${same(source, { kind: 'node', id: n.id }) ? 'source' : ''}`}
                      style={{
                        left: n.x,
                        top: n.y,
                        width: d.width,
                        minHeight: d.height,
                      }}
                    >
                      <div className="mindink-node-body">
                        <button
                          type="button"
                          className="mindink-grip"
                          aria-label={`Element verschieben: ${n.text || 'Leer'}`}
                          onPointerDown={(e) => startDrag(e, n)}
                          onPointerMove={(e) => {
                            const moving = drag.current
                            if (!moving || moving.id !== n.id) return
                            setMap((current) =>
                              current
                                ? {
                                    ...current,
                                    nodes: current.nodes.map((item) =>
                                      item.id === n.id
                                        ? {
                                            ...item,
                                            x: Math.max(
                                              0,
                                              moving.x +
                                                e.clientX -
                                                moving.startX,
                                            ),
                                            y: Math.max(
                                              0,
                                              moving.y +
                                                e.clientY -
                                                moving.startY,
                                            ),
                                          }
                                        : item,
                                    ),
                                  }
                                : current,
                            )
                          }}
                          onPointerUp={() => {
                            drag.current = null
                          }}
                          onPointerCancel={() => {
                            drag.current = null
                          }}
                          onKeyDown={(e) => {
                            const delta = (
                              {
                                ArrowLeft: [-10, 0],
                                ArrowRight: [10, 0],
                                ArrowUp: [0, -10],
                                ArrowDown: [0, 10],
                              } as Record<string, number[]>
                            )[e.key]
                            if (delta) {
                              e.preventDefault()
                              setMap({
                                ...map,
                                nodes: map.nodes.map((item) =>
                                  item.id === n.id
                                    ? {
                                        ...item,
                                        x: Math.max(0, item.x + delta[0]),
                                        y: Math.max(0, item.y + delta[1]),
                                      }
                                    : item,
                                ),
                              })
                            }
                          }}
                        >
                          ⠿
                        </button>
                        {connecting ? (
                          <button
                            type="button"
                            className="mindink-node-text"
                            onClick={() => choose({ kind: 'node', id: n.id })}
                          >
                            {n.text || 'Leeres Element verbinden'}
                          </button>
                        ) : (
                          <textarea
                            className="mindink-node-text"
                            ref={(element) => {
                              if (element && pendingFocus.current === n.id) {
                                pendingFocus.current = null
                                element.focus()
                              }
                            }}
                            aria-label={`Text im Element: ${n.id}`}
                            placeholder="Idee beschreiben …"
                            maxLength={5000}
                            value={n.text}
                            style={{ height: d.height - 32 }}
                            onFocus={() =>
                              setSelected({ kind: 'node', id: n.id })
                            }
                            onChange={(e) =>
                              setMap((current) =>
                                current
                                  ? {
                                      ...current,
                                      nodes: current.nodes.map((item) =>
                                        item.id === n.id
                                          ? { ...item, text: e.target.value }
                                          : item,
                                      ),
                                    }
                                  : current,
                              )
                            }
                          />
                        )}
                      </div>
                      {(['top', 'right', 'bottom', 'left'] as const).map(
                        (side) => (
                          <button
                            key={side}
                            type="button"
                            className={`mindink-port ${side}`}
                            aria-label={`Verbinden: ${n.text || 'Leeres Element'} – ${{ top: 'oben', right: 'rechts', bottom: 'unten', left: 'links' }[side]}`}
                            title="Zu einem Element oder Verbindungsgriff ziehen"
                            onPointerDown={(e) => {
                              if (e.button !== 0) return
                              e.preventDefault()
                              e.currentTarget.setPointerCapture(e.pointerId)
                              const origin: Endpoint = {
                                kind: 'node',
                                id: n.id,
                                side,
                              }
                              connectionDrag.current = origin
                              setDraft({ source: origin, ...boardPoint(e) })
                              setConnecting(false)
                              setSource(null)
                            }}
                            onPointerMove={(e) => {
                              const origin = connectionDrag.current
                              if (origin)
                                setDraft({ source: origin, ...boardPoint(e) })
                            }}
                            onPointerUp={finishConnection}
                            onPointerCancel={() => {
                              connectionDrag.current = null
                              setDraft(null)
                            }}
                            onLostPointerCapture={() => {
                              connectionDrag.current = null
                              setDraft(null)
                            }}
                            onClick={(e) => {
                              if (e.detail === 0) {
                                setConnecting(true)
                                setSource({ kind: 'node', id: n.id, side })
                              }
                            }}
                          >
                            +
                          </button>
                        ),
                      )}
                    </div>
                  )
                })}
                {map.edges.map((edge) => {
                  const p = position({ kind: 'edge', id: edge.id }, map)
                  return (
                    <div key={edge.id} className="mindink-connection">
                      <button
                        type="button"
                        className="mindink-edge-port"
                        style={{ left: p.x + 18, top: p.y - 12 }}
                        aria-label={`Verbinden ab ${edge.kind === 'line' ? 'Linie' : 'Pfeil'} ${map.edges.indexOf(edge) + 1}`}
                        title="Neue Verbindung von hier ziehen"
                        onPointerDown={(e) => {
                          if (e.button !== 0) return
                          e.preventDefault()
                          e.currentTarget.setPointerCapture(e.pointerId)
                          const origin: Endpoint = { kind: 'edge', id: edge.id }
                          connectionDrag.current = origin
                          setDraft({ source: origin, ...boardPoint(e) })
                          setConnecting(false)
                          setSource(null)
                        }}
                        onPointerMove={(e) => {
                          const origin = connectionDrag.current
                          if (origin)
                            setDraft({ source: origin, ...boardPoint(e) })
                        }}
                        onPointerUp={finishConnection}
                        onPointerCancel={() => {
                          connectionDrag.current = null
                          setDraft(null)
                        }}
                        onLostPointerCapture={() => {
                          connectionDrag.current = null
                          setDraft(null)
                        }}
                        onClick={(e) => {
                          if (e.detail === 0) {
                            setConnecting(true)
                            setSource({ kind: 'edge', id: edge.id })
                          }
                        }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={`mindink-edge ${same(source, { kind: 'edge', id: edge.id }) ? 'source' : ''}`}
                        style={{ left: p.x - 14, top: p.y - 14 }}
                        aria-label={`${edge.kind === 'line' ? 'Linie' : 'Pfeil'} ${map.edges.indexOf(edge) + 1} auswählen oder verbinden`}
                        title="Ziehen, um den Pfeilverlauf zu ändern"
                        onPointerDown={(e) => {
                          if (connecting) return
                          e.currentTarget.setPointerCapture(e.pointerId)
                          edgeDrag.current = {
                            id: edge.id,
                            x: p.x,
                            y: p.y,
                            startX: e.clientX,
                            startY: e.clientY,
                          }
                          setSelected({ kind: 'edge', id: edge.id })
                        }}
                        onPointerMove={(e) => {
                          const moving = edgeDrag.current
                          if (moving?.id === edge.id)
                            moveBend(
                              edge.id,
                              moving.x + e.clientX - moving.startX,
                              moving.y + e.clientY - moving.startY,
                            )
                        }}
                        onPointerUp={() => {
                          edgeDrag.current = null
                        }}
                        onPointerCancel={() => {
                          edgeDrag.current = null
                        }}
                        onKeyDown={(e) => {
                          if (connecting) return
                          const delta = (
                            {
                              ArrowLeft: [-10, 0],
                              ArrowRight: [10, 0],
                              ArrowUp: [0, -10],
                              ArrowDown: [0, 10],
                            } as Record<string, number[]>
                          )[e.key]
                          if (delta) {
                            e.preventDefault()
                            moveBend(edge.id, p.x + delta[0], p.y + delta[1])
                          }
                        }}
                        onClick={() => choose({ kind: 'edge', id: edge.id })}
                      >
                        •
                      </button>
                      {!connecting &&
                        same(selected, { kind: 'edge', id: edge.id }) && (
                          <button
                            type="button"
                            className="mindink-edge-gear"
                            style={{ left: p.x + 50, top: p.y - 14 }}
                            aria-label="Verbindungseinstellungen"
                            aria-expanded={edgeSettings === edge.id}
                            onClick={() =>
                              setEdgeSettings((current) =>
                                current === edge.id ? null : edge.id,
                              )
                            }
                          >
                            <Settings2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      {!connecting &&
                        same(selected, { kind: 'edge', id: edge.id }) &&
                        edgeSettings === edge.id && (
                          <label
                            className="mindink-edge-settings"
                            style={{
                              left: Math.max(0, p.x - 110),
                              top: p.y + 20,
                            }}
                          >
                            Enden
                            <select
                              aria-label="Verbindungsenden"
                              value={
                                edge.kind === 'line'
                                  ? 'none'
                                  : (edge.arrowType ?? 'end')
                              }
                              onChange={(e) =>
                                setMap((current) =>
                                  current
                                    ? {
                                        ...current,
                                        edges: current.edges.map((item) =>
                                          item.id === edge.id
                                            ? {
                                                ...item,
                                                kind:
                                                  e.target.value === 'none'
                                                    ? 'line'
                                                    : 'arrow',
                                                arrowType:
                                                  e.target.value === 'none'
                                                    ? undefined
                                                    : (e.target.value as
                                                        | 'end'
                                                        | 'start'
                                                        | 'both'),
                                              }
                                            : item,
                                        ),
                                      }
                                    : current,
                                )
                              }
                            >
                              <option value="none">Ohne Spitzen —</option>
                              <option value="end">Spitze am Ende →</option>
                              <option value="start">Spitze am Anfang ←</option>
                              <option value="both">Beide Enden ↔</option>
                            </select>
                          </label>
                        )}
                      {!connecting &&
                        (edge.text ||
                          same(selected, { kind: 'edge', id: edge.id })) && (
                          <textarea
                            className="mindink-connection-text"
                            aria-label={`Beschriftung ${edge.kind === 'line' ? 'Linie' : 'Pfeil'} ${map.edges.indexOf(edge) + 1}`}
                            placeholder="Beschriftung …"
                            maxLength={1000}
                            value={edge.text ?? ''}
                            style={{
                              left: Math.max(0, p.x - 90),
                              top: p.y + (edgeSettings === edge.id ? 76 : 20),
                              height: connectionTextHeight(edge.text),
                            }}
                            onFocus={() =>
                              setSelected({ kind: 'edge', id: edge.id })
                            }
                            onChange={(e) =>
                              setMap((current) =>
                                current
                                  ? {
                                      ...current,
                                      edges: current.edges.map((item) =>
                                        item.id === edge.id
                                          ? { ...item, text: e.target.value }
                                          : item,
                                      ),
                                    }
                                  : current,
                              )
                            }
                          />
                        )}
                    </div>
                  )
                })}
              </div>
            </section>
          </fieldset>
        )}
      </div>
    </PageContainer>
  )
}
