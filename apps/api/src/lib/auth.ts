import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const hashBuffer = scryptSync(password, salt, KEY_LENGTH);
  const originalBuffer = Buffer.from(originalHash, "hex");

  return hashBuffer.length === originalBuffer.length && timingSafeEqual(hashBuffer, originalBuffer);
};
