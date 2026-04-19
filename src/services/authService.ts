import crypto from "node:crypto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/client";
import { APIError } from "../middleware/errorHandler";
import type { AuthResponse, UserPublic } from "../types";

const REFRESH_TOKEN_TTL_DAYS = 30;
const ACCESS_TOKEN_TTL_SECONDS = 900; // 15 min

export async function register(
	email: string,
	password: string,
	name: string,
): Promise<AuthResponse> {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new APIError("Email already registered", 409);

	const passwordHash = await bcryptjs.hash(password, 10);
	const user = await prisma.user.create({
		data: { email, name, passwordHash },
	});

	return buildAuthResponse(user.id, userToPublic(user));
}

export async function login(
	email: string,
	password: string,
): Promise<AuthResponse> {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new APIError("Invalid email or password", 401);

	const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
	if (!isPasswordValid) throw new APIError("Invalid email or password", 401);

	return buildAuthResponse(user.id, userToPublic(user));
}

export async function refreshAccessToken(
	token: string,
): Promise<{ accessToken: string; expiresIn: number }> {
	const stored = await prisma.refreshToken.findUnique({ where: { token } });

	if (!stored || stored.expiresAt < new Date()) {
		throw new APIError("Invalid or expired refresh token", 401);
	}

	const accessToken = generateAccessToken(stored.userId);
	return { accessToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS };
}

export async function logout(token: string): Promise<void> {
	await prisma.refreshToken.deleteMany({ where: { token } });
}

export function generateAccessToken(userId: string): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET not configured");

	return jwt.sign({ userId }, secret, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

async function buildAuthResponse(
	userId: string,
	user: UserPublic,
): Promise<AuthResponse> {
	const accessToken = generateAccessToken(userId);
	const refreshToken = crypto.randomBytes(64).toString("hex");

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

	await prisma.refreshToken.create({
		data: { token: refreshToken, userId, expiresAt },
	});

	return {
		accessToken,
		refreshToken,
		user,
		expiresIn: ACCESS_TOKEN_TTL_SECONDS,
	};
}

function userToPublic(user: {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
}): UserPublic {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		createdAt: user.createdAt,
	};
}
