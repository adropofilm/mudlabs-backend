import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { authMiddleware } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";
import { validateUUID } from "../middleware/validate";
import {
	createCreation,
	deleteCreation,
	getUserCreations,
} from "../services/creationService";
import type { UUID } from "../types";

const router = Router();

/**
 * POST /creations
 * Create new custom piece (requires auth)
 * Body: { name, intentDescription, config }
 * Response: Creation
 */
router.post(
	"/",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name, intentDescription, config } = req.body;
			const userId = req.userId as UUID;

			if (!name || !config) {
				throw new APIError("Missing required fields", 400);
			}

			const creation = await createCreation(userId, {
				name,
				intentDescription,
				config,
			});

			res.status(201).json(creation);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * GET /users/:userId/creations
 * Get all creations for a user (requires auth)
 * Response: Creation[]
 */
router.get(
	"/users/:userId",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId } = req.params;
			const currentUserId = req.userId;

			// TODO: Check if user is requesting their own creations or is admin
			if (userId !== currentUserId) {
				throw new APIError("Forbidden", 403);
			}

			const creations = await getUserCreations(userId as UUID);
			res.json(creations);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * DELETE /creations/:id
 * Delete a creation (requires auth, must be owner)
 * Response: { success: boolean }
 */
router.delete(
	"/:id",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const userId = req.userId as UUID;

			// TODO: Verify ownership before deleting
			validateUUID(id, "creation ID");
			const success = await deleteCreation(id as UUID, userId);

			if (!success) {
				throw new APIError("Creation not found or unauthorized", 404);
			}

			res.json({ success: true });
		} catch (error) {
			next(error);
		}
	},
);

export default router;
