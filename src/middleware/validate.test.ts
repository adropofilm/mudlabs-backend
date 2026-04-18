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
	])("throws 400 for invalid email: %s", (email) => {
		expect(() => validateEmail(email)).toThrow();
		try {
			validateEmail(email);
		} catch (e: unknown) {
			expect((e as { statusCode: number }).statusCode).toBe(400);
			expect((e as { message: string }).message).toBe("Invalid email address");
		}
	});
});

describe("validatePassword", () => {
	it("accepts a password with exactly 8 characters", () => {
		expect(() => validatePassword("12345678")).not.toThrow();
	});

	it("accepts a password longer than 8 characters", () => {
		expect(() => validatePassword("a-very-long-password-123")).not.toThrow();
	});

	it.each(["", "short", "7chars!"])("throws 400 for: '%s'", (password) => {
		try {
			validatePassword(password);
		} catch (e: unknown) {
			expect((e as { statusCode: number }).statusCode).toBe(400);
			expect((e as { message: string }).message).toBe(
				"Password must be at least 8 characters",
			);
		}
	});
});

describe("validateName", () => {
	it("accepts a name with 2 or more characters", () => {
		expect(() => validateName("Jo")).not.toThrow();
		expect(() => validateName("Fatima")).not.toThrow();
	});

	it.each([
		"",
		"A",
		"  ",
	])("throws 400 for short or blank name: '%s'", (name) => {
		try {
			validateName(name);
		} catch (e: unknown) {
			expect((e as { statusCode: number }).statusCode).toBe(400);
			expect((e as { message: string }).message).toBe(
				"Name must be at least 2 characters",
			);
		}
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
	])("throws 400 for invalid UUID: '%s'", (id) => {
		try {
			validateUUID(id);
		} catch (e: unknown) {
			expect((e as { statusCode: number }).statusCode).toBe(400);
		}
	});

	it("includes the label in the error message", () => {
		try {
			validateUUID("bad-id", "piece ID");
		} catch (e: unknown) {
			expect((e as { message: string }).message).toBe("Invalid piece ID");
		}
	});

	it("defaults to 'ID' in the error message when no label is given", () => {
		try {
			validateUUID("bad-id");
		} catch (e: unknown) {
			expect((e as { message: string }).message).toBe("Invalid ID");
		}
	});
});
