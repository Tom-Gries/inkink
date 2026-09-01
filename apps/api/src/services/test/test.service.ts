import { ObjectId, type ChangeStream, type WithId } from 'mongodb'
import { getDb } from '../../db'
import type { CreateTestMessage, TestMessageDto } from '../../schemas/test'

interface TestMessageDocument {
  _id?: ObjectId
  message: string
  createdAt: Date
}

const testMessages = () => getDb().collection<TestMessageDocument>('test_messages')

function toDto(document: WithId<TestMessageDocument>): TestMessageDto {
  return {
    id: document._id.toHexString(),
    message: document.message,
    createdAt: document.createdAt.toISOString(),
  }
}

export async function createTestMessage(data: CreateTestMessage): Promise<TestMessageDto> {
  const createdAt = new Date()
  const { insertedId } = await testMessages().insertOne({
    message: data.message,
    createdAt,
  })

  return {
    id: insertedId.toHexString(),
    message: data.message,
    createdAt: createdAt.toISOString(),
  }
}

export async function listTestMessages(): Promise<TestMessageDto[]> {
  const documents = await testMessages()
    .find()
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()

  return documents.map(toDto)
}

/** Change Stream für Realtime-Benachrichtigungen (SSE). */
export function watchTestMessages(): ChangeStream {
  return testMessages().watch([], { fullDocument: 'updateLookup' })
}