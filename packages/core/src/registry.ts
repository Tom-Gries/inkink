const routePaths = new Map<string, string>()

export function registerInkRoutes(
  inkName: string,
  routes: ReadonlyArray<{ name: string; path: string }>,
): void {
  for (const route of routes) {
    routePaths.set(`${inkName}.${route.name}`, route.path)
  }
}

export function resolveInkRoute(ref: string): string {
  const path = routePaths.get(ref)
  if (path === undefined) {
    throw new Error(
      `Unbekannte Ink-Route "${ref}". Registriert sind: ${[...routePaths.keys()].join(', ')}`,
    )
  }
  return path
}