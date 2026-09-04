import type { StackDto } from '@inkink/api'
import { describe, expect, it } from 'vitest'
import {
  evaluateProof,
  formatTime,
  qualifiesForTop3,
  rankLeaderboard,
  shuffle,
} from './lib'

function question(
  overrides: Partial<NonNullable<StackDto['questions'][number]>> = {},
) {
  const base = {
    id: 'q',
    type: 'closed',
    appearance: 'learn & proof',
    question: 'Frage',
    explanation: 'Erklärung',
    points: 1,
    answerOptions: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B', correct: false },
    ],
  }
  return { ...base, ...overrides } as StackDto['questions'][number]
}

describe('shuffle / formatTime', () => {
  it('behält alle Elemente', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect(out.sort()).toEqual([...input].sort())
  })

  it('formatiert Sekunden als mm:ss', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(400)).toBe('06:40')
  })

  it('formatiert negative Sekunden mit Minuszeichen', () => {
    expect(formatTime(-65)).toBe('-01:05')
    expect(formatTime(-400)).toBe('-06:40')
  })
})

describe('evaluateProof', () => {
  const q = question()
  const open = question({
    id: 'open1',
    type: 'open',
    answerOptions: [],
    points: 3,
  })

  it('vergibt keine Punkte für unbeantwortete Fragen', () => {
    const result = evaluateProof(new Map(), [q])
    expect(result.achieved).toBe(0)
    expect(result.possible).toBe(1)
    expect(result.percent).toBe(0)
  })

  it('vergibt Punkte bei exakt korrekter Auswahl', () => {
    const result = evaluateProof(new Map([['q', ['a']]]), [q])
    expect(result.achieved).toBe(1)
    expect(result.percent).toBe(100)
  })

  it('zählt Punkte über mehrere Fragen zusammen (inkl. Multi-Auswahl)', () => {
    const q2 = question({
      id: 'q2',
      points: 2,
      answerOptions: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B', correct: true },
        { id: 'c', text: 'C', correct: false },
      ],
    })
    const answers = new Map([
      ['q', ['a']],
      ['q2', ['a', 'b']],
    ])
    const result = evaluateProof(answers, [q, q2])
    expect(result.possible).toBe(3)
    expect(result.achieved).toBe(3)
  })

  it('vergibt im Default-Modus "all" nur volle Punkte bei exakt korrekter Auswahl', () => {
    const multi = question({
      id: 'multi',
      points: 3,
      answerOptions: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B', correct: true },
        { id: 'c', text: 'C', correct: false },
      ],
    })
    // Nur eine von zwei richtigen ausgewählt -> keine Punkte.
    const partialGuess = evaluateProof(new Map([['multi', ['a']]]), [multi])
    expect(partialGuess.achieved).toBe(0)
    // Eine richtige und eine falsche -> weiterhin 0 im "all"-Modus.
    const withWrong = evaluateProof(new Map([['multi', ['a', 'c']]]), [multi])
    expect(withWrong.achieved).toBe(0)
  })

  it('vergibt im Modus "partial" anteilig Punkte je korrekter Auswahl', () => {
    const multi = question({
      id: 'multi',
      scoring: 'partial',
      points: 4,
      answerOptions: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B', correct: true },
        { id: 'c', text: 'C', correct: false },
      ],
    })
    // 1 von 2 richtigen -> 4 * 1/2 = 2 Punkte (auch mit falscher Zusatzauswahl).
    const oneOfTwo = evaluateProof(new Map([['multi', ['a', 'c']]]), [multi])
    expect(oneOfTwo.achieved).toBe(2)
    // Beide richtigen -> volle 4 Punkte.
    const both = evaluateProof(new Map([['multi', ['a', 'b']]]), [multi])
    expect(both.achieved).toBe(4)
    // Keine richtige -> 0 Punkte.
    const none = evaluateProof(new Map([['multi', ['c']]]), [multi])
    expect(none.achieved).toBe(0)
  })

  it('zählt offene Fragen zu openPoints und totalQuestions, aber nicht zu den Punkten', () => {
    const result = evaluateProof(new Map(), [q, open])
    expect(result.possible).toBe(1)
    expect(result.achieved).toBe(0)
    expect(result.openPoints).toBe(3)
    expect(result.hasOpen).toBe(true)
    expect(result.totalQuestions).toBe(2)
  })

  it('behandelt fehlende Auswahl als falsch', () => {
    const result = evaluateProof(new Map(), [q])
    expect(result.achieved).toBe(0)
  })
})

describe('Leaderboard-Rangfolge', () => {
  it('sortiert nach Punktzahl absteigend, bei Gleichstand nach Zeit aufsteigend', () => {
    const ranked = rankLeaderboard([
      { name: 'A', score: 20, time: 400 },
      { name: 'B', score: 20, time: 500 },
      { name: 'C', score: 20, time: 300 },
      { name: 'D', score: 19, time: 10 },
    ])
    expect(ranked.map((e) => e.name)).toEqual(['C', 'A', 'B'])
  })

  it('begrenzt auf drei Einträge', () => {
    const ranked = rankLeaderboard([
      { name: 'A', score: 1, time: 1 },
      { name: 'B', score: 1, time: 2 },
      { name: 'C', score: 1, time: 3 },
      { name: 'D', score: 1, time: 4 },
    ])
    expect(ranked).toHaveLength(3)
  })

  it('prüft die Top-3-Qualifikation gegen das bestehende Leaderboard', () => {
    const lb = [
      { name: 'A', score: 20, time: 300 },
      { name: 'B', score: 20, time: 400 },
      { name: 'C', score: 20, time: 500 },
    ]
    expect(qualifiesForTop3({ name: 'X', score: 19, time: 1 }, lb)).toBe(false)
    expect(qualifiesForTop3({ name: 'X', score: 20, time: 350 }, lb)).toBe(true)
  })
})
