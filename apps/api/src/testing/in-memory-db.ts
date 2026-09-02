import { ObjectId } from 'mongodb'

type FakeDocument = { _id: ObjectId } & Record<string, unknown>

/**
 * Minimaler In-Memory-Ersatz für die MongoDB – genau die Oberfläche,
 * die die Services nutzen (insertOne, find/sort/limit/toArray,
 * findOne, deleteOne). Die API-Vertragstests laufen damit ohne echte
 * Datenbank (kein Server, keine Env-Variablen).
 */
export function createInMemoryDb() {
  const collections = new Map<string, FakeDocument[]>()

  return {
    collection(name: string) {
      const documents = collections.get(name) ?? []
      collections.set(name, documents)

      return {
        async insertOne(document: Record<string, unknown>) {
          const _id = new ObjectId()
          documents.push({ _id, ...document })

          return { insertedId: _id }
        },
        find() {
          // Selbst-verkettender Cursor: sort()/limit() sind optional und
          // in beliebiger Reihenfolge nutzbar (wie beim echten Treiber).
          const cursor = {
            sort: () => cursor,
            limit: () => cursor,
            async toArray() {
              return documents.map((document) => ({ ...document }))
            },
          }

          return cursor
        },
        async findOne(filter: { _id: ObjectId }) {
          return documents.find((d) => d._id.equals(filter._id)) ?? null
        },
        async deleteOne(filter: { _id: ObjectId }) {
          const index = documents.findIndex((d) => d._id.equals(filter._id))

          if (index === -1) {
            return { deletedCount: 0 }
          }

          documents.splice(index, 1)

          return { deletedCount: 1 }
        },
      }
    },
  }
}