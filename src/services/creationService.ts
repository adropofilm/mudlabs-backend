import { Creation, UUID, createUUID } from '../types'
import { readDB, writeDB } from '../db/helpers'

interface CreateCreationInput {
  name: string
  intentDescription: string
  config: any
}

/**
 * Create a new custom piece
 */
export async function createCreation(
  userId: UUID,
  data: CreateCreationInput
): Promise<Creation> {
  const creations = await readDB<Creation>('creations')

  const creation: Creation = {
    id: createUUID(),
    userId,
    name: data.name,
    createdAt: new Date(),
    intentDescription: data.intentDescription,
    config: data.config,
  }

  creations.push(creation)
  await writeDB('creations', creations)

  return creation
}

/**
 * Get all creations for a user
 */
export async function getUserCreations(userId: UUID): Promise<Creation[]> {
  const creations = await readDB<Creation>('creations')
  return creations.filter((c) => c.userId === userId)
}

/**
 * Delete a creation (verify ownership)
 */
export async function deleteCreation(creationId: UUID, userId: UUID): Promise<boolean> {
  const creations = await readDB<Creation>('creations')
  const index = creations.findIndex((c) => c.id === creationId && c.userId === userId)

  if (index === -1) {
    return false
  }

  creations.splice(index, 1)
  await writeDB('creations', creations)

  return true
}
