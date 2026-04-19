import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";
import type { CreationConfig, GenerateImageResponse, Piece } from "../types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function buildImagePrompt(
	config: CreationConfig,
	inspiredBy?: Piece,
): string {
	const { shape, glaze, color, size, details } = config;

	const sizeDescription =
		size.height > size.width
			? "tall and narrow"
			: size.height < size.width
				? "wide and shallow"
				: "balanced proportions";

	const detailsPart = details.length > 0 ? `, with ${details.join(", ")}` : "";

	const inspirationPart = inspiredBy
		? ` Inspired by the "${inspiredBy.name}" piece, featuring ${inspiredBy.color} tones and a ${inspiredBy.glaze} glaze.`
		: "";

	return (
		`A handmade ceramic ${shape}, ${color} with a ${glaze} glaze, ${sizeDescription}${detailsPart}.${inspirationPart} ` +
		"Studio pottery photography, soft natural light, clean background, high detail."
	);
}

export async function generateCreationImage(
	config: CreationConfig,
	inspiredBy?: Piece,
): Promise<GenerateImageResponse> {
	const prompt = buildImagePrompt(config, inspiredBy);

	const response = await openai.images.generate({
		model: "dall-e-3",
		prompt,
		n: 1,
		size: "1024x1024",
		quality: "standard",
	});

	const tempUrl = response.data?.[0]?.url;
	if (!tempUrl) {
		throw new Error("No image returned from OpenAI");
	}

	const uploaded = await cloudinary.uploader.upload(tempUrl, {
		folder: "mudlab/creations",
		resource_type: "image",
	});

	return {
		imageUrl: uploaded.secure_url,
		promptUsed: prompt,
	};
}
