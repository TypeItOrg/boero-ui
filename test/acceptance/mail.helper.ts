import { createHash, randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import type { AcceptanceApplicant } from "./acceptance-applicant.types";
import type { AcceptanceStack } from "./acceptance-stack.types";
import { tenantPublicBase } from "./fixture.helper";

export function syntheticApplicant(namespace: string, stack: AcceptanceStack, purpose: string): AcceptanceApplicant {
  const suffix = `${namespace.slice(-12)}-${purpose}-${randomUUID().slice(0, 8)}`;
  const number = createHash("sha256").update(suffix).digest().readUInt32BE(0);
  const document = String(10_000_000 + (number % 90_000_000));
  if ([stack.tenantA.document, stack.tenantB.document].includes(document)) {
    throw new Error("Synthetic applicant document collided with an authority fixture.");
  }
  return { document, email: `acceptance-${suffix}@example.invalid`, password: stack.tenantA.password, name: "Prueba", lastName: "Aceptacion" };
}

export async function registerApplicant(page: Page, stack: AcceptanceStack, applicant: AcceptanceApplicant): Promise<void> {
  await page.goto(`${tenantPublicBase(stack, stack.tenantA)}/auth/register`);
  await expect(page.getByRole("combobox", { name: /Institución/ })).toHaveCount(0);
  await page.getByLabel("Nombre", { exact: false }).fill(applicant.name);
  await page.getByLabel("Apellido", { exact: false }).fill(applicant.lastName);
  await page.getByLabel("Documento", { exact: false }).fill(applicant.document);
  // Actual shared DatePicker input commits the controlled hidden ISO field.
  await page.getByLabel("Fecha de nacimiento", { exact: false }).fill("01/01/2000");
  await page.getByLabel("Email", { exact: false }).fill(applicant.email);
  await page.getByLabel(/^Contraseña/).fill(applicant.password);
  await page.getByLabel("Repetir contraseña", { exact: false }).fill(applicant.password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page).toHaveURL(`${tenantPublicBase(stack, stack.tenantA)}/auth/email-verification`);
  await expect(page.getByLabel("Documento", { exact: false })).toHaveValue(applicant.document);
}

export async function mailLink(api: APIRequestContext, stack: AcceptanceStack, recipient: string, pathname: string): Promise<string> {
  if (new URL(stack.mailBase).hostname !== "127.0.0.1") {
    throw new Error("Refusing a non-loopback mail target.");
  }
  let link: string | undefined;
  await expect
    .poll(
      async () => {
        const listing = await api.get(`${stack.mailBase}/api/v1/messages?limit=100`);
        if (listing.status() !== 200) {
          return false;
        }
        const mailbox = (await listing.json()) as { messages?: Array<{ ID: string; To?: Array<{ Address: string }> }> };
        for (const message of mailbox.messages ?? []) {
          if (!message.To?.some((address) => address.Address.toLowerCase() === recipient.toLowerCase())) {
            continue;
          }
          const detail = await api.get(`${stack.mailBase}/api/v1/message/${encodeURIComponent(message.ID)}`);
          if (detail.status() !== 200) {
            continue;
          }
          const content = (await detail.json()) as { HTML?: string; Text?: string };
          const body = `${content.HTML ?? ""}\n${content.Text ?? ""}`.replace(/&amp;/g, "&");
          const candidates = body.match(/https:\/\/[^\s"'<>]+/g) ?? [];
          const candidate = candidates.find((value) => {
            try {
              return new URL(value).pathname === pathname;
            } catch {
              return false;
            }
          });
          if (candidate) {
            link = candidate;
            return true;
          }
        }
        return false;
      },
      { timeout: 25_000, intervals: [250, 500, 1000], message: "Captured email for the unique synthetic applicant contains the expected link" },
    )
    .toBe(true);
  if (!link) {
    throw new Error("Captured email omitted the expected link.");
  }
  const url = new URL(link);
  expect(url.origin, "Async mail uses the canonical branded frontend origin").toBe(tenantPublicBase(stack, stack.tenantA));
  expect(Boolean(url.searchParams.get("token")), "Captured link includes a token").toBe(true);
  return link;
}

export async function confirmApplicant(page: Page, link: string, stack: AcceptanceStack): Promise<void> {
  await page.goto(link);
  await page.getByRole("button", { name: "Confirmar correo electrónico", exact: true }).click();
  await expect(page).toHaveURL(`${tenantPublicBase(stack, stack.tenantA)}/auth/login`);
  await expect(page.getByText("¡Listo! Correo electrónico confirmado")).toBeVisible();
}
