import { parseSessionsPaginationParams, SESSIONS_PAGE_SIZE_OPTIONS } from "@features/institutional-auth/utils/session-pagination.util";

describe("parseSessionsPaginationParams", () => {
  it("defaults to the backend page size", () => {
    expect(parseSessionsPaginationParams({})).toEqual({ page: 0, size: 20 });
  });

  it.each(SESSIONS_PAGE_SIZE_OPTIONS)("accepts shared page size %s", (size) => {
    expect(parseSessionsPaginationParams({ size: String(size) })).toEqual({ page: 0, size });
  });

  it("falls back to defaults on invalid values", () => {
    expect(parseSessionsPaginationParams({ page: "-1", size: "7" })).toEqual({ page: 0, size: 20 });
    expect(parseSessionsPaginationParams({ page: "abc", size: "999" })).toEqual({ page: 0, size: 20 });
  });
});
