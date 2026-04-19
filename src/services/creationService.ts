import type { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../db/client";
import type { Creation, CreationConfig } from "../types";

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
		id: raw.id,
		userId: raw.userId,
		name: raw.name,
		intentDescription: raw.intentDescription ?? undefined,
		config: raw.config as unknown as CreationConfig,
		imageUrl: raw.imageUrl ?? undefined,
		createdAt: raw.createdAt,
	};
}

export async function createCreation(
	userId: string,
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

export async function getUserCreations(userId: string): Promise<Creation[]> {
	const creations = await prisma.creation.findMany({ where: { userId } });
	return creations.map(toDomain);
}

function extractCloudinaryPublicId(url: string): string | null {
	const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
	return match ? match[1] : null;
}

export async function deleteCreation(
	creationId: string,
	userId: string,
): Promise<boolean> {
	const creation = await prisma.creation.findUnique({
		where: { id: creationId },
		select: { imageUrl: true },
	});

	const { count } = await prisma.creation.deleteMany({
		where: { id: creationId, userId },
	});

	if (count > 0 && creation?.imageUrl) {
		const publicId = extractCloudinaryPublicId(creation.imageUrl);
		if (publicId) {
			try {
				await cloudinary.uploader.destroy(publicId);
			} catch (err) {
				console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
			}
		}
	}

	return count > 0;
}
