import { parseEnrollmentApplicationPaginationParams } from "@features/enrollment-applications/utils/enrollment-application-pagination.util";

describe("parseEnrollmentApplicationPaginationParams", () => {
  it("uses the default page, size and no status when no query params are present", () => {
    const result = parseEnrollmentApplicationPaginationParams({});

    expect(result).toEqual({
      page: 0,
      size: 10,
      status: undefined,
      trainingPathId: undefined,
      open: false,
      pendingDocuments: false,
    });
  });

  it("preserves valid pagination and application-specific filters", () => {
    const result = parseEnrollmentApplicationPaginationParams({
      page: "3",
      size: "30",
      status: "SUBMITTED",
      trainingPathId: "22222222-2222-4222-8222-222222222222",
      open: "true",
      pendingDocuments: "true",
    });

    expect(result).toEqual({
      page: 3,
      size: 30,
      status: "SUBMITTED",
      trainingPathId: "22222222-2222-4222-8222-222222222222",
      open: true,
      pendingDocuments: true,
    });
  });

  it("drops an unknown status and falls back for unsupported pagination", () => {
    const result = parseEnrollmentApplicationPaginationParams({ status: "INVALID", page: "3", size: "25" });

    expect(result).toEqual({
      page: 3,
      size: 10,
      status: undefined,
      trainingPathId: undefined,
      open: false,
      pendingDocuments: false,
    });
  });
});
