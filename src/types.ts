// UUID type
export type UUID = string & { readonly brand: 'UUID' }

export const createUUID = (): UUID => {
  const { v4 } = require('uuid')
  return v4() as UUID
}

// ============ USER ============
export interface User {
  id: UUID
  email: string
  name: string
  passwordHash: string
  createdAt: Date
}

// Return user to frontend (never include passwordHash)
export type UserPublic = Omit<User, 'passwordHash'>

// ============ GALLERY PIECES ============
export interface Piece {
  id: UUID
  name: string
  collection: string
  glaze: string
  color: string
  type: string
  description: string
  photoUrl: string
}

// ============ USER CREATIONS ============
export interface Creation {
  id: UUID
  userId: UUID
  name: string
  createdAt: Date
  intentDescription: string
  config: {
    shape: string
    glaze: string
    color: string
    size: {
      height: number
      width: number
    }
    details: string[]
    inspiredByPieceId?: UUID
  }
}

// ============ AUTH ============
export interface AuthResponse {
  token: string          // JWT token
  user: UserPublic
  expiresIn: number      // seconds (604800 = 7 days)
}

export interface JWTPayload {
  userId: UUID
  email: string
  iat: number            // issued at
  exp: number            // expires at
}

// ============ API ERRORS ============
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

// ============ TOUR GUIDE ============
export interface TourGuideMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface TourGuideRequest {
  message: string
  conversationHistory?: TourGuideMessage[]
}

export interface TourGuideResponse {
  response: string
  timestamp: Date
}
