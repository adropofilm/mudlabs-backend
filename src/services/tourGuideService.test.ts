import OpenAI from "openai";
import type { TourGuideMessage } from "../types";
import { askTourGuide } from "./tourGuideService";

jest.mock("openai", () => {
	const mockCreate = jest.fn();
	const MockOpenAI = jest.fn().mockImplementation(() => ({
		chat: { completions: { create: mockCreate } },
	}));
	(MockOpenAI as unknown as Record<string, unknown>).__mockCreate = mockCreate;
	return { default: MockOpenAI, __esModule: true };
});

const mockCreate = (OpenAI as unknown as Record<string, jest.Mock>)
	.__mockCreate;

const makeCompletion = (content: string | null) => ({
	choices: [{ message: { content } }],
});

describe("askTourGuide", () => {
	beforeEach(() => {
		process.env.OPENAI_API_KEY = "test-key";
	});

	it("returns the assistant response and a timestamp", async () => {
		mockCreate.mockResolvedValue(makeCompletion("Hello from the guide!"));

		const result = await askTourGuide("What is a glaze?");

		expect(result.response).toBe("Hello from the guide!");
		expect(result.timestamp).toBeInstanceOf(Date);
	});

	it("sends system message first, then user message last", async () => {
		mockCreate.mockResolvedValue(makeCompletion("Sure!"));

		await askTourGuide("Tell me about matte glaze");

		const { messages } = mockCreate.mock.calls[0][0];
		expect(messages[0].role).toBe("system");
		expect(messages.at(-1)).toEqual({
			role: "user",
			content: "Tell me about matte glaze",
		});
	});

	it("includes conversation history between system and user messages", async () => {
		mockCreate.mockResolvedValue(makeCompletion("Great follow-up!"));

		const history: TourGuideMessage[] = [
			{ role: "user", content: "What is pottery?", timestamp: new Date() },
			{ role: "assistant", content: "Pottery is...", timestamp: new Date() },
		];

		await askTourGuide("Tell me more", history);

		const { messages } = mockCreate.mock.calls[0][0];
		expect(messages).toHaveLength(4); // system + 2 history + user
		expect(messages[1]).toEqual({ role: "user", content: "What is pottery?" });
		expect(messages[2]).toEqual({
			role: "assistant",
			content: "Pottery is...",
		});
		expect(messages[3]).toEqual({ role: "user", content: "Tell me more" });
	});

	it("omits timestamp from history messages sent to OpenAI", async () => {
		mockCreate.mockResolvedValue(makeCompletion("Ok"));

		const history: TourGuideMessage[] = [
			{ role: "user", content: "Hi", timestamp: new Date() },
		];

		await askTourGuide("Hello", history);

		const { messages } = mockCreate.mock.calls[0][0];
		expect(messages[1]).not.toHaveProperty("timestamp");
	});

	it("works with no conversation history", async () => {
		mockCreate.mockResolvedValue(makeCompletion("Welcome!"));

		await askTourGuide("Hi");

		const { messages } = mockCreate.mock.calls[0][0];
		expect(messages).toHaveLength(2); // system + user
	});

	it("falls back to empty string if OpenAI returns null content", async () => {
		mockCreate.mockResolvedValue(makeCompletion(null));

		const result = await askTourGuide("anything");

		expect(result.response).toBe("");
	});
});
