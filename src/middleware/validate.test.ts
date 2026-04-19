import { validateUUID } from "./validate";

describe("validateUUID", () => {
	it("accepts a valid UUID v4", () => {
		expect(() =>
			validateUUID("550e8400-e29b-41d4-a716-446655440000"),
		).not.toThrow();
	});

	it.each([
		"not-a-uuid",
		"123",
		"",
		"550e8400-e29b-41d4",
	])("throws for invalid UUID: '%s'", (id) => {
		expect(() => validateUUID(id)).toThrow();
	});

	it("includes the label in the error message", () => {
		expect(() => validateUUID("bad-id", "piece ID")).toThrow(
			"Invalid piece ID",
		);
	});

	it("defaults to 'ID' in the error message when no label is given", () => {
		expect(() => validateUUID("bad-id")).toThrow("Invalid ID");
	});
});
