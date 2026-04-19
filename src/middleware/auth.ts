import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JWTPayload, UUID } from "../types";

declare global {
	namespace Express {
		interface Request {
			userId?: UUID;
		}
	}
}

export function requireUserId(req: Request): UUID {
	if (!req.userId) throw new Error("userId missing after authMiddleware");
	return req.userId;
}

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			return res.status(401).json({
				error: "Unauthorized",
				message: "Missing or invalid Authorization header",
				statusCode: 401,
			});
		}

		const token = authHeader.slice(7);

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			throw new Error("JWT_SECRET not configured");
		}

		const decoded = jwt.verify(token, secret);
		if (typeof decoded === "string") {
			return res.status(401).json({
				error: "Unauthorized",
				message: "Invalid token",
				statusCode: 401,
			});
		}

		const payload = decoded as JWTPayload;
		req.userId = payload.userId;

		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				error: "Unauthorized",
				message: "Token expired",
				statusCode: 401,
			});
		}

		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				error: "Unauthorized",
				message: "Invalid token",
				statusCode: 401,
			});
		}

		next(error);
	}
};
