import prisma from "../db/client";
import {
	getCollections,
	getGlazes,
	getPieceById,
	getPieces,
} from "./pieceService";

jest.mock("../db/client", () => ({
	piece: {
		findMany: jest.fn(),
		findUnique: jest.fn(),
	},
}));

const makePiece = (overrides: object = {}) => ({
	id: "piece-uuid",
	name: "Test Bowl",
	collection: "Spring",
	glaze: "matte",
	color: "white",
	type: "bowl",
	description: "A test bowl",
	photoUrl: "https://example.com/bowl.jpg",
	...overrides,
});

describe("getPieces", () => {
	it("returns all pieces when no filters are provided", async () => {
		const pieces = [makePiece()];
		jest.mocked(prisma.piece.findMany).mockResolvedValue(pieces as never);

		const result = await getPieces({});

		expect(result).toEqual(pieces);
		expect(prisma.piece.findMany).toHaveBeenCalledWith({ where: {} });
	});

	it("filters by collection", async () => {
		jest.mocked(prisma.piece.findMany).mockResolvedValue([] as never);

		await getPieces({ collection: "Spring" });

		expect(prisma.piece.findMany).toHaveBeenCalledWith({
			where: { collection: "Spring" },
		});
	});

	it("filters by glaze", async () => {
		jest.mocked(prisma.piece.findMany).mockResolvedValue([] as never);

		await getPieces({ glaze: "matte" });

		expect(prisma.piece.findMany).toHaveBeenCalledWith({
			where: { glaze: "matte" },
		});
	});

	it("filters by type", async () => {
		jest.mocked(prisma.piece.findMany).mockResolvedValue([] as never);

		await getPieces({ type: "bowl" });

		expect(prisma.piece.findMany).toHaveBeenCalledWith({
			where: { type: "bowl" },
		});
	});

	it("combines multiple filters", async () => {
		jest.mocked(prisma.piece.findMany).mockResolvedValue([] as never);

		await getPieces({ collection: "Spring", glaze: "glossy", type: "vase" });

		expect(prisma.piece.findMany).toHaveBeenCalledWith({
			where: { collection: "Spring", glaze: "glossy", type: "vase" },
		});
	});
});

describe("getPieceById", () => {
	it("returns the piece when found", async () => {
		const piece = makePiece();
		jest.mocked(prisma.piece.findUnique).mockResolvedValue(piece as never);

		const result = await getPieceById("piece-uuid");

		expect(result).toEqual(piece);
		expect(prisma.piece.findUnique).toHaveBeenCalledWith({
			where: { id: "piece-uuid" },
		});
	});

	it("returns null when piece does not exist", async () => {
		jest.mocked(prisma.piece.findUnique).mockResolvedValue(null);

		const result = await getPieceById("missing-uuid");

		expect(result).toBeNull();
	});
});

describe("getCollections", () => {
	it("returns a sorted, deduplicated list of collection names", async () => {
		jest
			.mocked(prisma.piece.findMany)
			.mockResolvedValue([
				{ collection: "Winter" },
				{ collection: "Spring" },
				{ collection: "Winter" },
			] as never);

		const result = await getCollections();

		expect(result).toEqual(["Spring", "Winter"]);
	});

	it("returns an empty array when there are no pieces", async () => {
		jest.mocked(prisma.piece.findMany).mockResolvedValue([] as never);

		const result = await getCollections();

		expect(result).toEqual([]);
	});
});

describe("getGlazes", () => {
	it("returns the three standard glaze options", async () => {
		const result = await getGlazes();

		expect(result).toEqual([
			{ name: "matte", description: "Non-shiny, velvety finish" },
			{ name: "glossy", description: "Shiny, reflective surface" },
			{ name: "textured", description: "Rough, tactile surface" },
		]);
	});
});
