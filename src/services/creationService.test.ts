import prisma from "../db/client";
import type { UUID } from "../types";
import { deleteCreation } from "./creationService";

jest.mock("../db/client", () => ({
	creation: { findFirst: jest.fn(), delete: jest.fn() },
}));

const creationId = "creation-uuid" as unknown as UUID;
const ownerId = "owner-uuid" as unknown as UUID;
const mockCreation = {
	id: creationId,
	userId: ownerId,
	name: "Test Creation",
	intentDescription: null,
	config: {},
	createdAt: new Date("2026-01-01"),
};

type PrismaCreation = typeof mockCreation;

describe("deleteCreation", () => {
	it("returns true and deletes the creation when the user owns it", async () => {
		jest
			.mocked(prisma.creation.findFirst)
			.mockResolvedValue(mockCreation as unknown as PrismaCreation);
		jest
			.mocked(prisma.creation.delete)
			.mockResolvedValue(mockCreation as unknown as PrismaCreation);

		const result = await deleteCreation(creationId, ownerId);

		expect(result).toBe(true);
		expect(prisma.creation.delete).toHaveBeenCalledWith({
			where: { id: creationId },
		});
	});

	it.each([
		["creation belongs to another user", "other-uuid"],
		["creation does not exist", "any-uuid"],
	])("returns false and does not delete when %s", async (_, userId) => {
		jest.mocked(prisma.creation.findFirst).mockResolvedValue(null);

		const result = await deleteCreation(creationId, userId as unknown as UUID);

		expect(result).toBe(false);
		expect(prisma.creation.delete).not.toHaveBeenCalled();
	});
});
