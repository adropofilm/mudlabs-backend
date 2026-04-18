import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, UserPublic, AuthResponse, UUID, createUUID } from '../types'
import { APIError } from '../middleware/errorHandler'
import { readDB, writeDB } from '../db/helpers'

/**
 * Register a new user
 * 1. Check if email already exists
 * 2. Hash password with bcryptjs
 * 3. Store user in database
 * 4. Generate JWT token
 * 5. Return token + user (without passwordHash)
 */
export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  // TODO: Validate email format
  // TODO: Validate password strength (min 8 chars, etc.)

  const users = await readDB<User>('users')

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    throw new APIError('Email already registered', 409)
  }

  // Hash password
  const passwordHash = await bcryptjs.hash(password, 10)

  // Create user
  const user: User = {
    id: createUUID(),
    email,
    name,
    passwordHash,
    createdAt: new Date(),
  }

  // Save to database
  users.push(user)
  await writeDB('users', users)

  // Generate JWT token
  const token = generateToken(user.id, user.email)

  return {
    token,
    user: userToPublic(user),
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800'),
  }
}

/**
 * Login user
 * 1. Find user by email
 * 2. Compare password with hash
 * 3. Generate JWT token
 * 4. Return token + user
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const users = await readDB<User>('users')
  const user = users.find((u) => u.email === email)

  if (!user) {
    throw new APIError('Invalid email or password', 401)
  }

  // Compare password with hash
  const isPasswordValid = await bcryptjs.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    throw new APIError('Invalid email or password', 401)
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email)

  return {
    token,
    user: userToPublic(user),
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800'),
  }
}

/**
 * Generate JWT token
 * Payload: { userId, email, iat, exp }
 */
export function generateToken(userId: UUID, email: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * Convert User to UserPublic (remove passwordHash)
 */
function userToPublic(user: User): UserPublic {
  const { passwordHash, ...publicUser } = user
  return publicUser
}
