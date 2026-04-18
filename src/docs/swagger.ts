import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "MudLab API",
			version: "1.0.0",
			description: "REST API for the MudLab pottery gallery",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				User: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						email: { type: "string", format: "email" },
						name: { type: "string" },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				Piece: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						name: { type: "string" },
						collection: { type: "string" },
						glaze: { type: "string", enum: ["matte", "glossy", "textured"] },
						color: { type: "string" },
						type: { type: "string" },
						description: { type: "string" },
						photoUrl: { type: "string", format: "uri" },
					},
				},
				Creation: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						userId: { type: "string", format: "uuid" },
						name: { type: "string" },
						intentDescription: { type: "string" },
						config: { type: "object" },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				AuthResponse: {
					type: "object",
					properties: {
						accessToken: { type: "string" },
						refreshToken: { type: "string" },
						expiresIn: { type: "number", example: 900 },
						user: { $ref: "#/components/schemas/User" },
					},
				},
				Error: {
					type: "object",
					properties: {
						error: { type: "string" },
						message: { type: "string" },
						statusCode: { type: "number" },
					},
				},
			},
		},
	},
	apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
