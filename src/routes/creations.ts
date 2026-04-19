import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { authMiddleware, requireUserId } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";
import { imageGenerationLimiter } from "../middleware/rateLimit";
import {
	createCreation,
	deleteCreation,
	getUserCreations,
} from "../services/creationService";
import { generateCreationImage } from "../services/imageService";
import { getPieceById } from "../services/pieceService";
import type { CreationConfig, UUID } from "../types";

const router = Router();

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

router.post(
	"/",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name, intentDescription, config, imageUrl } = req.body;
			const userId = requireUserId(req);

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

router.delete(
	"/:id",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const userId = requireUserId(req);

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
