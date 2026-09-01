import { defineInk } from '@inkink/core'
import { StartView } from './views/start'
import { ZielView } from './views/ziel'
import { translations } from './translations'

declare module '@inkink/core' {
  interface RouteRegistry {
    'startink.start': '/startink/Start'
    'startink.ziel': '/startink/ziel'
  }
}

export default defineInk({
  name: 'startink',
  routes: [
    {
      name: 'start',
      path: '/startink/Start',
      component: StartView,
    },
    {
      name: 'ziel',
      path: '/startink/ziel',
      component: ZielView,
    },
  ],
  translations,
})