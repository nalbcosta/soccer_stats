import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

export const CSRF_COOKIE = "soccer_stats_csrf";
export const CSRF_HEADER = "x-csrf-token";

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const issueCsrfToken = (reply: FastifyReply): string => {
  const token = randomBytes(32).toString("hex");
  reply.setCookie(CSRF_COOKIE, hashToken(token), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    signed: true
  });
  return token;
};

export const validateCsrfToken = (request: FastifyRequest): boolean => {
  const header = request.headers[CSRF_HEADER];
  const token = Array.isArray(header) ? header[0] : header;
  const rawCookie = request.cookies[CSRF_COOKIE];

  if (!token || !rawCookie) {
    return false;
  }

  const unsigned = request.unsignCookie(rawCookie);

  if (!unsigned.valid || !unsigned.value) {
    return false;
  }

  const expected = Buffer.from(unsigned.value, "hex");
  const received = Buffer.from(hashToken(token), "hex");

  return expected.length === received.length && timingSafeEqual(expected, received);
};
