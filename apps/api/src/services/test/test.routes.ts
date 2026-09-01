import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { validationErrorHook } from '../../hooks/validation'
import { createTestMessageSchema } from '../../schemas/test'
import { createTestMessage, listTestMessages } from './test.service'

export const testRoutes = new Hono()
  .post(
    '/',
    zValidator('json', createTestMessageSchema, validationErrorHook),
    async (c) => {
      const { message } = c.req.valid('json')
      const testMessage = await createTestMessage({ message })

      return c.json(testMessage, 201)
    },
  )
  .get('/', async (c) => {
    return c.json(await listTestMessages())
  })