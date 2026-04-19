import prisma from "../db/client";
import type { UUID } from "../types";
import { deleteCreation } from "./creationService";

jest.mock("../db/client", () => ({
	creation: { deleteMany: jest.fn() },
}));

const creationId = "creation-uuid" as unknown as UUID;
const ownerId = "owner-uuid" as unknown as UUID;

describe("deleteCreation", () => {
	it("returns true when the creation exists and the user owns it", async () => {
		jest.mocked(prisma.creation.deleteMany).mockResolvedValue({ count: 1 });

		const result = await deleteCreation(creationId, ownerId);

		expect(result).toBe(true);
		expect(prisma.creation.deleteMany).toHaveBeenCalledWith({
			where: { id: creationId, userId: ownerId },
		});
	});

	it.each([
		["creation belongs to another user", "other-uuid"],
		["creation does not exist", "any-uuid"],
	])("returns false when %s", async (_, userId) => {
		jest.mocked(prisma.creation.deleteMany).mockResolvedValue({ count: 0 });

		const result = await deleteCreation(creationId, userId as unknown as UUID);

		expect(result).toBe(false);
	});
});
