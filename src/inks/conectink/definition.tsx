import { UsersRound } from 'lucide-react'
import { defineInk } from '../../core/index'
import { translations } from './translations'
import { ConectinkView } from './views/conectink'
import { ConectinkHome } from './views/home'

declare module '../../core/index' {
  interface RouteRegistry {
    'conectink.main': '/conectink'
  }
}

export default defineInk({
  name: 'conectink',
  guard: 'auth',
  home: ConectinkHome,
  routes: [
    {
      name: 'main',
      path: '/conectink',
      guard: 'auth',
      component: ConectinkView,
      nav: {
        visible: true,
        icon: <UsersRound className="size-4" />,
        weight: 7,
      },
    },
  ],
  translations,
})
