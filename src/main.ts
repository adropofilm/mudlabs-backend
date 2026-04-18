import app from "./app";

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
	console.log(`🏺 MudLab API running on http://localhost:${PORT}`);
});
