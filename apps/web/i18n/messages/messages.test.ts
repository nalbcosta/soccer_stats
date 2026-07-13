import { describe, expect, it } from "vitest";
import { messages } from ".";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  return typeof value;
}

describe("i18n message catalogs", () => {
  it("keeps pt-BR and en with the same key structure", () => {
    expect(shape(messages["pt-BR"])).toEqual(shape(messages.en));
  });
});
