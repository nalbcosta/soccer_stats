import { randomBytes, randomUUID } from "node:crypto";

export const createId = (): string => randomUUID();

export const createPublicIdentifier = (): string => `#${randomBytes(3).toString("hex").toUpperCase()}`;

export const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
