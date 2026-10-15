import { describe, expect, it } from 'vitest'
import { parseStackImport, StackImportError } from './import-stack'

describe('parseStackImport', () => {
  it('parst einen gültigen Stack und füllt Defaults', () => {
    const stack = parseStackImport(
      JSON.stringify({
        name: 'Kunstgeschichte',
        questions: [
          {
            question: 'Wer malte die Mona Lisa?',
            type: 'closed',
            answerOptions: [
              { text: 'Leonardo da Vinci', correct: true },
              { text: 'Picasso', correct: false },
            ],
          },
        ],
      }),
    )

    expect(stack.name).toBe('Kunstgeschichte')
    expect(stack.creatorName).toBe('')
    expect(stack.examTime).toBe(600)
    expect(stack.passingScore).toBe(0)
    expect(stack.isPublic).toBe(true)
    expect(stack.groupIds).toEqual([])
    expect(stack.questions).toHaveLength(1)

    const question = stack.questions[0]
    expect(question.id).toBeTruthy()
    expect(question.type).toBe('closed')
    expect(question.appearance).toBe('learn & proof')
    expect(question.points).toBe(1)
    expect(question.scoring).toBe('all')
    expect(question.explanation).toBe('')
    expect(question.answerOptions).toHaveLength(2)
    for (const option of question.answerOptions) {
      expect(option.id).toBeTruthy()
    }
    expect(question.answerOptions[0].correct).toBe(true)
  })

  it('übernimmt explizit gesetzte Felder', () => {
    const stack = parseStackImport(
      JSON.stringify({
        name: 'Mathe',
        creatorName: 'Ada',
        examTime: 0,
        passingScore: 50,
        isPublic: false,
        groupIds: ['g1', 42],
        questions: [
          {
            id: 'q1',
            question: '2 + 2?',
            type: 'open',
            appearance: 'proof',
            points: 3,
            scoring: 'partial',
            explanation: 'Vier',
            answerOptions: [{ text: 'x', correct: true }],
          },
        ],
      }),
    )

    expect(stack.creatorName).toBe('Ada')
    expect(stack.examTime).toBe(0)
    expect(stack.passingScore).toBe(50)
    expect(stack.isPublic).toBe(false)
    // Nicht-Strings in groupIds werden gefiltert.
    expect(stack.groupIds).toEqual(['g1'])

    const question = stack.questions[0]
    expect(question.id).toBe('q1')
    expect(question.type).toBe('open')
    expect(question.appearance).toBe('proof')
    expect(question.points).toBe(3)
    expect(question.scoring).toBe('partial')
    expect(question.explanation).toBe('Vier')
    // Offene Fragen bekommen keine Antwortoptionen.
    expect(question.answerOptions).toEqual([])
  })

  it('akzeptiert ein Array mit genau einem Stack', () => {
    const stack = parseStackImport(
      JSON.stringify([{ name: 'Mathe', questions: [] }]),
    )
    expect(stack.name).toBe('Mathe')
  })

  it('lehnt ein Array mit mehreren Stacks ab', () => {
    expect(() =>
      parseStackImport(JSON.stringify([{ name: 'A' }, { name: 'B' }])),
    ).toThrowError(StackImportError)
  })

  it('wirft invalid-json bei kaputtem JSON', () => {
    expect(() => parseStackImport('{ kaputt')).toThrowError(
      expect.objectContaining({ code: 'invalid-json' }),
    )
  })

  it('ignoriert ein BOM am Dateianfang', () => {
    const stack = parseStackImport(`\uFEFF${JSON.stringify({ name: 'BOM' })}`)
    expect(stack.name).toBe('BOM')
  })

  it('wirft name-required ohne Namen', () => {
    expect(() => parseStackImport('{}')).toThrowError(
      expect.objectContaining({ code: 'name-required' }),
    )
  })

  it('wirft questions-invalid, wenn questions kein Array ist', () => {
    expect(() =>
      parseStackImport(JSON.stringify({ name: 'X', questions: 'nope' })),
    ).toThrowError(expect.objectContaining({ code: 'questions-invalid' }))
  })

  it('wirft question-text-required bei Frage ohne Text', () => {
    expect(() =>
      parseStackImport(
        JSON.stringify({ name: 'X', questions: [{ type: 'open' }] }),
      ),
    ).toThrowError(expect.objectContaining({ code: 'question-text-required' }))
  })

  it('wirft question-invalid bei ungültiger Frage', () => {
    expect(() =>
      parseStackImport(JSON.stringify({ name: 'X', questions: ['nope'] })),
    ).toThrowError(expect.objectContaining({ code: 'question-invalid' }))
  })

  it('wirft options-invalid, wenn answerOptions kein Array ist', () => {
    expect(() =>
      parseStackImport(
        JSON.stringify({
          name: 'X',
          questions: [
            { question: 'Frage', type: 'closed', answerOptions: 'nope' },
          ],
        }),
      ),
    ).toThrowError(expect.objectContaining({ code: 'options-invalid' }))
  })

  it('wirft option-invalid bei ungültiger Antwortmöglichkeit', () => {
    expect(() =>
      parseStackImport(
        JSON.stringify({
          name: 'X',
          questions: [
            {
              question: 'Frage',
              type: 'closed',
              answerOptions: ['nope'],
            },
          ],
        }),
      ),
    ).toThrowError(expect.objectContaining({ code: 'option-invalid' }))
  })

  it('erzeugt für geschlossene Fragen ohne Optionen zwei leere Optionen', () => {
    const stack = parseStackImport(
      JSON.stringify({
        name: 'X',
        questions: [{ question: 'Frage', type: 'closed' }],
      }),
    )
    const question = stack.questions[0]
    expect(question.answerOptions).toHaveLength(2)
    expect(question.answerOptions[0].text).toBe('')
    expect(question.answerOptions[0].correct).toBe(true)
    expect(question.answerOptions[1].correct).toBe(false)
  })
})
