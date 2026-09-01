import { defineInk } from '@inkink/core'
import { StartView } from './views/start'
import { ZielView } from './views/ziel'
import { translations } from './translations'

export default defineInk({
  name: 'startink',
  routes: [
    {
      path: '/startink/Start',
      component: StartView,
    },
    {
      path: '/startink/ziel',
      component: ZielView,
    },
  ],
  translations,
})