import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { validationErrorHook } from '../../hooks/validation'
import {
  createProjectSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from '../../schemas/project'
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from './projects.service'

export const projectsRoutes = new Hono()

projectsRoutes.get('/', async (c) => {
  return c.json(await listProjects())
})

projectsRoutes.get(
  '/:id',
  zValidator('param', projectIdParamSchema, validationErrorHook),
  async (c) => {
    const { id } = c.req.valid('param')
    const project = await getProject(id)

    if (!project) {
      return c.json(
        { error: { code: 'NOT_FOUND', message: 'Projekt nicht gefunden.' } },
        404,
      )
    }

    return c.json(project)
  },
)

projectsRoutes.post(
  '/',
  zValidator('json', createProjectSchema, validationErrorHook),
  async (c) => {
    const data = c.req.valid('json')
    const project = await createProject(data)

    return c.json(project, 201)
  },
)

projectsRoutes.patch(
  '/:id',
  zValidator('param', projectIdParamSchema, validationErrorHook),
  zValidator('json', updateProjectSchema, validationErrorHook),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')
    const project = await updateProject(id, data)

    if (!project) {
      return c.json(
        { error: { code: 'NOT_FOUND', message: 'Projekt nicht gefunden.' } },
        404,
      )
    }

    return c.json(project)
  },
)

projectsRoutes.delete(
  '/:id',
  zValidator('param', projectIdParamSchema, validationErrorHook),
  async (c) => {
    const { id } = c.req.valid('param')
    const deleted = await deleteProject(id)

    if (!deleted) {
      return c.json(
        { error: { code: 'NOT_FOUND', message: 'Projekt nicht gefunden.' } },
        404,
      )
    }

    return c.body(null, 204)
  },
)