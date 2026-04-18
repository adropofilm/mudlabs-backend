import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { authMiddleware } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";
import { tourGuideLimiter } from "../middleware/rateLimit";
import { askTourGuide } from "../services/tourGuideService";
import type { TourGuideRequest } from "../types";

const router = Router();

/**
 * @openapi
 * /tour-guide/ask:
 *   post:
 *     tags: [Tour Guide]
 *     summary: Ask the AI pottery tour guide a question
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *                     timestamp: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Tour guide response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response: { type: string }
 *                 timestamp: { type: string, format: date-time }
 *       400:
 *         description: Message cannot be empty
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit — wait 30 seconds
 */
router.post(
	"/ask",
	authMiddleware,
	tourGuideLimiter,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { message, conversationHistory } = req.body as TourGuideRequest;

			if (!message || message.trim().length === 0) {
				throw new APIError("Message cannot be empty", 400);
			}

			const response = await askTourGuide(message, conversationHistory);
			res.json(response);
		} catch (error) {
			next(error);
		}
	},
);

export default router;
