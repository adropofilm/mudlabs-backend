// UUID type
export type UUID = string & { readonly brand: "UUID" };

// ============ USER ============
export interface User {
	id: UUID;
	email: string;
	name: string;
	passwordHash: string;
	createdAt: Date;
}

// Return user to frontend (never include passwordHash)
export type UserPublic = Omit<User, "passwordHash">;

// ============ GALLERY PIECES ============
export interface Piece {
	id: UUID;
	name: string;
	collection: string;
	glaze: string;
	color: string;
	type: string;
	description: string;
	photoUrl: string;
}

// ============ USER CREATIONS ============
export interface CreationConfig {
	shape: string;
	glaze: string;
	color: string;
	size: {
		height: number;
		width: number;
	};
	details: string[];
	inspiredByPieceId?: UUID;
}

export interface Creation {
	id: UUID;
	userId: UUID;
	name: string;
	createdAt: Date;
	intentDescription?: string;
	config: CreationConfig;
	imageUrl?: string;
}

export interface GenerateImageResponse {
	imageUrl: string;
	promptUsed: string;
}

// ============ AUTH ============
export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: UserPublic;
	expiresIn: number; // seconds (900 = 15 min)
}

export interface JWTPayload {
	userId: UUID;
	iat: number; // issued at
	exp: number; // expires at
}

// ============ API ERRORS ============
export interface ErrorResponse {
	error: string;
	message: string;
	statusCode: number;
}

// ============ TOUR GUIDE ============
export interface TourGuideMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

export interface TourGuideRequest {
	message: string;
	conversationHistory?: TourGuideMessage[];
}

export interface TourGuideResponse {
	response: string;
	timestamp: Date;
}
