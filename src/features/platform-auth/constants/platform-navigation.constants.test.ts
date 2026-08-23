import { PLATFORM_BOTTOM_NAVIGATION_ITEMS, PLATFORM_NAVIGATION_SECTIONS } from "@features/platform-auth/constants/platform-navigation.constants";

describe("platform navigation", () => {
  it("adds the academic resources to their own sidebar section", () => {
    expect(
      PLATFORM_NAVIGATION_SECTIONS.find((section) => "label" in section && section.label === "Académico")?.items.map((item) => item.url),
    ).toEqual(["/admin/academic-years", "/admin/training-paths", "/admin/study-plans", "/admin/academic-spaces", "/admin/instruments"]);
  });

  it("keeps the compact mobile navigation unchanged", () => {
    expect(PLATFORM_BOTTOM_NAVIGATION_ITEMS.map((item) => item.url)).toEqual([
      "/admin/institutions",
      "/admin/people",
      "/admin/roles",
      "/admin/accounts",
    ]);
  });
});
