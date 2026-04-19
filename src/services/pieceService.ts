import prisma from "../db/client";
import type { Piece, UUID } from "../types";

interface FilterOptions {
	collection?: string;
	glaze?: string;
	type?: string;
}

type PrismaPiece = {
	id: string;
	name: string;
	collection: string;
	glaze: string;
	color: string;
	type: string;
	description: string;
	photoUrl: string;
};

function toDomain(raw: PrismaPiece): Piece {
	return { ...raw, id: raw.id as UUID };
}

export async function getPieces(filters: FilterOptions): Promise<Piece[]> {
	const pieces = await prisma.piece.findMany({
		where: {
			...(filters.collection && { collection: filters.collection }),
			...(filters.glaze && { glaze: filters.glaze }),
			...(filters.type && { type: filters.type }),
		},
	});
	return pieces.map(toDomain);
}

export async function getPieceById(id: string): Promise<Piece | null> {
	const piece = await prisma.piece.findUnique({ where: { id } });
	return piece ? toDomain(piece) : null;
}

export async function getCollections(): Promise<string[]> {
	const pieces = await prisma.piece.findMany({ select: { collection: true } });
	return Array.from<string>(new Set(pieces.map((p) => p.collection))).sort();
}

export async function getGlazes(): Promise<
	Array<{ name: string; description: string }>
> {
	return [
		{ name: "matte", description: "Non-shiny, velvety finish" },
		{ name: "glossy", description: "Shiny, reflective surface" },
		{ name: "textured", description: "Rough, tactile surface" },
	];
}
