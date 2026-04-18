import { APIError } from "./errorHandler";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateEmail(email: string) {
	if (!EMAIL_RE.test(email)) {
		throw new APIError("Invalid email address", 400);
	}
}

export function validatePassword(password: string) {
	if (password.length < 8) {
		throw new APIError("Password must be at least 8 characters", 400);
	}
}

export function validateName(name: string) {
	if (name.trim().length < 2) {
		throw new APIError("Name must be at least 2 characters", 400);
	}
}

export function validateUUID(id: string, label = "ID") {
	if (!UUID_RE.test(id)) {
		throw new APIError(`Invalid ${label}`, 400);
	}
}
