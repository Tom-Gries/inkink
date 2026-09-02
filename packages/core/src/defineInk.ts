import { registerInkRoutes } from './registry'
import type { Definition } from './types'

export function defineInk(definition: Definition): Definition {
  registerInkRoutes(definition.name, definition.routes)

  return definition
}