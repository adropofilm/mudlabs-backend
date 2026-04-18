import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../types'

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message)
  }
}

export const errorHandler = (
  error: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error)

  if (error instanceof APIError) {
    const response: ErrorResponse = {
      error: error.message,
      message: error.message,
      statusCode: error.statusCode,
    }
    return res.status(error.statusCode).json(response)
  }

  // Generic error
  const response: ErrorResponse = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    statusCode: 500,
  }
  res.status(500).json(response)
}
