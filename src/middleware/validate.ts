import { APIError } from "./errorHandler";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUUID(id: string, label = "ID") {
	if (!UUID_RE.test(id)) {
		throw new APIError(`Invalid ${label}`, 400);
	}
}
