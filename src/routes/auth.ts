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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string, minLength: 2 }
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 *       429:
 *         description: Too many requests
 */
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

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid email or password
 *       429:
 *         description: Too many requests
 */
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

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Get a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 expiresIn: { type: number }
 *       401:
 *         description: Invalid or expired refresh token
 */
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

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 */
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
