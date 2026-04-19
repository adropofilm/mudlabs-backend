import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/client";
import type { UUID } from "../types";
import {
	generateAccessToken,
	login,
	logout,
	refreshAccessToken,
	register,
} from "./authService";

jest.mock("../db/client", () => ({
	user: { findUnique: jest.fn(), create: jest.fn() },
	refreshToken: {
		create: jest.fn(),
		findUnique: jest.fn(),
		deleteMany: jest.fn(),
	},
}));
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockUser = {
	id: "user-uuid",
	email: "test@example.com",
	name: "Test User",
	passwordHash: "$2a$hashed",
	createdAt: new Date("2026-01-01"),
};

describe("register", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret-32-chars-minimum-len";
		jest.mocked(prisma.user.findUnique).mockResolvedValue(null);
		jest.mocked(bcryptjs.hash).mockResolvedValue("$2a$hashed" as never);
		jest.mocked(prisma.user.create).mockResolvedValue(mockUser);
		jest.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);
		jest.mocked(jwt.sign).mockReturnValue("signed-token" as never);
	});

	it("returns an access token, refresh token, and public user on success", async () => {
		const result = await register(
			"test@example.com",
			"password123",
			"Test User",
		);
		expect(result.accessToken).toBe("signed-token");
		expect(result.refreshToken).toBeDefined();
		expect(result.user.email).toBe("test@example.com");
		expect(result.expiresIn).toBe(900);
	});

	it("never exposes passwordHash on the returned user", async () => {
		const result = await register(
			"test@example.com",
			"password123",
			"Test User",
		);
		expect(result.user).not.toHaveProperty("passwordHash");
	});

	it("always hashes the password before storing", async () => {
		await register("test@example.com", "plaintext", "Test User");
		expect(bcryptjs.hash).toHaveBeenCalledWith("plaintext", 10);
		const stored = jest.mocked(prisma.user.create).mock.calls[0][0].data;
		expect(stored.passwordHash).toBe("$2a$hashed");
		expect(stored).not.toHaveProperty("password");
	});

	it("stores a refresh token in the database", async () => {
		await register("test@example.com", "password123", "Test User");
		expect(prisma.refreshToken.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					userId: "user-uuid",
				}),
			}),
		);
	});

	it("throws 409 if email is already registered", async () => {
		jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
		await expect(
			register("test@example.com", "password123", "Test User"),
		).rejects.toMatchObject({
			statusCode: 409,
			message: "Email already registered",
		});
	});
});

describe("login", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret-32-chars-minimum-len";
		jest.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);
	});

	it("returns access token, refresh token, and public user for valid credentials", async () => {
		jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
		jest.mocked(bcryptjs.compare).mockResolvedValue(true as never);
		jest.mocked(jwt.sign).mockReturnValue("signed-token" as never);

		const result = await login("test@example.com", "password123");
		expect(result.accessToken).toBe("signed-token");
		expect(result.refreshToken).toBeDefined();
		expect(result.user.email).toBe("test@example.com");
	});

	it.each([
		["unknown email", null, true],
		["wrong password", mockUser, false],
	])("throws 401 with a non-specific message for %s (prevents email enumeration)", async (_, user, passwordMatch) => {
		jest
			.mocked(prisma.user.findUnique)
			.mockResolvedValue(user as typeof mockUser | null);
		jest.mocked(bcryptjs.compare).mockResolvedValue(passwordMatch as never);

		await expect(login("test@example.com", "wrong")).rejects.toMatchObject({
			statusCode: 401,
			message: "Invalid email or password",
		});
	});
});

describe("refreshAccessToken", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret-32-chars-minimum-len";
	});

	it("returns a new access token for a valid, unexpired refresh token", async () => {
		jest.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
			id: "rt-uuid",
			token: "valid-token",
			userId: "user-uuid",
			expiresAt: new Date(Date.now() + 1000 * 60 * 60),
			createdAt: new Date(),
		} as never);
		jest.mocked(jwt.sign).mockReturnValue("new-access-token" as never);

		const result = await refreshAccessToken("valid-token");
		expect(result.accessToken).toBe("new-access-token");
		expect(result.expiresIn).toBe(900);
	});

	it("throws 401 for a token not found in the database", async () => {
		jest.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);

		await expect(refreshAccessToken("bad-token")).rejects.toMatchObject({
			statusCode: 401,
			message: "Invalid or expired refresh token",
		});
	});

	it("throws 401 for an expired refresh token", async () => {
		jest.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
			id: "rt-uuid",
			token: "expired-token",
			userId: "user-uuid",
			expiresAt: new Date(Date.now() - 1000),
			createdAt: new Date(),
		} as never);

		await expect(refreshAccessToken("expired-token")).rejects.toMatchObject({
			statusCode: 401,
		});
	});
});

describe("logout", () => {
	it("deletes the refresh token from the database", async () => {
		jest.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 });

		await logout("some-token");

		expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
			where: { token: "some-token" },
		});
	});

	it("does not throw if the token does not exist", async () => {
		jest.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 0 });

		await expect(logout("nonexistent-token")).resolves.not.toThrow();
	});
});

describe("generateAccessToken", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret-32-chars-minimum-len";
	});

	it("throws if JWT_SECRET is not configured", () => {
		delete process.env.JWT_SECRET;
		expect(() => generateAccessToken("user-id" as unknown as UUID)).toThrow(
			"JWT_SECRET not configured",
		);
	});

	it("signs the token with userId in the payload", () => {
		jest.mocked(jwt.sign).mockReturnValue("signed-token" as never);
		generateAccessToken("user-id" as unknown as UUID);
		expect(jwt.sign).toHaveBeenCalledWith(
			{ userId: "user-id" },
			"test-secret-32-chars-minimum-len",
			expect.any(Object),
		);
	});
});
