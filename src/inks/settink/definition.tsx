import { Settings } from 'lucide-react'
import { defineInk } from '../../core/index'
import { translations } from './translations'
import { SettingsView } from './views/settings'

declare module '../../core/index' {
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
      guard: 'none',
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
