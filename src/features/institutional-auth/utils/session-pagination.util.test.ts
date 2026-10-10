import { parseSessionsPaginationParams } from "@features/institutional-auth/utils/session-pagination.util";

describe("parseSessionsPaginationParams", () => {
  it("defaults to the backend page size", () => {
    expect(parseSessionsPaginationParams({})).toEqual({ page: 0, size: 20 });
  });

  it("preserves explicit pagination instead of replacing it with session defaults", () => {
    expect(parseSessionsPaginationParams({ page: "2", size: "50" })).toEqual({ page: 2, size: 50 });
  });

  it("falls back to defaults on invalid values", () => {
    expect(parseSessionsPaginationParams({ page: "-1", size: "7" })).toEqual({ page: 0, size: 20 });
    expect(parseSessionsPaginationParams({ page: "abc", size: "999" })).toEqual({
      page: 0,
      size: 20,
    });
  });
});
