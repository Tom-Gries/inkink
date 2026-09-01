import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ungültige Projekt-ID.')

export const projectIdParamSchema = z.object({
  id: objectIdSchema,
})

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name ist erforderlich.')
    .max(100, 'Name darf maximal 100 Zeichen lang sein.'),
  description: z
    .string()
    .max(2000, 'Beschreibung darf maximal 2000 Zeichen lang sein.')
    .optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProject = z.infer<typeof createProjectSchema>
export type UpdateProject = z.infer<typeof updateProjectSchema>

/** Projekt-DTO, wie die API ihn ausliefert (ObjectId und Dates serialisiert). */
export interface ProjectDto {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}