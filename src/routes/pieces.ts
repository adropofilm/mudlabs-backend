import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { APIError } from "../middleware/errorHandler";
import {
	getCollections,
	getGlazes,
	getPieceById,
	getPieces,
} from "../services/pieceService";

const router = Router();

/**
 * @openapi
 * /pieces:
 *   get:
 *     tags: [Pieces]
 *     summary: Get all pieces with optional filters
 *     parameters:
 *       - in: query
 *         name: collection
 *         schema: { type: string }
 *       - in: query
 *         name: glaze
 *         schema: { type: string, enum: [matte, glossy, textured] }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of pieces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Piece'
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { collection, glaze, type } = req.query;

		const pieces = await getPieces({
			collection: typeof collection === "string" ? collection : undefined,
			glaze: typeof glaze === "string" ? glaze : undefined,
			type: typeof type === "string" ? type : undefined,
		});

		res.json(pieces);
	} catch (error) {
		next(error);
	}
});

/**
 * @openapi
 * /pieces/meta/collections:
 *   get:
 *     tags: [Pieces]
 *     summary: Get all collection names
 *     responses:
 *       200:
 *         description: List of collection names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
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
 * @openapi
 * /pieces/meta/glazes:
 *   get:
 *     tags: [Pieces]
 *     summary: Get all glaze options
 *     responses:
 *       200:
 *         description: List of glazes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   description: { type: string }
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

/**
 * @openapi
 * /pieces/{id}:
 *   get:
 *     tags: [Pieces]
 *     summary: Get a single piece by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The piece
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Piece'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Piece not found
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const piece = await getPieceById(id);

		if (!piece) {
			throw new APIError("Piece not found", 404);
		}

		res.json(piece);
	} catch (error) {
		next(error);
	}
});

export default router;
