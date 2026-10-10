import { getInstitutionLogoUrl } from "@features/institutions/utils/institution-logo-url.util";

const id = "22222222-2222-4222-8222-222222222222";
it("[L03.logo-cache-fallback] maps opaque logo version to safe same-host public BFF", () => {
  expect(getInstitutionLogoUrl(id, `/api/v1/institutions/${id}/logo?v=opaque%2Bversion`)).toBe(
    `/api/public/institutions/${id}/logo?v=opaque%2Bversion`,
  );
});
it.each([
  null,
  "https://private-storage.example/logo.png",
  "/files/private.png",
  "/api/v1/institutions/33333333-3333-4333-8333-333333333333/logo?v=1",
])("[L03.logo-cache-fallback] does not expose private/provider/other-tenant path %s", (url) => {
  expect(getInstitutionLogoUrl(id, url)).toBeNull();
});
