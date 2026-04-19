import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
	AuthResponseSchema,
	CreateCreationInputSchema,
	CreationSchema,
	GenerateImageInputSchema,
	GenerateImageResponseSchema,
	LoginInputSchema,
	LogoutInputSchema,
	PieceSchema,
	RefreshInputSchema,
	RegisterInputSchema,
	TourGuideRequestSchema,
	TourGuideResponseSchema,
	UUIDSchema,
} from "../schemas";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

// ---- Auth ----
registry.registerPath({
	method: "post",
	path: "/auth/register",
	tags: ["Auth"],
	summary: "Register a new user",
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: RegisterInputSchema } },
		},
	},
	responses: {
		201: {
			description: "User registered",
			content: { "application/json": { schema: AuthResponseSchema } },
		},
		400: { description: "Validation error" },
		409: { description: "Email already registered" },
		429: { description: "Too many requests" },
	},
});

registry.registerPath({
	method: "post",
	path: "/auth/login",
	tags: ["Auth"],
	summary: "Log in",
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: LoginInputSchema } },
		},
	},
	responses: {
		200: {
			description: "Login successful",
			content: { "application/json": { schema: AuthResponseSchema } },
		},
		401: { description: "Invalid email or password" },
		429: { description: "Too many requests" },
	},
});

registry.registerPath({
	method: "post",
	path: "/auth/refresh",
	tags: ["Auth"],
	summary: "Get a new access token",
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: RefreshInputSchema } },
		},
	},
	responses: {
		200: {
			description: "New access token issued",
			content: {
				"application/json": {
					schema: z.object({
						accessToken: z.string(),
						expiresIn: z.number(),
					}),
				},
			},
		},
		401: { description: "Invalid or expired refresh token" },
	},
});

registry.registerPath({
	method: "post",
	path: "/auth/logout",
	tags: ["Auth"],
	summary: "Invalidate a refresh token",
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: LogoutInputSchema } },
		},
	},
	responses: {
		200: {
			description: "Logged out",
			content: {
				"application/json": {
					schema: z.object({ success: z.boolean() }),
				},
			},
		},
	},
});

// ---- Pieces ----
registry.registerPath({
	method: "get",
	path: "/pieces",
	tags: ["Pieces"],
	summary: "Get all pieces with optional filters",
	request: {
		query: z.object({
			collection: z.string().optional(),
			glaze: z.enum(["matte", "glossy", "textured"]).optional(),
			type: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: "List of pieces",
			content: {
				"application/json": { schema: z.array(PieceSchema) },
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/pieces/meta/collections",
	tags: ["Pieces"],
	summary: "Get all collection names",
	responses: {
		200: {
			description: "List of collection names",
			content: {
				"application/json": { schema: z.array(z.string()) },
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/pieces/meta/glazes",
	tags: ["Pieces"],
	summary: "Get all glaze options",
	responses: {
		200: {
			description: "List of glazes",
			content: {
				"application/json": {
					schema: z.array(
						z.object({ name: z.string(), description: z.string() }),
					),
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/pieces/{id}",
	tags: ["Pieces"],
	summary: "Get a single piece by ID",
	request: {
		params: z.object({ id: UUIDSchema }),
	},
	responses: {
		200: {
			description: "The piece",
			content: { "application/json": { schema: PieceSchema } },
		},
		400: { description: "Invalid ID format" },
		404: { description: "Piece not found" },
	},
});

// ---- Creations ----
registry.registerPath({
	method: "post",
	path: "/creations/generate-image",
	tags: ["Creations"],
	summary: "Generate an AI image from a pottery config",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: GenerateImageInputSchema } },
		},
	},
	responses: {
		200: {
			description: "Generated image URL and prompt used",
			content: {
				"application/json": { schema: GenerateImageResponseSchema },
			},
		},
		400: { description: "Missing config" },
		401: { description: "Unauthorized" },
		429: { description: "Rate limit exceeded" },
	},
});

registry.registerPath({
	method: "post",
	path: "/creations",
	tags: ["Creations"],
	summary: "Save a custom piece creation",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			required: true,
			content: {
				"application/json": { schema: CreateCreationInputSchema },
			},
		},
	},
	responses: {
		201: {
			description: "Creation saved",
			content: { "application/json": { schema: CreationSchema } },
		},
		400: { description: "Missing required fields" },
		401: { description: "Unauthorized" },
	},
});

registry.registerPath({
	method: "get",
	path: "/creations/users/{userId}",
	tags: ["Creations"],
	summary: "Get all creations for a user",
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({ userId: UUIDSchema }),
	},
	responses: {
		200: {
			description: "List of creations",
			content: {
				"application/json": { schema: z.array(CreationSchema) },
			},
		},
		401: { description: "Unauthorized" },
		403: { description: "Forbidden" },
	},
});

registry.registerPath({
	method: "delete",
	path: "/creations/{id}",
	tags: ["Creations"],
	summary: "Delete a creation",
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({ id: UUIDSchema }),
	},
	responses: {
		200: {
			description: "Deleted",
			content: {
				"application/json": {
					schema: z.object({ success: z.boolean() }),
				},
			},
		},
		401: { description: "Unauthorized" },
		404: { description: "Creation not found or unauthorized" },
	},
});

// ---- Tour Guide ----
registry.registerPath({
	method: "post",
	path: "/tour-guide/ask",
	tags: ["Tour Guide"],
	summary: "Ask the AI pottery tour guide a question",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: TourGuideRequestSchema } },
		},
	},
	responses: {
		200: {
			description: "Tour guide response",
			content: {
				"application/json": { schema: TourGuideResponseSchema },
			},
		},
		400: { description: "Message cannot be empty" },
		401: { description: "Unauthorized" },
		429: { description: "Rate limit — wait 30 seconds" },
	},
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
	openapi: "3.0.0",
	info: {
		title: "MudLab API",
		version: "1.0.0",
		description: "REST API for the MudLab pottery gallery",
	},
	servers: [{ url: "/" }],
});
