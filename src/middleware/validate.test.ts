import {
	validateEmail,
	validateName,
	validatePassword,
	validateUUID,
} from "./validate";

describe("validateEmail", () => {
	it.each([
		"user@example.com",
		"first.last@domain.co",
		"user+tag@sub.domain.com",
	])("accepts valid email: %s", (email) => {
		expect(() => validateEmail(email)).not.toThrow();
	});

	it.each([
		"notanemail",
		"missing@tld",
		"@nodomain.com",
		"spaces @email.com",
	])("throws for invalid email: %s", (email) => {
		expect(() => validateEmail(email)).toThrow("Invalid email address");
	});
});

describe("validatePassword", () => {
	it("accepts a password with exactly 8 characters", () => {
		expect(() => validatePassword("12345678")).not.toThrow();
	});

	it("accepts a password longer than 8 characters", () => {
		expect(() => validatePassword("a-very-long-password-123")).not.toThrow();
	});

	it.each(["", "short", "7chars!"])("throws for password: '%s'", (password) => {
		expect(() => validatePassword(password)).toThrow(
			"Password must be at least 8 characters",
		);
	});
});

describe("validateName", () => {
	it("accepts a name with 2 or more characters", () => {
		expect(() => validateName("Jo")).not.toThrow();
		expect(() => validateName("Fatima")).not.toThrow();
	});

	it.each(["", "A", "  "])("throws for short or blank name: '%s'", (name) => {
		expect(() => validateName(name)).toThrow(
			"Name must be at least 2 characters",
		);
	});
});

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
