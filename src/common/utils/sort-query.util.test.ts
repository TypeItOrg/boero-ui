import { getNextSort, getSortDirection, parseSortQuery, serializeSpringSort } from "@common/utils/sort-query.util";

const SORT_FIELDS = new Set(["name", "createdAt"] as const);
const DEFAULT_SORT = { field: "name", direction: "asc" } as const;

describe("parseSortQuery", () => {
  it("returns a supported field and direction", () => {
    expect(parseSortQuery({ sortField: "createdAt", sortDirection: "desc" }, SORT_FIELDS, DEFAULT_SORT)).toEqual({
      field: "createdAt",
      direction: "desc",
    });
  });

  it("uses the default when either query param is missing, repeated, or unsupported", () => {
    expect(parseSortQuery({ sortField: "name" }, SORT_FIELDS, DEFAULT_SORT)).toEqual(DEFAULT_SORT);
    expect(parseSortQuery({ sortField: ["name", "createdAt"], sortDirection: "asc" }, SORT_FIELDS, DEFAULT_SORT)).toEqual(DEFAULT_SORT);
    expect(parseSortQuery({ sortField: "active", sortDirection: "desc" }, SORT_FIELDS, DEFAULT_SORT)).toEqual(DEFAULT_SORT);
    expect(parseSortQuery({ sortField: "name", sortDirection: "latest" }, SORT_FIELDS, DEFAULT_SORT)).toEqual(DEFAULT_SORT);
  });
});

describe("getSortDirection", () => {
  it("returns the current direction for the matching field", () => {
    expect(getSortDirection({ field: "name", direction: "asc" }, "name")).toBe("asc");
    expect(getSortDirection({ field: "name", direction: "asc" }, "createdAt")).toBeUndefined();
  });
});

describe("getNextSort", () => {
  it("uses the default direction when sorting a new field", () => {
    expect(getNextSort({ field: "createdAt", direction: "desc" }, "name")).toEqual({ field: "name", direction: "asc" });
    expect(getNextSort({ field: "name", direction: "asc" }, "createdAt", "desc")).toEqual({
      field: "createdAt",
      direction: "desc",
    });
  });

  it("toggles the current field direction", () => {
    expect(getNextSort({ field: "name", direction: "asc" }, "name")).toEqual({ field: "name", direction: "desc" });
    expect(getNextSort({ field: "name", direction: "desc" }, "name")).toEqual({ field: "name", direction: "asc" });
  });
});

describe("serializeSpringSort", () => {
  it("keeps the Spring Data wire format at the HTTP boundary", () => {
    expect(serializeSpringSort({ field: "createdAt", direction: "desc" })).toBe("createdAt,desc");
  });
});
