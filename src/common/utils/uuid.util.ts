import { z } from "zod";

const UUID_SCHEMA = z.string().uuid();

export function isValidUuid(value: unknown): value is string {
  return UUID_SCHEMA.safeParse(value).success;
}
