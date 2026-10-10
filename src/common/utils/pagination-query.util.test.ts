import { buildPaginationSearchParams, PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";

describe("pagination-query.util", () => {
  it("keeps the supported page sizes aligned with the table contract", () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([10, 20, 30, 40, 50]);
  });

  it.each([10, 20, 30, 40, 50])("accepts page size %s", (size) => {
    expect(parsePaginationQuery({ page: "2", size: String(size), search: " piano " })).toEqual({ page: 2, size, search: "piano" });
  });

  it.each([undefined, "", "abc", "-1", "1.5", "Infinity"])("defaults an invalid page %s", (page) => {
    expect(parsePaginationQuery({ page })).toEqual({ page: 0, size: 10, search: "" });
  });

  it.each(["0", "7", "60", "20.5", "abc"])("defaults an unsupported page size %s", (size) => {
    expect(parsePaginationQuery({ page: "3", size })).toEqual({ page: 3, size: 10, search: "" });
  });

  it("uses the first repeated query value and trims search", () => {
    expect(parsePaginationQuery({ page: ["4", "9"], size: ["20", "30"], search: [" piano ", "guitarra"] })).toEqual({
      page: 4,
      size: 20,
      search: "piano",
    });
  });

  it("honors a caller's page sizes and defaults", () => {
    const options = { allowedPageSizes: new Set([5, 15]), defaultPage: 1, defaultSize: 5 };

    expect(parsePaginationQuery({}, options)).toEqual({ page: 1, size: 5, search: "" });
    expect(parsePaginationQuery({ page: "0", size: "15" }, options)).toEqual({ page: 0, size: 15, search: "" });
  });

  it("serializes a trimmed search with URL encoding", () => {
    const params = buildPaginationSearchParams({ page: 2, size: 20, search: " piano & voz " });

    expect(Object.fromEntries(params)).toEqual({ page: "2", size: "20", search: "piano & voz" });
    expect(params.toString()).toBe("page=2&size=20&search=piano+%26+voz");
  });

  it.each([undefined, "", "   "])("omits an empty search %s", (search) => {
    expect(buildPaginationSearchParams({ page: 0, size: 10, search }).toString()).toBe("page=0&size=10");
  });
});
