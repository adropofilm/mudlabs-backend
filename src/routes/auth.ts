import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { APIError } from "../middleware/errorHandler";
import {
	validateEmail,
	validateName,
	validatePassword,
} from "../middleware/validate";
import { login, register } from "../services/authService";

const router = Router();

/**
 * POST /auth/register
 * Register new user
 * Body: { email: string, password: string, name: string }
 * Response: { token, user, expiresIn }
 */
router.post(
	"/register",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password, name } = req.body;

			if (!email || !password || !name) {
				throw new APIError("Missing required fields", 400);
			}
			validateEmail(email);
			validatePassword(password);
			validateName(name);

			const result = await register(email, password, name);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * POST /auth/login
 * Login user
 * Body: { email: string, password: string }
 * Response: { token, user, expiresIn }
 */
router.post(
	"/login",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				throw new APIError("Missing email or password", 400);
			}
			validateEmail(email);

			const result = await login(email, password);
			res.json(result);
		} catch (error) {
			next(error);
		}
	},
);

export default router;
