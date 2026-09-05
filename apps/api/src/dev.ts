import 'dotenv/config'
import { serve } from '@hono/node-server'
import serverApp from './server'

const port = Number(process.env.PORT) || 8787

serve({ fetch: serverApp.fetch, port }, (info) => {
  console.log(`API läuft auf http://localhost:${info.port}`)
})
