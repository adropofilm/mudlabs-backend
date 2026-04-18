import prisma from "../db/client";
import type { Creation, UUID } from "../types";

interface CreateCreationInput {
	name: string;
	intentDescription: string;
	config: Creation["config"];
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
			config: data.config,
		},
	});
	return creation as unknown as Creation;
}

export async function getUserCreations(userId: UUID): Promise<Creation[]> {
	const creations = await prisma.creation.findMany({ where: { userId } });
	return creations as unknown as Creation[];
}

export async function deleteCreation(
	creationId: UUID,
	userId: UUID,
): Promise<boolean> {
	const creation = await prisma.creation.findFirst({
		where: { id: creationId, userId },
	});
	if (!creation) return false;

	await prisma.creation.delete({ where: { id: creationId } });
	return true;
}
