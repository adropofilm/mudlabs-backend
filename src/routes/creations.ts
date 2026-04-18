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
 * @openapi
 * /creations:
 *   post:
 *     tags: [Creations]
 *     summary: Create a custom piece
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, config]
 *             properties:
 *               name: { type: string }
 *               intentDescription: { type: string }
 *               config: { type: object }
 *     responses:
 *       201:
 *         description: Creation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creation'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
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
 * @openapi
 * /creations/users/{userId}:
 *   get:
 *     tags: [Creations]
 *     summary: Get all creations for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of creations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Creation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
	"/users/:userId",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId } = req.params;
			const currentUserId = req.userId;

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
 * @openapi
 * /creations/{id}:
 *   delete:
 *     tags: [Creations]
 *     summary: Delete a creation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Creation not found or unauthorized
 */
router.delete(
	"/:id",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const userId = req.userId as UUID;

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
