import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import creationRoutes from "./routes/creations";
import pieceRoutes from "./routes/pieces";
import tourGuideRoutes from "./routes/tourGuide";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/pieces", pieceRoutes);
app.use("/creations", creationRoutes);
app.use("/tour-guide", tourGuideRoutes);

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date() });
});

app.use(errorHandler);

export default app;
