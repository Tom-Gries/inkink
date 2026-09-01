import { registerInkRoutes } from './registry'
import type { InkDefinition } from './types'

export function defineInk(definition: InkDefinition): InkDefinition {
  registerInkRoutes(definition.name, definition.routes)
  return definition
}