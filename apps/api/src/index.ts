import { Hono } from 'hono'
import { getDb } from './db'
import { errorHandler } from './hooks/error-handler'
import { realtimeRoutes } from './realtime/sse.routes'
import { projectsRoutes } from './services/projects/projects.routes'
import { usersRoutes } from './services/users/users.routes'

const app = new Hono().basePath('/api')

app.onError(errorHandler)

app.get('/health', (c) => c.json({ status: 'ok' }))

app.get('/ping', async (c) => {
  try {
    await getDb().command({ ping: 1 })

    return c.json({ mongo: 'up' })
  } catch {
    return c.json({ mongo: 'down' }, 503)
  }
})

app.route('/projects', projectsRoutes)
app.route('/users', usersRoutes)
app.route('/realtime', realtimeRoutes)

export default app