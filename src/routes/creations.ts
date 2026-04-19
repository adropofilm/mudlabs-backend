import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { authMiddleware, requireUserId } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";
import { imageGenerationLimiter } from "../middleware/rateLimit";
import { validateUUID } from "../middleware/validate";
import {
	createCreation,
	deleteCreation,
	getUserCreations,
} from "../services/creationService";
import { generateCreationImage } from "../services/imageService";
import { getPieceById } from "../services/pieceService";
import type { CreationConfig, UUID } from "../types";

const router = Router();

/**
 * @openapi
 * /creations/generate-image:
 *   post:
 *     tags: [Creations]
 *     summary: Generate an AI image from a pottery config
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [config]
 *             properties:
 *               config: { $ref: '#/components/schemas/CreationConfig' }
 *     responses:
 *       200:
 *         description: Generated image URL and prompt used
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl: { type: string }
 *                 promptUsed: { type: string }
 *       400:
 *         description: Missing config
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
	"/generate-image",
	authMiddleware,
	imageGenerationLimiter,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { config }: { config: CreationConfig } = req.body;

			if (!config) {
				throw new APIError("Missing required field: config", 400);
			}

			const inspiredBy = config.inspiredByPieceId
				? await getPieceById(config.inspiredByPieceId)
				: undefined;

			if (config.inspiredByPieceId && !inspiredBy) {
				throw new APIError("Piece not found", 404);
			}

			const result = await generateCreationImage(
				config,
				inspiredBy ?? undefined,
			);
			res.json(result);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * @openapi
 * /creations:
 *   post:
 *     tags: [Creations]
 *     summary: Save a custom piece creation
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
 *               config: { $ref: '#/components/schemas/CreationConfig' }
 *               imageUrl: { type: string }
 *     responses:
 *       201:
 *         description: Creation saved
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
			const { name, intentDescription, config, imageUrl } = req.body;
			const userId = requireUserId(req);

			if (!name || !config) {
				throw new APIError("Missing required fields", 400);
			}

			const creation = await createCreation(userId, {
				name,
				intentDescription,
				config,
				imageUrl,
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

			const creations = await getUserCreations(requireUserId(req));
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
			const userId = requireUserId(req);

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
