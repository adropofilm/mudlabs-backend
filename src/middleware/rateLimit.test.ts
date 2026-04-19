import request from "supertest";
import app from "../app";

jest.mock("../db/client", () => ({
	user: { findUnique: jest.fn(), create: jest.fn() },
	refreshToken: {
		create: jest.fn(),
		findUnique: jest.fn(),
		deleteMany: jest.fn(),
	},
	piece: { findMany: jest.fn(), findUnique: jest.fn() },
	creation: {
		create: jest.fn(),
		findMany: jest.fn(),
		deleteMany: jest.fn(),
	},
}));

jest.mock("../services/authService", () => ({
	register: jest.fn().mockResolvedValue({
		accessToken: "t",
		refreshToken: "r",
		user: {},
		expiresIn: 900,
	}),
	login: jest.fn().mockResolvedValue({
		accessToken: "t",
		refreshToken: "r",
		user: {},
		expiresIn: 900,
	}),
	logout: jest.fn().mockResolvedValue(undefined),
	refreshAccessToken: jest
		.fn()
		.mockResolvedValue({ accessToken: "t", expiresIn: 900 }),
}));

jest.mock("../services/tourGuideService", () => ({
	askTourGuide: jest
		.fn()
		.mockResolvedValue({ response: "Hello!", timestamp: new Date() }),
}));

jest.mock("../services/imageService", () => ({
	generateCreationImage: jest.fn().mockResolvedValue({
		imageUrl: "https://res.cloudinary.com/test/image.png",
		promptUsed: "A ceramic bowl",
	}),
}));

jest.mock("../middleware/auth", () => ({
	authMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const validAuth = { email: "test@example.com", password: "password123" };

describe("auth rate limiter", () => {
	it("allows requests under the limit", async () => {
		const res = await request(app).post("/auth/login").send(validAuth);
		expect(res.status).not.toBe(429);
	});

	it("blocks requests after 10 attempts within 15 minutes", async () => {
		const requests = Array.from({ length: 11 }, () =>
			request(app).post("/auth/login").send(validAuth),
		);
		const responses = await Promise.all(requests);
		const blocked = responses.filter((r) => r.status === 429);
		expect(blocked.length).toBeGreaterThan(0);
		expect(blocked[0].body.message).toBe("Try again in 15 minutes");
	});

	it("returns 429 with RateLimit headers", async () => {
		const requests = Array.from({ length: 11 }, () =>
			request(app)
				.post("/auth/register")
				.send({ ...validAuth, name: "Test" }),
		);
		const responses = await Promise.all(requests);
		const blocked = responses.find((r) => r.status === 429);
		expect(blocked?.headers["ratelimit-limit"]).toBeDefined();
		expect(blocked?.headers["ratelimit-remaining"]).toBeDefined();
	});
});

describe("tour guide rate limiter", () => {
	it("allows the first request", async () => {
		const res = await request(app)
			.post("/tour-guide/ask")
			.send({ message: "What is pottery?" });
		expect(res.status).not.toBe(429);
	});

	it("blocks a second request within 30 seconds", async () => {
		const [first, second] = await Promise.all([
			request(app).post("/tour-guide/ask").send({ message: "First question" }),
			request(app).post("/tour-guide/ask").send({ message: "Second question" }),
		]);
		const statuses = [first.status, second.status];
		expect(statuses).toContain(429);
		const blocked = [first, second].find((r) => r.status === 429);
		expect(blocked?.body.message).toBe("Wait 30 seconds before asking again");
	});
});
