import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";
import type { CreationConfig } from "../types";
import { buildImagePrompt, generateCreationImage } from "./imageService";

jest.mock("openai", () => {
	const mockGenerate = jest.fn();
	const MockOpenAI = jest.fn().mockImplementation(() => ({
		images: { generate: mockGenerate },
	}));
	(MockOpenAI as unknown as Record<string, unknown>).__mockGenerate =
		mockGenerate;
	return { default: MockOpenAI, __esModule: true };
});

jest.mock("cloudinary", () => {
	const mockUpload = jest.fn();
	const v2 = { uploader: { upload: mockUpload }, __mockUpload: mockUpload };
	return { __esModule: true, v2 };
});

const mockGenerate = (OpenAI as unknown as Record<string, jest.Mock>)
	.__mockGenerate;
const mockUpload = (cloudinary as unknown as Record<string, jest.Mock>)
	.__mockUpload;

const baseConfig: CreationConfig = {
	shape: "bowl",
	glaze: "matte",
	color: "sage green",
	size: { height: 10, width: 12 },
	details: ["carved leaf pattern", "foot ring"],
};

describe("buildImagePrompt", () => {
	it("includes shape, glaze, and color in the prompt", () => {
		const prompt = buildImagePrompt(baseConfig);
		expect(prompt).toContain("bowl");
		expect(prompt).toContain("matte");
		expect(prompt).toContain("sage green");
	});

	it("includes details when provided", () => {
		const prompt = buildImagePrompt(baseConfig);
		expect(prompt).toContain("carved leaf pattern");
		expect(prompt).toContain("foot ring");
	});

	it("describes wide and shallow for width > height", () => {
		const prompt = buildImagePrompt({
			...baseConfig,
			size: { height: 5, width: 20 },
		});
		expect(prompt).toContain("wide and shallow");
	});

	it("describes tall and narrow for height > width", () => {
		const prompt = buildImagePrompt({
			...baseConfig,
			size: { height: 30, width: 10 },
		});
		expect(prompt).toContain("tall and narrow");
	});

	it("omits detail clause when details array is empty", () => {
		const prompt = buildImagePrompt({ ...baseConfig, details: [] });
		expect(prompt).not.toContain(", with ");
	});
});

describe("generateCreationImage", () => {
	beforeEach(() => {
		mockUpload.mockResolvedValue({
			secure_url:
				"https://res.cloudinary.com/deusi5if4/image/upload/mudlab/creations/abc123.png",
		});
	});

	it("returns imageUrl and promptUsed", async () => {
		mockGenerate.mockResolvedValue({
			data: [
				{ url: "https://oaidalleapiprodscus.blob.core.windows.net/temp.png" },
			],
		});

		const result = await generateCreationImage(baseConfig);

		expect(result.imageUrl).toBe(
			"https://res.cloudinary.com/deusi5if4/image/upload/mudlab/creations/abc123.png",
		);
		expect(result.promptUsed).toContain("bowl");
	});

	it("uploads to cloudinary with correct folder", async () => {
		mockGenerate.mockResolvedValue({
			data: [
				{ url: "https://oaidalleapiprodscus.blob.core.windows.net/temp.png" },
			],
		});

		await generateCreationImage(baseConfig);

		expect(mockUpload).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ folder: "mudlab/creations" }),
		);
	});

	it("throws if OpenAI returns no image data", async () => {
		mockGenerate.mockResolvedValue({ data: [] });

		await expect(generateCreationImage(baseConfig)).rejects.toThrow(
			"No image returned from OpenAI",
		);
	});
});
