import { createMiddleware } from 'hono/factory'
import { getAuth } from '../auth'

export type Session = Awaited<
  ReturnType<ReturnType<typeof getAuth>['api']['getSession']>
>

export interface AuthVariables {
  session: Session | null
}

/** Stellt die aktuelle Session aus dem Cookie in c.get('session') bereit. */
export const sessionMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const session = await getAuth().api.getSession({
      headers: c.req.raw.headers,
    })

    c.set('session', session)
    await next()
  },
)