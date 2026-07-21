import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";

describe("pagination-query.util", () => {
  it.each(PAGE_SIZE_OPTIONS)("accepts page size %s", (size) => {
    expect(parsePaginationQuery({ size: String(size) }).size).toBe(size);
  });

  it("falls back to the default for unsupported page sizes", () => {
    expect(parsePaginationQuery({ size: "60" }).size).toBe(10);
  });
});
