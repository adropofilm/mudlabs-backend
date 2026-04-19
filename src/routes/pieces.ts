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
