import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import creationRoutes from "./routes/creations";
import pieceRoutes from "./routes/pieces";
import tourGuideRoutes from "./routes/tourGuide";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
	OpenApiValidator.middleware({
		apiSpec: swaggerSpec as never,
		validateRequests: true,
		validateResponses: false, // enabling this adds latency and would expose internal schema details in error messages
		// Auth is handled by authMiddleware which verifies the JWT. The validator
		// only checks header presence, which is redundant and weaker
		validateSecurity: false,
		ignorePaths: /^\/api-docs/, // covers /api-docs and /api-docs.json
	}),
);

app.use("/auth", authRoutes);
app.use("/pieces", pieceRoutes);
app.use("/creations", creationRoutes);
app.use("/tour-guide", tourGuideRoutes);

app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		customCssUrl:
			"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css",
		customJs: [
			"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.js",
			"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.js",
		],
	}),
);

app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date() });
});

app.use(errorHandler);

export default app;
