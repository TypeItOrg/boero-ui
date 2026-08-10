import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";
import {
  getContextualSearchResultHref,
  getContextualSearchViewAllHref,
} from "@features/contextual-search/utils/contextual-search-route.util";

const result: ContextualSearchResult = {
  id: "result-1",
  institutionId: "institution-1",
  institutionName: "Institución",
  institutionActive: true,
  title: "Resultado",
  subtitle: null,
  status: "ACTIVE",
  category: null,
};

describe("contextual search routes", () => {
  it("builds platform detail routes for core entities", () => {
    expect(getContextualSearchResultHref("platform", "institution", result)).toBe("/admin/institutions/result-1");
    expect(getContextualSearchResultHref("platform", "platform-account", result)).toBe("/admin/accounts/result-1");
    expect(getContextualSearchResultHref("platform", "role", result)).toBe("/admin/roles/result-1");
    expect(getContextualSearchResultHref("platform", "user", result)).toBe(
      "/admin/institutions/institution-1/people/result-1",
    );
  });

  it.each([
    ["academic-year", "academic-years"],
    ["training-path", "training-paths"],
  ] as const)("builds edit routes for the no-detail %s academic entity", (entityType, resource) => {
    expect(getContextualSearchResultHref("platform", entityType, result)).toBe(
      `/admin/institutions/institution-1/academic/${resource}/result-1/edit`,
    );
    expect(getContextualSearchResultHref("institutional", entityType, result)).toBe(`/${resource}/result-1/edit`);
  });

  it.each([
    ["study-plan", "study-plans"],
    ["academic-space", "academic-spaces"],
    ["instrument", "instruments"],
  ] as const)("builds detail routes for the %s academic entity", (entityType, resource) => {
    expect(getContextualSearchResultHref("platform", entityType, result)).toBe(
      `/admin/institutions/institution-1/academic/${resource}/result-1`,
    );
    expect(getContextualSearchResultHref("institutional", entityType, result)).toBe(`/${resource}/result-1`);
  });

  it("builds institutional core detail routes", () => {
    expect(getContextualSearchResultHref("institutional", "user", result)).toBe("/people/result-1");
    expect(getContextualSearchResultHref("institutional", "role", result)).toBe("/roles/result-1");
  });

  it("keeps platform academic collections in the global result page", () => {
    expect(getContextualSearchViewAllHref("platform", "academic-space", "Música aplicada")).toBe(
      "/admin/search?search=M%C3%BAsica+aplicada&type=academic-space",
    );
    expect(getContextualSearchViewAllHref("institutional", "role", "Preceptor")).toBe("/roles?search=Preceptor");
  });

  it("maps an institutional academic-year search to the year filter", () => {
    expect(getContextualSearchViewAllHref("institutional", "academic-year", " 2025 ")).toBe(
      "/academic-years?year=2025",
    );
  });

  it("does not offer an unfiltered academic-year collection for an invalid year search", () => {
    expect(getContextualSearchViewAllHref("institutional", "academic-year", "dos mil veinticinco")).toBeNull();
  });

  it("rejects platform-only entities in an institutional scope", () => {
    expect(() => getContextualSearchResultHref("institutional", "institution", result)).toThrow(
      "no pertenece a la búsqueda institucional",
    );
    expect(() => getContextualSearchViewAllHref("institutional", "platform-account", "admin")).toThrow(
      "no pertenece a la búsqueda institucional",
    );
  });

  it("rejects platform results that require a missing institution", () => {
    expect(() =>
      getContextualSearchResultHref("platform", "academic-space", { ...result, institutionId: null }),
    ).toThrow("no tiene una institución asociada");
    expect(() => getContextualSearchResultHref("platform", "user", { ...result, institutionId: null })).toThrow(
      "no tiene una institución asociada",
    );
  });
});
