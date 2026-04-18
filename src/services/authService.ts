import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserPublic, AuthResponse, UUID } from '../types'
import { APIError } from '../middleware/errorHandler'
import prisma from '../db/client'

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new APIError('Email already registered', 409)

  const passwordHash = await bcryptjs.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  })

  const token = generateToken(user.id as UUID, user.email)
  return { token, user: userToPublic(user), expiresIn: 604800 }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new APIError('Invalid email or password', 401)

  const isPasswordValid = await bcryptjs.compare(password, user.passwordHash)
  if (!isPasswordValid) throw new APIError('Invalid email or password', 401)

  const token = generateToken(user.id as UUID, user.email)
  return { token, user: userToPublic(user), expiresIn: 604800 }
}

export function generateToken(userId: UUID, email: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  )
}

function userToPublic(user: { id: string; email: string; name: string; createdAt: Date }): UserPublic {
  return {
    id: user.id as UUID,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }
}
