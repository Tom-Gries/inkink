import { defineInk } from '@inkink/core'
import { GraduationCap } from 'lucide-react'
import { translations } from './translations'
import { EditorView } from './views/editor'
import { LearnView } from './views/learn'
import { ProofView } from './views/proof'
import { StacksView } from './views/stacks'

declare module '@inkink/core' {
  interface RouteRegistry {
    'learnink.stacks': '/learnink/stacks'
    'learnink.editNew': '/learnink/stacks/edit/new'
    'learnink.edit': '/learnink/stacks/edit/$id'
    'learnink.learn': '/learnink/stacks/learn/$id'
    'learnink.proof': '/learnink/stacks/proof/$id'
  }
}

export default defineInk({
  name: 'learnink',
  guard: 'none',
  routes: [
    {
      name: 'stacks',
      path: '/learnink/stacks',
      component: StacksView,
      nav: {
        visible: true,
        icon: <GraduationCap className="size-4" />,
      },
    },
    {
      name: 'editNew',
      path: '/learnink/stacks/edit/new',
      component: EditorView,
    },
    {
      name: 'edit',
      path: '/learnink/stacks/edit/$id',
      component: EditorView,
    },
    {
      name: 'learn',
      path: '/learnink/stacks/learn/$id',
      component: LearnView,
    },
    {
      name: 'proof',
      path: '/learnink/stacks/proof/$id',
      component: ProofView,
    },
  ],
  translations,
})
