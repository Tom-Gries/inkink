import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from './api'
import { Mindink } from './mindink'
import type { Mindmap } from './model'

vi.mock('./api', () => ({ request: vi.fn() }))
vi.mock('../../ui-auth/index', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'owner' } }),
}))
const map: Mindmap = {
  id: 'map1',
  title: 'Meine Ideen',
  layout: 'free',
  nodes: [
    { id: 'a', shape: 'box', text: 'Start', x: 100, y: 100 },
    { id: 'b', shape: 'circle', text: 'Ziel', x: 400, y: 100 },
  ],
  edges: [],
}
beforeEach(() => {
  vi.mocked(request).mockReset()
  vi.mocked(request).mockResolvedValue([map])
})
afterEach(cleanup)
async function open() {
  render(<Mindink />)
  await screen.findByRole('option', { name: 'Meine Ideen' })
  fireEvent.change(screen.getByRole('combobox', { name: 'Mindmap' }), {
    target: { value: 'map1' },
  })
}
describe('Mindink editor', () => {
  it('uses a UI dialog to cancel or confirm deleting a map', async () => {
    await open()
    fireEvent.click(screen.getByRole('button', { name: 'Mindmap löschen' }))
    await screen.findByRole('dialog', { name: 'Mindmap löschen?' })
    expect(request).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(
      (
        screen.getByRole('textbox', {
          name: 'Titel der Mindmap',
        }) as HTMLInputElement
      ).value,
    ).toBe('Meine Ideen')
    fireEvent.click(screen.getByRole('button', { name: 'Mindmap löschen' }))
    await screen.findByRole('dialog', { name: 'Mindmap löschen?' })
    vi.mocked(request).mockResolvedValue(undefined)
    fireEvent.click(screen.getByRole('button', { name: 'Endgültig löschen' }))
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith('/map1', 'DELETE'),
    )
    await screen.findByText('Mindmap gelöscht.')
  })
  it('keeps unsaved edits until discarding them in the UI dialog', async () => {
    await open()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Text im Element: a' }),
      { target: { value: 'Nicht gespeichert' } },
    )
    fireEvent.click(screen.getByRole('button', { name: '+ Neue Mindmap' }))
    await screen.findByRole('dialog', { name: 'Änderungen verwerfen?' })
    fireEvent.click(screen.getByRole('button', { name: 'Weiter bearbeiten' }))
    expect(screen.getByDisplayValue('Nicht gespeichert')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: '+ Neue Mindmap' }))
    await screen.findByRole('dialog', { name: 'Änderungen verwerfen?' })
    fireEvent.click(
      screen.getByRole('button', { name: 'Änderungen verwerfen' }),
    )
    await screen.findByDisplayValue('Neue Mindmap')
    expect(screen.queryByDisplayValue('Nicht gespeichert')).toBeNull()
  })
  it.each([
    'arrow',
    'line',
  ] as const)('draws a %s from a node port and saves the attachment sides', async (kind) => {
    await open()
    vi.stubGlobal('PointerEvent', MouseEvent)
    const port = screen.getByRole('button', {
      name: 'Verbinden: Start – rechts',
    })
    Object.defineProperty(port, 'setPointerCapture', { value: vi.fn() })
    try {
      fireEvent.pointerDown(port, { clientX: 320, clientY: 150, pointerId: 1 })
      fireEvent.pointerMove(port, { clientX: 400, clientY: 190, pointerId: 1 })
      expect(
        document
          .querySelector('[aria-label="Verbindungsvorschau"]')
          ?.getAttribute('x2'),
      ).toBe('400')
      fireEvent.pointerUp(port, { clientX: 400, clientY: 190, pointerId: 1 })
      expect(
        screen.queryByRole('combobox', { name: 'Verbindungsenden' }),
      ).toBeNull()
      fireEvent.click(
        screen.getByRole('button', { name: 'Verbindungseinstellungen' }),
      )
      fireEvent.change(
        screen.getByRole('combobox', { name: 'Verbindungsenden' }),
        { target: { value: kind === 'line' ? 'none' : 'end' } },
      )
      expect(
        document.querySelector('[aria-label="Verbindungsvorschau"]'),
      ).toBeNull()
      expect(
        document.querySelector('polyline')?.getAttribute('marker-end'),
      ).toBe(kind === 'line' ? null : 'url(#mindink-arrow)')
      vi.mocked(request).mockResolvedValue({ saved: true })
      fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
      await waitFor(() =>
        expect(request).toHaveBeenLastCalledWith(
          '/map1',
          'PUT',
          expect.objectContaining({
            edges: [
              expect.objectContaining({
                kind,
                source: { kind: 'node', id: 'a', side: 'right' },
                target: { kind: 'node', id: 'b', side: 'left' },
              }),
            ],
          }),
        ),
      )
    } finally {
      vi.unstubAllGlobals()
    }
  })
  it('does not create a connection when a port is released on empty space', async () => {
    await open()
    vi.stubGlobal('PointerEvent', MouseEvent)
    const port = screen.getByRole('button', {
      name: 'Verbinden: Start – rechts',
    })
    Object.defineProperty(port, 'setPointerCapture', { value: vi.fn() })
    try {
      fireEvent.pointerDown(port, { clientX: 320, clientY: 150, pointerId: 1 })
      fireEvent.pointerUp(port, { clientX: 800, clientY: 500, pointerId: 1 })
      expect(document.querySelector('polyline')).toBeNull()
      expect(
        document.querySelector('[aria-label="Verbindungsvorschau"]'),
      ).toBeNull()
    } finally {
      vi.unstubAllGlobals()
    }
  })
  it.each([
    'arrow',
    'line',
  ] as const)('draws a new connection from an existing %s port', async (kind) => {
    vi.mocked(request).mockResolvedValue([
      {
        ...map,
        edges: [
          {
            id: 'ab',
            kind,
            source: { kind: 'node', id: 'a' },
            target: { kind: 'node', id: 'b' },
          },
        ],
      },
    ])
    await open()
    const port = screen.getByRole('button', {
      name: kind === 'line' ? 'Verbinden ab Linie 1' : 'Verbinden ab Pfeil 1',
    })
    vi.stubGlobal('PointerEvent', MouseEvent)
    Object.defineProperty(port, 'setPointerCapture', { value: vi.fn() })
    try {
      fireEvent.pointerDown(port, { clientX: 380, clientY: 170, pointerId: 1 })
      fireEvent.pointerMove(port, { clientX: 100, clientY: 150, pointerId: 1 })
      fireEvent.pointerUp(port, { clientX: 100, clientY: 150, pointerId: 1 })
      expect(document.querySelectorAll('polyline')).toHaveLength(2)
      vi.mocked(request).mockResolvedValue({ saved: true })
      fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
      await waitFor(() =>
        expect(request).toHaveBeenLastCalledWith(
          '/map1',
          'PUT',
          expect.objectContaining({
            edges: expect.arrayContaining([
              expect.objectContaining({
                source: { kind: 'edge', id: 'ab' },
                target: { kind: 'node', id: 'a', side: 'left' },
              }),
            ]),
          }),
        ),
      )
    } finally {
      vi.unstubAllGlobals()
    }
  })
  it.each([
    'none',
    'end',
    'start',
    'both',
  ] as const)('changes an existing arrow to %s', async (arrowType) => {
    vi.mocked(request).mockResolvedValue([
      {
        ...map,
        edges: [
          {
            id: 'ab',
            source: { kind: 'node', id: 'a' },
            target: { kind: 'node', id: 'b' },
          },
        ],
      },
    ])
    await open()
    expect(
      screen.queryByRole('button', { name: '↗ Pfeil verbinden' }),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Linie verbinden' })).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Pfeil 1 auswählen oder verbinden' }),
    )
    expect(
      screen.queryByRole('combobox', { name: 'Verbindungsenden' }),
    ).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Verbindungseinstellungen' }),
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Verbindungsenden' }),
      { target: { value: arrowType } },
    )
    expect(
      screen.queryByRole('combobox', { name: 'Verbindungsart' }),
    ).toBeNull()
    expect(
      screen
        .getByRole('combobox', { name: 'Verbindungsenden' })
        .closest('.mindink-connection'),
    ).not.toBeNull()
    const path = document.querySelector('polyline')
    expect(path?.getAttribute('marker-start')).toBe(
      arrowType === 'end' || arrowType === 'none'
        ? null
        : 'url(#mindink-arrow)',
    )
    expect(path?.getAttribute('marker-end')).toBe(
      arrowType === 'start' || arrowType === 'none'
        ? null
        : 'url(#mindink-arrow)',
    )
    vi.mocked(request).mockResolvedValue({ saved: true })
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith(
        '/map1',
        'PUT',
        expect.objectContaining({
          edges: [
            expect.objectContaining({
              kind: arrowType === 'none' ? 'line' : 'arrow',
              arrowType: arrowType === 'none' ? undefined : arrowType,
            }),
          ],
        }),
      ),
    )
  })
  it('connects nodes and arrows, and saves graph coordinates', async () => {
    await open()
    fireEvent.click(
      screen.getByRole('button', { name: 'Verbinden: Start – rechts' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ziel' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Verbinden ab Pfeil 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ziel' }))
    vi.mocked(request).mockResolvedValue({ saved: true })
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith(
        '/map1',
        'PUT',
        expect.objectContaining({
          nodes: map.nodes,
          edges: [
            expect.objectContaining({
              source: expect.objectContaining({ kind: 'node', id: 'a' }),
              target: { kind: 'node', id: 'b' },
            }),
            expect.objectContaining({
              source: expect.objectContaining({ kind: 'edge' }),
              target: { kind: 'node', id: 'b' },
            }),
          ],
        }),
      ),
    )
  })
  it('moves the arrow route and persists its bend, then straightens it', async () => {
    vi.mocked(request).mockResolvedValue([
      {
        ...map,
        edges: [
          {
            id: 'ab',
            source: { kind: 'node', id: 'a' },
            target: { kind: 'node', id: 'b' },
          },
        ],
      },
    ])
    await open()
    const handle = screen.getByRole('button', {
      name: 'Pfeil 1 auswählen oder verbinden',
    })
    fireEvent.click(handle)
    vi.stubGlobal('PointerEvent', MouseEvent)
    Object.defineProperty(handle, 'setPointerCapture', { value: vi.fn() })
    fireEvent.pointerDown(handle, { clientX: 350, clientY: 170, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: 350, clientY: 180, pointerId: 1 })
    fireEvent.pointerUp(handle, { pointerId: 1 })
    vi.unstubAllGlobals()
    const path = document.querySelector('polyline')
    expect(path?.getAttribute('points')).toContain('350,180')
    vi.mocked(request).mockResolvedValue({ saved: true })
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith(
        '/map1',
        'PUT',
        expect.objectContaining({
          edges: [expect.objectContaining({ bend: { x: 350, y: 180 } })],
        }),
      ),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Verbindung begradigen' }),
    )
    expect(
      document.querySelector('polyline')?.getAttribute('points'),
    ).toContain('350,170')
  })
  it.each([
    'arrow',
    'line',
  ] as const)('labels and saves a %s connection', async (kind) => {
    await open()
    fireEvent.click(
      screen.getByRole('button', { name: 'Verbinden: Start – rechts' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ziel' }))
    expect(
      screen.queryByRole('combobox', { name: 'Verbindungsenden' }),
    ).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Verbindungseinstellungen' }),
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Verbindungsenden' }),
      { target: { value: kind === 'line' ? 'none' : 'end' } },
    )
    const name = kind === 'line' ? 'Linie' : 'Pfeil'
    fireEvent.click(
      screen.getByRole('button', {
        name: `${name} 1 auswählen oder verbinden`,
      }),
    )
    const label = screen.getByRole('textbox', {
      name: `Beschriftung ${name} 1`,
    })
    expect(label.closest('.mindink-board')).not.toBeNull()
    fireEvent.change(label, { target: { value: 'führt zu' } })
    expect(document.querySelector('polyline')?.getAttribute('marker-end')).toBe(
      kind === 'line' ? null : 'url(#mindink-arrow)',
    )
    vi.mocked(request).mockResolvedValue({ saved: true })
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith(
        '/map1',
        'PUT',
        expect.objectContaining({
          edges: [expect.objectContaining({ kind, text: 'führt zu' })],
        }),
      ),
    )
  })
  it('creates at the clicked canvas coordinates including scroll offset', async () => {
    await open()
    expect(
      screen.queryByRole('button', { name: '▢ Kasten hinzufügen' }),
    ).toBeNull()
    const area = screen.getByRole('region', { name: 'Mindmap-Arbeitsfläche' })
    area.scrollLeft = 120
    area.scrollTop = 200
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Element auf Arbeitsfläche erstellen',
      }),
      { clientX: 620, clientY: 420 },
    )
    const menu = await screen.findByRole('dialog', {
      name: 'Element erstellen',
    })
    expect(menu.closest('.mindink-board')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '▢ Kasten' }))
    expect(
      screen.queryByRole('dialog', { name: 'Element erstellen' }),
    ).toBeNull()
    const editor = screen.getAllByPlaceholderText('Idee beschreiben …')[2]
    expect(document.activeElement).toBe(editor)
    expect((editor.closest('.mindink-node') as HTMLElement).style.left).toBe(
      '740px',
    )
    expect((editor.closest('.mindink-node') as HTMLElement).style.top).toBe(
      '620px',
    )
  })
  it('dismisses creation without adding an element', async () => {
    await open()
    const canvas = screen.getByRole('button', {
      name: 'Element auf Arbeitsfläche erstellen',
    })
    fireEvent.click(canvas)
    await screen.findByRole('dialog', { name: 'Element erstellen' })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(
      screen.queryByRole('dialog', { name: 'Element erstellen' }),
    ).toBeNull()
    fireEvent.click(canvas)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(screen.getAllByPlaceholderText('Idee beschreiben …')).toHaveLength(2)
    fireEvent.click(canvas)
    fireEvent.pointerDown(
      screen.getByRole('textbox', { name: 'Text im Element: a' }),
    )
    expect(
      screen.queryByRole('dialog', { name: 'Element erstellen' }),
    ).toBeNull()
  })
  it('supports adding and editing on touch devices without dragging', async () => {
    await open()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Element auf Arbeitsfläche erstellen',
      }),
      { clientX: 620, clientY: 420 },
    )
    await screen.findByRole('dialog', { name: 'Element erstellen' })
    fireEvent.click(screen.getByRole('button', { name: '◯ Kreis' }))
    const editor = screen.getAllByPlaceholderText('Idee beschreiben …')[2]
    expect(editor.closest('.mindink-node')).not.toBeNull()
    fireEvent.focus(editor)
    fireEvent.change(editor, { target: { value: 'Neue Idee' } })
    expect((editor as HTMLTextAreaElement).value).toBe('Neue Idee')
    fireEvent.click(screen.getByRole('button', { name: 'Auswahl löschen' }))
    expect(screen.queryByDisplayValue('Neue Idee')).toBeNull()
  })
})
