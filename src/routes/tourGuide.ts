import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { authMiddleware } from "../middleware/auth";
import { tourGuideLimiter } from "../middleware/rateLimit";
import { askTourGuide } from "../services/tourGuideService";
import type { TourGuideRequest } from "../types";

const router = Router();

router.post(
	"/ask",
	authMiddleware,
	tourGuideLimiter,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { message, conversationHistory } = req.body as TourGuideRequest;

			const response = await askTourGuide(message, conversationHistory);
			res.json(response);
		} catch (error) {
			next(error);
		}
	},
);

export default router;
