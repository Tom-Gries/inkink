import { Heart } from 'lucide-react'
import { defineInk } from '../../core/index'
import { translations } from './translations'
import { FeelView } from './views/feel'

declare module '../../core/index' {
  interface RouteRegistry {
    'feelink.feel': '/feelink'
  }
}

export default defineInk({
  name: 'feelink',
  guard: 'auth',
  routes: [
    {
      name: 'feel',
      path: '/feelink',
      guard: 'auth',
      component: FeelView,
      nav: {
        visible: true,
        icon: <Heart className="size-4" />,
        weight: 5,
      },
    },
  ],
  translations,
})
