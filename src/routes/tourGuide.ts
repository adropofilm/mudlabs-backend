import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware } from '../middleware/auth'
import { askTourGuide } from '../services/tourGuideService'
import { APIError } from '../middleware/errorHandler'
import { TourGuideRequest } from '../types'

const router = Router()

/**
 * POST /tour-guide/ask
 * Ask the AI tour guide a question (requires auth)
 * Body: { message: string, conversationHistory?: TourGuideMessage[] }
 * Response: { response: string, timestamp: Date }
 */
router.post('/ask', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversationHistory } = req.body as TourGuideRequest

    // TODO: Validate input
    if (!message || message.trim().length === 0) {
      throw new APIError('Message cannot be empty', 400)
    }

    const response = await askTourGuide(message, conversationHistory)
    res.json(response)
  } catch (error) {
    next(error)
  }
})

export default router
