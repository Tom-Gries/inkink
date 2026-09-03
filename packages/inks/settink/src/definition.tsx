import { defineInk } from '@inkink/core'
import { Settings } from 'lucide-react'
import { translations } from './translations'
import { SettingsView } from './views/settings'

declare module '@inkink/core' {
  interface RouteRegistry {
    'settink.settings': '/settink'
  }
}

export default defineInk({
  name: 'settink',
  guard: 'none',
  routes: [
    {
      name: 'settings',
      path: '/settink',
      guard: 'auth',
      component: SettingsView,
      nav: {
        visible: true,
        icon: <Settings className="size-4" />,
        weight: 10,
      },
    },
  ],
  translations,
})
