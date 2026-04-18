import { Piece } from '../types'
import { readDB } from '../db/helpers'

interface FilterOptions {
  collection?: string
  glaze?: string
  type?: string
}

/**
 * Get all pieces with optional filtering
 */
export async function getPieces(filters: FilterOptions): Promise<Piece[]> {
  let pieces = await readDB<Piece>('pieces')

  // TODO: Apply filters
  if (filters.collection) {
    pieces = pieces.filter((p) => p.collection === filters.collection)
  }

  if (filters.glaze) {
    pieces = pieces.filter((p) => p.glaze === filters.glaze)
  }

  if (filters.type) {
    pieces = pieces.filter((p) => p.type === filters.type)
  }

  return pieces
}

/**
 * Get single piece by ID
 */
export async function getPieceById(id: string): Promise<Piece | undefined> {
  const pieces = await readDB<Piece>('pieces')
  return pieces.find((p) => p.id === id)
}

/**
 * Get all collections
 */
export async function getCollections(): Promise<string[]> {
  const pieces = await readDB<Piece>('pieces')
  const collections = new Set(pieces.map((p) => p.collection))
  return Array.from(collections).sort()
}

/**
 * Get all glazes with descriptions
 */
export async function getGlazes(): Promise<Array<{ name: string; description: string }>> {
  // TODO: Define pottery glaze options
  return [
    { name: 'matte', description: 'Non-shiny, velvety finish' },
    { name: 'glossy', description: 'Shiny, reflective surface' },
    { name: 'textured', description: 'Rough, tactile surface' },
  ]
}
