import { Brain } from 'lucide-react'
import { defineInk } from '../../core/index'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Link,
} from '../../ui/index'
import { LoginButton, useAuthStore } from '../../ui-auth/index'
import { Mindink } from './mindink'
import './mindink.css'

declare module '../../core/index' {
  interface RouteRegistry {
    'mindink.maps': '/mindink'
  }
}
function Home() {
  const user = useAuthStore((s) => s.user)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-4" aria-hidden="true" />
          Mindink
        </CardTitle>
        <CardDescription>
          Private Mindmaps für deine Ideen, Gedanken und Pläne.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <Link to="mindink.maps" type="next" className="w-full">
            Zu Mindink
          </Link>
        ) : (
          <LoginButton className="w-full" />
        )}
      </CardContent>
    </Card>
  )
}
export default defineInk({
  name: 'mindink',
  guard: 'auth',
  home: Home,
  routes: [
    {
      name: 'maps',
      path: '/mindink',
      component: Mindink,
      nav: { visible: true, icon: <Brain className="size-4" />, weight: 6 },
    },
  ],
  translations: {
    de: { 'mindink.nav.maps': 'Mindink' },
    en: { 'mindink.nav.maps': 'Mindink' },
  },
})
