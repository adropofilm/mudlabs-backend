import cors from "cors";
import dotenv from "dotenv";
import express from "express";
// Middleware
import { errorHandler } from "./middleware/errorHandler";
// Routes
import authRoutes from "./routes/auth";
import creationRoutes from "./routes/creations";
import pieceRoutes from "./routes/pieces";
import tourGuideRoutes from "./routes/tourGuide";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/pieces", pieceRoutes);
app.use("/creations", creationRoutes);
app.use("/tour-guide", tourGuideRoutes);

// Health check
app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date() });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
	console.log(`🏺 MudLab API running on http://localhost:${PORT}`);
});
