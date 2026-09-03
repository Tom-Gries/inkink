import { defineInk } from '@inkink/core'
import { CalendarClock, Link2 } from 'lucide-react'
import { translations } from './translations'
import { StartView } from './views/start'
import { ZielView } from './views/ziel'

declare module '@inkink/core' {
  interface RouteRegistry {
    'startink.start': '/startink/Start'
    'startink.ziel': '/startink/ziel'
  }
}

export default defineInk({
  name: 'startink',
  guard: 'auth',
  routes: [
    {
      name: 'start',
      path: '/startink/start',
      guard: 'none',
      component: StartView,
      nav: {
        visible: true,
        icon: <Link2 className="size-4" />,
      },
    },
    {
      name: 'ziel',
      path: '/startink/ziel',
      component: ZielView,
      nav: {
        visible: true,
        icon: <CalendarClock className="size-4" />,
      },
    },
  ],
  translations,
})
