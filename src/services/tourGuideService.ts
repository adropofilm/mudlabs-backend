import OpenAI from "openai";
import type { TourGuideMessage, TourGuideResponse } from "../types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askTourGuide(
	message: string,
	conversationHistory?: TourGuideMessage[],
): Promise<TourGuideResponse> {
	const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
		role: "system",
		content: buildSystemPrompt(),
	};

	const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = (
		conversationHistory ?? []
	).map(({ role, content }) => ({ role, content }));

	const userMessage: OpenAI.Chat.ChatCompletionMessageParam = {
		role: "user",
		content: message,
	};

	const messages = [systemMessage, ...historyMessages, userMessage];

	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages,
	});

	return {
		response: completion.choices[0].message.content ?? "",
		timestamp: new Date(),
	};
}

function buildSystemPrompt(): string {
	return `You are a friendly pottery expert tour guide for the MudLab gallery.
Your role is to help visitors understand pottery, glazes, techniques, and our collection.
Always explain pottery terms in concise beginner-friendly language.
Never use jargon without explaining it.
Be encouraging and help people learn about ceramic art.

Gallery Information:
- We create handmade pottery pieces
- We have several glaze options: matte, glossy, textured
- Users can browse our collection or create custom pieces
- A piece includes: shape, glaze, color, size, and optional details

Be helpful, knowledgeable, and warm in your responses.`;
}
