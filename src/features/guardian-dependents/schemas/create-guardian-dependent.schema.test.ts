import { createGuardianDependentSchema } from "@features/guardian-dependents/schemas/create-guardian-dependent.schema";

function createValidInput(overrides: Record<string, string> = {}) {
  return {
    documentNumber: "54123456",
    firstName: "Mateo",
    lastName: "González",
    birthDate: "2018-09-10",
    relationship: "FATHER",
    isPrimaryContact: "true",
    ...overrides,
  };
}

function issuePaths(input: Record<string, string>): string[] {
  const result = createGuardianDependentSchema.safeParse(input);

  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
}

describe("createGuardianDependentSchema", () => {
  it("parses a valid dependent and coerces the explicit boolean", () => {
    expect(createGuardianDependentSchema.parse(createValidInput())).toEqual({
      documentNumber: "54123456",
      firstName: "Mateo",
      lastName: "González",
      birthDate: "2018-09-10",
      relationship: "FATHER",
      isPrimaryContact: true,
    });
    expect(createGuardianDependentSchema.parse(createValidInput({ isPrimaryContact: "false" })).isPrimaryContact).toBe(false);
  });

  it.each(["", "on", "maybe"])("rejects the primary contact flag %p instead of treating it as false", (value) => {
    expect(issuePaths(createValidInput({ isPrimaryContact: value }))).toContain("isPrimaryContact");
  });

  it.each(["", "1234567", "123456789", "1234567a"])("rejects the document number %p", (documentNumber) => {
    expect(issuePaths(createValidInput({ documentNumber }))).toContain("documentNumber");
  });

  it("rejects a name that is too short or has digits", () => {
    expect(issuePaths(createValidInput({ firstName: "Al" }))).toContain("firstName");
    expect(issuePaths(createValidInput({ lastName: "Gonzalez2" }))).toContain("lastName");
  });

  it("rejects an unknown relationship", () => {
    expect(issuePaths(createValidInput({ relationship: "UNCLE" }))).toContain("relationship");
  });

  it("rejects a missing or too recent birth date", () => {
    expect(issuePaths(createValidInput({ birthDate: "" }))).toContain("birthDate");
    expect(issuePaths(createValidInput({ birthDate: "2999-01-01" }))).toContain("birthDate");
  });

  it("rejects a dependent who is already an adult", () => {
    expect(issuePaths(createValidInput({ birthDate: "1990-01-01" }))).toContain("birthDate");
  });
});
