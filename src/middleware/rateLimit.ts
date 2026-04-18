import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: {
		error: "Too many requests",
		message: "Try again in 15 minutes",
		statusCode: 429,
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const tourGuideLimiter = rateLimit({
	windowMs: 30 * 1000,
	max: 1,
	message: {
		error: "Too many requests",
		message: "Wait 30 seconds before asking again",
		statusCode: 429,
	},
	standardHeaders: true,
	legacyHeaders: false,
});
