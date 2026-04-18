import { deleteCreation } from './creationService'
import prisma from '../db/client'

jest.mock('../db/client', () => ({
  creation: { findFirst: jest.fn(), delete: jest.fn() },
}))

const creationId = 'creation-uuid' as any
const ownerId = 'owner-uuid' as any
const mockCreation = { id: creationId, userId: ownerId }

describe('deleteCreation', () => {
  it('returns true and deletes the creation when the user owns it', async () => {
    jest.mocked(prisma.creation.findFirst).mockResolvedValue(mockCreation as any)
    jest.mocked(prisma.creation.delete).mockResolvedValue(mockCreation as any)

    const result = await deleteCreation(creationId, ownerId)

    expect(result).toBe(true)
    expect(prisma.creation.delete).toHaveBeenCalledWith({ where: { id: creationId } })
  })

  it.each([
    ['creation belongs to another user', 'other-uuid'],
    ['creation does not exist', 'any-uuid'],
  ])('returns false and does not delete when %s', async (_, userId) => {
    jest.mocked(prisma.creation.findFirst).mockResolvedValue(null)

    const result = await deleteCreation(creationId, userId as any)

    expect(result).toBe(false)
    expect(prisma.creation.delete).not.toHaveBeenCalled()
  })
})