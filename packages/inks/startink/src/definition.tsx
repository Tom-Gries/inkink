import { defineInk } from '@inkink/core'
import { CalendarClock, Link2, Settings } from 'lucide-react'
import { translations } from './translations'
import { EinstellungenView } from './views/einstellungen'
import { StartView } from './views/start'
import { ZielView } from './views/ziel'

declare module '@inkink/core' {
  interface RouteRegistry {
    'startink.start': '/startink/Start'
    'startink.ziel': '/startink/ziel'
    'startink.einstellungen': '/startink/einstellungen'
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
    {
      // Zum Vorführen bewusst ohne Auth-Guard erreichbar.
      name: 'einstellungen',
      path: '/startink/einstellungen',
      guard: 'none',
      component: EinstellungenView,
      nav: {
        visible: true,
        icon: <Settings className="size-4" />,
        weight: 10,
      },
    },
  ],
  translations,
})
