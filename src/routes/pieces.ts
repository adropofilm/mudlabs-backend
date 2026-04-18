import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { APIError } from "../middleware/errorHandler";
import { validateUUID } from "../middleware/validate";
import {
	getCollections,
	getGlazes,
	getPieceById,
	getPieces,
} from "../services/pieceService";

const router = Router();

/**
 * GET /pieces
 * Get all pieces with optional filtering
 * Query: ?collection=, ?glaze=, ?type=
 * Response: Piece[]
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { collection, glaze, type } = req.query;

		// TODO: Implement filtering
		const pieces = await getPieces({
			collection: collection as string,
			glaze: glaze as string,
			type: type as string,
		});

		res.json(pieces);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /pieces/:id
 * Get single piece
 * Response: Piece
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		validateUUID(id, "piece ID");
		const piece = await getPieceById(id);

		if (!piece) {
			throw new APIError("Piece not found", 404);
		}

		res.json(piece);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /collections
 * Get list of all collections
 * Response: string[]
 */
router.get(
	"/meta/collections",
	async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const collections = await getCollections();
			res.json(collections);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * GET /glazes
 * Get list of all glazes
 * Response: { name, description }[]
 */
router.get(
	"/meta/glazes",
	async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const glazes = await getGlazes();
			res.json(glazes);
		} catch (error) {
			next(error);
		}
	},
);

export default router;
