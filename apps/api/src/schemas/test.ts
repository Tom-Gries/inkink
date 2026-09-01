import { z } from 'zod'

export const createTestMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Nachricht ist erforderlich.')
    .max(200, 'Nachricht darf maximal 200 Zeichen lang sein.'),
})

export type CreateTestMessage = z.infer<typeof createTestMessageSchema>

/** Test-Nachricht-DTO, wie die API ihn ausliefert. */
export interface TestMessageDto {
  id: string
  message: string
  createdAt: string
}