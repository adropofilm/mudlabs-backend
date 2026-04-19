import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { authLimiter } from "../middleware/rateLimit";
import {
	login,
	logout,
	refreshAccessToken,
	register,
} from "../services/authService";

const router = Router();

router.post(
	"/register",
	authLimiter,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password, name } = req.body;

			const result = await register(email, password, name);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	},
);

router.post(
	"/login",
	authLimiter,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body;

			const result = await login(email, password);
			res.json(result);
		} catch (error) {
			next(error);
		}
	},
);

router.post(
	"/refresh",
	authLimiter,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { refreshToken } = req.body;

			const result = await refreshAccessToken(refreshToken);
			res.json(result);
		} catch (error) {
			next(error);
		}
	},
);

router.post(
	"/logout",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { refreshToken } = req.body;

			await logout(refreshToken);
			res.json({ success: true });
		} catch (error) {
			next(error);
		}
	},
);

export default router;
