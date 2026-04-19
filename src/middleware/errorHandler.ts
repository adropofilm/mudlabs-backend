import type { NextFunction, Request, Response } from "express";
import type { ErrorResponse } from "../types";

export class APIError extends Error {
	constructor(
		public message: string,
		public statusCode: number,
	) {
		super(message);
	}
}

function isHttpError(err: unknown): err is { status: number; message: string } {
	return (
		typeof err === "object" &&
		err !== null &&
		typeof (err as Record<string, unknown>).status === "number"
	);
}

export const errorHandler = (
	error: Error | APIError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (error instanceof APIError) {
		const response: ErrorResponse = {
			error: error.message,
			message: error.message,
			statusCode: error.statusCode,
		};
		return res.status(error.statusCode).json(response);
	}

	// express-openapi-validator errors have a status property
	if (isHttpError(error) && error.status < 500) {
		const response: ErrorResponse = {
			error: "Validation Error",
			message: error.message,
			statusCode: error.status,
		};
		return res.status(error.status).json(response);
	}

	// Generic error — log 5xx only
	console.error("Internal error:", error);
	const response: ErrorResponse = {
		error: "Internal Server Error",
		message:
			process.env.NODE_ENV === "development"
				? error.message
				: "Something went wrong",
		statusCode: 500,
	};
	res.status(500).json(response);
};
