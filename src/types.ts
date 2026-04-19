// Re-export API types — source of truth is src/schemas/index.ts
export type {
	AuthResponse,
	Creation,
	CreationConfig,
	ErrorResponse,
	GenerateImageResponse,
	Piece,
	TourGuideMessage,
	TourGuideRequest,
	TourGuideResponse,
	UserPublic,
} from "./schemas";

// Branded UUID — used internally for type-safe ID handling
export type UUID = string & { readonly brand: "UUID" };

// Internal user shape (includes passwordHash, never sent to clients)
export interface User {
	id: UUID;
	email: string;
	name: string;
	passwordHash: string;
	createdAt: Date;
}

// JWT payload shape
export interface JWTPayload {
	userId: UUID;
	iat: number;
	exp: number;
}
