import prisma from "../db/client";
import { deleteCreation } from "./creationService";

jest.mock("../db/client", () => ({
	creation: {
		deleteMany: jest.fn(),
		findUnique: jest.fn(),
	},
}));

jest.mock("cloudinary", () => ({
	v2: { uploader: { destroy: jest.fn() } },
}));

import { v2 as cloudinary } from "cloudinary";

const creationId = "creation-uuid";
const ownerId = "owner-uuid";
const imageUrl =
	"https://res.cloudinary.com/demo/image/upload/v1/mudlab/creations/abc123.png";

describe("deleteCreation", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(cloudinary.uploader.destroy).mockResolvedValue({} as never);
	});

	it("returns true and deletes the Cloudinary image when creation has an image", async () => {
		jest
			.mocked(prisma.creation.findUnique)
			.mockResolvedValue({ imageUrl } as never);
		jest.mocked(prisma.creation.deleteMany).mockResolvedValue({ count: 1 });

		const result = await deleteCreation(creationId, ownerId);

		expect(result).toBe(true);
		expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
			"mudlab/creations/abc123",
		);
	});

	it("returns true and skips Cloudinary when creation has no image", async () => {
		jest
			.mocked(prisma.creation.findUnique)
			.mockResolvedValue({ imageUrl: null } as never);
		jest.mocked(prisma.creation.deleteMany).mockResolvedValue({ count: 1 });

		const result = await deleteCreation(creationId, ownerId);

		expect(result).toBe(true);
		expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
	});

	it("still returns true if Cloudinary deletion fails", async () => {
		jest
			.mocked(prisma.creation.findUnique)
			.mockResolvedValue({ imageUrl } as never);
		jest.mocked(prisma.creation.deleteMany).mockResolvedValue({ count: 1 });
		jest
			.mocked(cloudinary.uploader.destroy)
			.mockRejectedValue(new Error("Cloudinary error"));

		const result = await deleteCreation(creationId, ownerId);

		expect(result).toBe(true);
	});

	it.each([
		["creation belongs to another user", "other-uuid"],
		["creation does not exist", "any-uuid"],
	])("returns false and skips Cloudinary when %s", async (_, userId) => {
		jest
			.mocked(prisma.creation.findUnique)
			.mockResolvedValue({ imageUrl } as never);
		jest.mocked(prisma.creation.deleteMany).mockResolvedValue({ count: 0 });

		const result = await deleteCreation(creationId, userId);

		expect(result).toBe(false);
		expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
	});
});
