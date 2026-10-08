import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";
import type { AcceptanceStack } from "./acceptance-stack.types";
import type { AcceptanceTenant } from "./acceptance-tenant.types";
import { tenantPublicBase } from "./fixture.helper";

export const ACCESS_COOKIE = "institutional_access_token";
export const REFRESH_COOKIE = "institutional_refresh_token";

export async function selectInstitution(page: Page, institution: AcceptanceTenant): Promise<void> {
  const selector = page.getByRole("combobox", { name: /Institución/ });
  await selector.click();
  await page.getByPlaceholder("Buscar institución...").fill(institution.name);
  await page.getByRole("option").filter({ hasText: institution.name }).click();
  await expect(selector).toContainText(institution.name);
}

export async function loginInstitution(page: Page, stack: AcceptanceStack, institution: AcceptanceTenant, branded = true): Promise<void> {
  const base = branded ? tenantPublicBase(stack, institution) : stack.publicBase;
  await page.goto(`${base}/auth/login`);
  if (!branded) {
    await selectInstitution(page, institution);
  }
  await page.getByLabel(/Documento/).fill(institution.document);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const usePassword = page.getByRole("button", { name: "Usar contraseña", exact: true });
  const password = page.getByLabel(/^Contraseña/);
  await expect(password.or(usePassword).first()).toBeVisible();
  if (await usePassword.isVisible()) {
    await usePassword.click();
  }
  await password.fill(institution.password);
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(page).toHaveURL(`${base}/`);
}

export async function loginPlatform(page: Page, stack: AcceptanceStack): Promise<void> {
  await page.goto(`${stack.publicBase}/admin/auth/login`);
  await page.getByLabel("Correo electrónico").fill(stack.admin.email);
  await page.getByLabel(/^Contraseña/).fill(stack.admin.password);
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(page).toHaveURL(`${stack.publicBase}/admin`);
  expect(new URL(page.url()).pathname.startsWith("/admin/auth"), "Platform login left guest page").toBe(false);
}

export function logoSection(page: Page): Locator {
  return page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Logo institucional", exact: true }) })
    .last();
}

export async function loadedLogo(page: Page, institution: AcceptanceTenant): Promise<Locator> {
  const image = page
    .getByRole("img", { name: `Logo de ${institution.name}`, exact: true })
    .filter({ visible: true })
    .first();
  await expect(image).toBeVisible();
  await expect
    .poll(async () => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0), {
      message: "Institutional logo loaded real image bytes",
    })
    .toBe(true);
  const source = await image.getAttribute("src");
  if (!source) {
    throw new Error("Institutional logo source is absent.");
  }
  const url = new URL(source, page.url());
  expect(url.origin, "Logo remains on the current frontend origin").toBe(new URL(page.url()).origin);
  expect(url.pathname).toBe(`/api/public/institutions/${institution.id}/logo`);
  expect(Boolean(url.searchParams.get("v")), "Logo uses an opaque version").toBe(true);
  return image;
}

export async function assertNoOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "No horizontal viewport overflow").toBe(true);
}

export async function safeCapture(page: Page, info: TestInfo, filename: string): Promise<void> {
  // Explicit static screenshot names only; no credential JSON, traces or token-containing URLs.
  await page.screenshot({ path: info.outputPath(filename), fullPage: true, animations: "disabled" });
  await info.attach(filename, { path: info.outputPath(filename), contentType: "image/png" });
}
