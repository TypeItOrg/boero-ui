import { parseEnrollmentApplicationPaginationParams } from "./enrollment-application-pagination.util";

describe("parseEnrollmentApplicationPaginationParams", () => {
  it("uses the default page, size and no status when no query params are present", () => {
    const result = parseEnrollmentApplicationPaginationParams({});

    expect(result).toEqual({ page: 0, size: 10, status: undefined });
  });

  it("returns a validated status when present in the query", () => {
    const result = parseEnrollmentApplicationPaginationParams({ status: "SUBMITTED" });

    expect(result.status).toBe("SUBMITTED");
  });

  it("drops an unknown status value", () => {
    const result = parseEnrollmentApplicationPaginationParams({ status: "INVALID" });

    expect(result.status).toBeUndefined();
  });

  it("clamps the size to allowed page sizes", () => {
    const result = parseEnrollmentApplicationPaginationParams({ page: "3", size: "25" });

    expect(result).toEqual({ page: 3, size: 10, status: undefined });
  });
});
