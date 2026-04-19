import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UUIDSchema = z.string().uuid().openapi({ format: "uuid" });

// ---- User ----
export const UserPublicSchema = z
	.object({
		id: UUIDSchema,
		email: z.string().email(),
		name: z.string(),
		createdAt: z.coerce.date(),
	})
	.openapi("User");

// ---- Auth ----
export const RegisterInputSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8),
		name: z.string().min(2),
	})
	.openapi("RegisterInput");

export const LoginInputSchema = z
	.object({
		email: z.string().email(),
		password: z.string(),
	})
	.openapi("LoginInput");

export const RefreshInputSchema = z
	.object({ refreshToken: z.string() })
	.openapi("RefreshInput");

export const LogoutInputSchema = z
	.object({ refreshToken: z.string() })
	.openapi("LogoutInput");

export const AuthResponseSchema = z
	.object({
		accessToken: z.string(),
		refreshToken: z.string(),
		expiresIn: z.number().openapi({ example: 900 }),
		user: UserPublicSchema,
	})
	.openapi("AuthResponse");

// ---- Pieces ----
export const PieceSchema = z
	.object({
		id: UUIDSchema,
		name: z.string(),
		collection: z.string(),
		glaze: z.enum(["matte", "glossy", "textured"]),
		color: z.string(),
		type: z.string(),
		description: z.string(),
		photoUrl: z.string().url(),
	})
	.openapi("Piece");

// ---- Creations ----
export const CreationConfigSchema = z
	.object({
		shape: z.string(),
		glaze: z.string(),
		color: z.string(),
		size: z.object({
			height: z.number(),
			width: z.number(),
		}),
		details: z.array(z.string()),
		inspiredByPieceId: UUIDSchema.optional(),
	})
	.openapi("CreationConfig");

export const CreationSchema = z
	.object({
		id: UUIDSchema,
		userId: UUIDSchema,
		name: z.string(),
		intentDescription: z.string().optional(),
		config: CreationConfigSchema,
		imageUrl: z.string().url().optional(),
		createdAt: z.coerce.date(),
	})
	.openapi("Creation");

export const CreateCreationInputSchema = z
	.object({
		name: z.string(),
		intentDescription: z.string().optional(),
		config: CreationConfigSchema,
		imageUrl: z.string().url().optional(),
	})
	.openapi("CreateCreationInput");

export const GenerateImageInputSchema = z
	.object({ config: CreationConfigSchema })
	.openapi("GenerateImageInput");

export const GenerateImageResponseSchema = z
	.object({
		imageUrl: z.string().url(),
		promptUsed: z.string(),
	})
	.openapi("GenerateImageResponse");

// ---- Tour Guide ----
export const TourGuideMessageSchema = z
	.object({
		role: z.enum(["user", "assistant"]),
		content: z.string(),
		timestamp: z.coerce.date(),
	})
	.openapi("TourGuideMessage");

export const TourGuideRequestSchema = z
	.object({
		message: z.string().min(1),
		conversationHistory: z.array(TourGuideMessageSchema).optional(),
	})
	.openapi("TourGuideRequest");

export const TourGuideResponseSchema = z
	.object({
		response: z.string(),
		timestamp: z.coerce.date(),
	})
	.openapi("TourGuideResponse");

// ---- Error ----
export const ErrorResponseSchema = z
	.object({
		error: z.string(),
		message: z.string(),
		statusCode: z.number(),
	})
	.openapi("ErrorResponse");

// ---- Derived TypeScript types ----
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type Piece = z.infer<typeof PieceSchema>;
export type CreationConfig = z.infer<typeof CreationConfigSchema>;
export type Creation = z.infer<typeof CreationSchema>;
export type GenerateImageResponse = z.infer<typeof GenerateImageResponseSchema>;
export type TourGuideMessage = z.infer<typeof TourGuideMessageSchema>;
export type TourGuideRequest = z.infer<typeof TourGuideRequestSchema>;
export type TourGuideResponse = z.infer<typeof TourGuideResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
