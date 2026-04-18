import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload, UUID } from '../types'

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: UUID
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
        statusCode: 401,
      })
    }

    const token = authHeader.slice(7) // Remove 'Bearer ' prefix

    // Verify JWT signature
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }

    const payload = jwt.verify(token, secret) as JWTPayload

    // Attach userId to request
    req.userId = payload.userId

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
        statusCode: 401,
      })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: 401,
      })
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
      statusCode: 401,
    })
  }
}
