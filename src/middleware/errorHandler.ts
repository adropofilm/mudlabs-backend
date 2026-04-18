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

export const errorHandler = (
	error: Error | APIError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error("Error:", error);

	if (error instanceof APIError) {
		const response: ErrorResponse = {
			error: error.message,
			message: error.message,
			statusCode: error.statusCode,
		};
		return res.status(error.statusCode).json(response);
	}

	// express-openapi-validator errors have a status property
	const httpError = error as { status?: number; message: string };
	if (httpError.status && httpError.status < 500) {
		const response: ErrorResponse = {
			error: "Validation Error",
			message: httpError.message,
			statusCode: httpError.status,
		};
		return res.status(httpError.status).json(response);
	}

	// Generic error
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
