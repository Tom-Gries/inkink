export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/**
 * Wirft eine ApiError, wenn die API nicht mit 2xx antwortet.
 * Liefert sonst das geparste JSON direkt zurück (kein Cast nötig).
 */
export async function assertOk<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T
  }

  let code = 'HTTP_ERROR'
  let message = `HTTP ${res.status}`

  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string } }

    if (body.error) {
      code = body.error.code ?? code
      message = body.error.message ?? message
    }
  } catch {
    // Kein JSON-Body – generische Meldung behalten.
  }

  throw new ApiError(message, code, res.status)
}