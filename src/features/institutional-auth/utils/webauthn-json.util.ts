import { base64UrlToBytes } from "@features/institutional-auth/utils/webauthn-base64url.util";

export type JsonRecord = Record<string, unknown>;

export function invalidOptions(): Error {
  return new Error("Invalid WebAuthn options");
}

export function requireRecord(value: unknown): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw invalidOptions();
  }
  return value as JsonRecord;
}

export function requireNonEmptyString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw invalidOptions();
  }
  return value;
}

export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw invalidOptions();
  return value;
}

export function requireBytes(value: unknown): Uint8Array<ArrayBuffer> {
  if (typeof value !== "string" || value.length === 0) {
    throw invalidOptions();
  }
  const bytes = base64UrlToBytes(value);
  if (bytes.length === 0) {
    throw invalidOptions();
  }
  return bytes;
}

export function optionalTimeout(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw invalidOptions();
  }
  return value;
}

export function optionalEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw invalidOptions();
  }
  return value as T;
}

export function requireStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw invalidOptions();
  }
  for (const entry of value) {
    if (typeof entry !== "string" || entry.length === 0) {
      throw invalidOptions();
    }
  }
  return value as string[];
}
