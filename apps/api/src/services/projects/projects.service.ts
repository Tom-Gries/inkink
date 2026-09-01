import { ObjectId, type ChangeStream, type WithId } from 'mongodb'
import { getDb } from '../../db'
import type { CreateProject, ProjectDto, UpdateProject } from '../../schemas/project'

interface ProjectDocument {
  _id?: ObjectId
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

const projects = () => getDb().collection<ProjectDocument>('projects')

function toDto(document: WithId<ProjectDocument>): ProjectDto {
  return {
    id: document._id.toHexString(),
    name: document.name,
    description: document.description ?? undefined,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }
}

export async function listProjects(): Promise<ProjectDto[]> {
  const documents = await projects().find().sort({ createdAt: -1 }).toArray()

  return documents.map(toDto)
}

export async function getProject(id: string): Promise<ProjectDto | null> {
  const document = await projects().findOne({ _id: new ObjectId(id) })

  return document ? toDto(document) : null
}

export async function createProject(data: CreateProject): Promise<ProjectDto> {
  const now = new Date()
  const { insertedId } = await projects().insertOne({
    name: data.name,
    ...(data.description !== undefined ? { description: data.description } : {}),
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: insertedId.toHexString(),
    name: data.name,
    description: data.description,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

export async function updateProject(
  id: string,
  data: UpdateProject,
): Promise<ProjectDto | null> {
  const document = await projects().findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  )

  return document ? toDto(document) : null
}

export async function deleteProject(id: string): Promise<boolean> {
  const { deletedCount } = await projects().deleteOne({ _id: new ObjectId(id) })

  return deletedCount > 0
}

/** Change Stream für Realtime-Benachrichtigungen (SSE). */
export function watchProjects(): ChangeStream {
  return projects().watch([], { fullDocument: 'updateLookup' })
}