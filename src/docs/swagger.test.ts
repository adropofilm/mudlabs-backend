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

jest.mock("../middleware/auth", () => ({
	authMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("../services/tourGuideService", () => ({
	askTourGuide: jest
		.fn()
		.mockResolvedValue({ response: "Hello!", timestamp: new Date() }),
}));

describe("request validation — /auth/register", () => {
	it("rejects missing email", async () => {
		const res = await request(app)
			.post("/auth/register")
			.send({ password: "password123", name: "Test" });
		expect(res.status).toBe(400);
	});

	it("rejects missing password", async () => {
		const res = await request(app)
			.post("/auth/register")
			.send({ email: "test@example.com", name: "Test" });
		expect(res.status).toBe(400);
	});

	it("rejects missing name", async () => {
		const res = await request(app)
			.post("/auth/register")
			.send({ email: "test@example.com", password: "password123" });
		expect(res.status).toBe(400);
	});

	it("rejects password shorter than 8 characters", async () => {
		const res = await request(app)
			.post("/auth/register")
			.send({ email: "test@example.com", password: "short", name: "Test" });
		expect(res.status).toBe(400);
	});

	it("rejects invalid email format", async () => {
		const res = await request(app)
			.post("/auth/register")
			.send({ email: "notanemail", password: "password123", name: "Test" });
		expect(res.status).toBe(400);
	});
});

describe("request validation — /auth/login", () => {
	it("rejects missing email", async () => {
		const res = await request(app)
			.post("/auth/login")
			.send({ password: "password123" });
		expect(res.status).toBe(400);
	});

	it("rejects missing password", async () => {
		const res = await request(app)
			.post("/auth/login")
			.send({ email: "test@example.com" });
		expect(res.status).toBe(400);
	});
});

describe("request validation — /auth/refresh", () => {
	it("rejects missing refreshToken", async () => {
		const res = await request(app).post("/auth/refresh").send({});
		expect(res.status).toBe(400);
	});
});

describe("request validation — /creations", () => {
	it("rejects missing name", async () => {
		const res = await request(app)
			.post("/creations")
			.send({ config: { shape: "bowl" } });
		expect(res.status).toBe(400);
	});

	it("rejects missing config", async () => {
		const res = await request(app).post("/creations").send({ name: "My Bowl" });
		expect(res.status).toBe(400);
	});
});

describe("request validation — /tour-guide/ask", () => {
	it("rejects missing message", async () => {
		const res = await request(app).post("/tour-guide/ask").send({});
		expect(res.status).toBe(400);
	});
});
