import type { Prisma } from "@prisma/client";
import prisma from "../db/client";
import type { Creation, CreationConfig, UUID } from "../types";

interface CreateCreationInput {
	name: string;
	intentDescription?: string;
	config: CreationConfig;
	imageUrl?: string;
}

type PrismaCreation = {
	id: string;
	userId: string;
	name: string;
	intentDescription: string | null;
	config: Prisma.JsonValue;
	imageUrl: string | null;
	createdAt: Date;
};

function toDomain(raw: PrismaCreation): Creation {
	return {
		id: raw.id as UUID,
		userId: raw.userId as UUID,
		name: raw.name,
		intentDescription: raw.intentDescription ?? undefined,
		config: raw.config as unknown as CreationConfig,
		imageUrl: raw.imageUrl ?? undefined,
		createdAt: raw.createdAt,
	};
}

export async function createCreation(
	userId: UUID,
	data: CreateCreationInput,
): Promise<Creation> {
	const creation = await prisma.creation.create({
		data: {
			userId,
			name: data.name,
			intentDescription: data.intentDescription,
			config: data.config as unknown as Prisma.InputJsonValue,
			imageUrl: data.imageUrl,
		},
	});
	return toDomain(creation);
}

export async function getUserCreations(userId: UUID): Promise<Creation[]> {
	const creations = await prisma.creation.findMany({ where: { userId } });
	return creations.map(toDomain);
}

export async function deleteCreation(
	creationId: UUID,
	userId: UUID,
): Promise<boolean> {
	const { count } = await prisma.creation.deleteMany({
		where: { id: creationId, userId },
	});
	return count > 0;
}
