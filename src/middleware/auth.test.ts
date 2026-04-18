import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth";

jest.mock("jsonwebtoken");

const makeReq = (authHeader?: string) =>
	({ headers: { authorization: authHeader } }) as unknown as Request;

const makeRes = () => {
	const res = {} as Response;
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

describe("authMiddleware", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret";
	});
	it("calls next() and attaches userId to req for a valid token", () => {
		jest.mocked(jwt.verify).mockReturnValue({
			userId: "user-uuid",
			email: "test@example.com",
		} as never);
		const req = makeReq("Bearer valid-token") as Request & { userId?: string };
		const res = makeRes();
		const next = jest.fn();

		authMiddleware(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(req.userId).toBe("user-uuid");
	});

	it.each([
		["missing Authorization header", undefined],
		["non-Bearer scheme", "Basic abc123"],
	])("returns 401 for %s", (_, header) => {
		const res = makeRes();
		const next = jest.fn();

		authMiddleware(makeReq(header), res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				message: "Missing or invalid Authorization header",
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it.each([
		[
			"expired token",
			new jwt.TokenExpiredError("expired", new Date()),
			"Token expired",
		],
		["tampered token", new jwt.JsonWebTokenError("invalid"), "Invalid token"],
	])("returns 401 for %s", (_, error, expectedMessage) => {
		jest.mocked(jwt.verify).mockImplementation(() => {
			throw error;
		});
		const res = makeRes();
		const next = jest.fn();

		authMiddleware(makeReq("Bearer bad-token"), res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ message: expectedMessage }),
		);
		expect(next).not.toHaveBeenCalled();
	});
});
