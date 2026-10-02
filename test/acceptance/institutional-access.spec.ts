import { test, expect } from "@playwright/test";
import { loadAcceptanceFixture, tenantPublicBase, tenantHeader } from "./fixture.helper";
import { assertStatus, backendUrl, institutionTokens, platformTokens, setLogo } from "./backend.helper";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  assertNoOverflow,
  loadedLogo,
  loginInstitution,
  loginPlatform,
  logoSection,
  safeCapture,
} from "./browser.helper";
import { confirmApplicant, mailLink, registerApplicant, syntheticApplicant } from "./mail.helper";
import { syntheticLogo } from "./png.helper";

const fixture = loadAcceptanceFixture();
const qa = fixture.stacks.qa;

// Each test is independently executed (not serial-mode): a failure never skips later cases.
// All browser hosts resolve locally through the dedicated Chromium configuration.
test("[A01.generic-flows] general QA/staging access preserves selectors and password login", async ({ page, request }) => {
  for (const stack of [fixture.stacks.qa, fixture.stacks.staging]) {
    for (const path of ["/auth/login", "/auth/register", "/auth/password-recovery", "/auth/email-verification"]) {
      await page.goto(`${stack.publicBase}${path}`);
      await expect(page.getByRole("combobox", { name: /Institución/ })).toBeVisible();
    }
    await loginInstitution(page, stack, stack.tenantA, false);
    const session = (await page.context().cookies(stack.publicBase)).find((cookie) => cookie.name === ACCESS_COOKIE);
    expect(Boolean(session?.value), "Generic browser password login issued an access cookie").toBe(true);
    if (!session) {
      throw new Error("Generic login omitted its access cookie.");
    }
    const validated = await request.get(backendUrl(stack, "/api/v1/auth/me"), {
      headers: { "X-Institutional-Host": new URL(stack.publicBase).hostname, Authorization: `Bearer ${session.value}` },
    });
    assertStatus(validated, 200, "The browser's generic access cookie represents a valid real session");
    await page.context().clearCookies();
  }
});

test("[A01.platform-flow] [I01.legacy-update] platform UI persists public access, clears it and preserves the independent slug", async ({
  page,
  request,
}) => {
  await loginPlatform(page, qa);
  await page.goto(`${qa.publicBase}/admin/institutions/${qa.tenantA.id}`);
  await expect(page.getByRole("heading", { name: qa.tenantA.name, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acceso público institucional", exact: true })).toBeVisible();
  await expect(logoSection(page).getByRole("button", { name: /(?:Cargar|Reemplazar) logo/ })).toBeVisible();

  const admin = await platformTokens(request, qa);
  const authorization = { Authorization: `Bearer ${admin.accessToken}` };
  const detailUrl = backendUrl(qa, `/api/v1/admin/institutions/${qa.tenantA.id}`);
  const readDetail = async (): Promise<{ publicSubdomain: string | null; slug: string }> => {
    const response = await request.get(detailUrl, { headers: authorization });
    assertStatus(response, 200, "Read persisted synthetic institution detail");
    return response.json();
  };
  const baseline = await readDetail();
  const temporary = "cboero-prueba";
  // Next Activity can retain an old form in a hidden tree during refresh. Match
  // the accessible textbox, not hidden duplicates; visible duplicates still fail.
  const publicName = page.getByRole("textbox", { name: "Nombre público", exact: true });
  try {
    await publicName.fill(temporary);
    await page.getByRole("button", { name: "Guardar acceso público", exact: true }).click();
    await expect(page.getByText("Acceso público guardado.", { exact: true })).toBeVisible();
    await expect
      .poll(async () => (await readDetail()).publicSubdomain, { message: "Public access is persisted in the real backend" })
      .toBe(temporary);
    expect((await readDetail()).slug, "Public name update does not change the original slug").toBe(baseline.slug);
    await page.reload();
    await expect(publicName).toHaveValue(temporary);

    await publicName.fill("");
    await page.getByRole("button", { name: "Guardar acceso público", exact: true }).click();
    await expect(page.getByText("Acceso público guardado.", { exact: true })).toBeVisible();
    await expect.poll(async () => (await readDetail()).publicSubdomain, { message: "Clearing the optional public name persists NULL" }).toBeNull();
    expect((await readDetail()).slug, "Clearing public access still preserves slug").toBe(baseline.slug);
    await page.reload();
    await expect(publicName).toHaveValue("");
  } finally {
    // Only restore this explicitly owned synthetic fixture, even when a UI assertion fails.
    const restored = await request.patch(backendUrl(qa, `/api/v1/admin/institutions/${qa.tenantA.id}/public-access`), {
      headers: authorization,
      data: { publicSubdomain: qa.tenantA.publicSubdomain },
    });
    assertStatus(restored, 200, "Restore the configured synthetic institution public name");
  }
  await page.reload();
  await expect(publicName).toHaveValue(qa.tenantA.publicSubdomain);
});

test("[A02.branded-desktop] real desktop auth pages show institution identity/logo without a selector", async ({ page, request }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const stack of [fixture.stacks.qa, fixture.stacks.staging]) {
    await setLogo(request, stack, stack.tenantA, syntheticLogo());
    for (const path of ["/auth/login", "/auth/register", "/auth/password-recovery", "/auth/email-verification"]) {
      await page.goto(`${tenantPublicBase(stack, stack.tenantA)}${path}`);
      await expect(page.getByRole("combobox", { name: /Institución/ })).toHaveCount(0);
      await expect(page.getByText(stack.tenantA.name, { exact: true }).filter({ visible: true }).first()).toBeVisible();
      await loadedLogo(page, stack.tenantA);
      await assertNoOverflow(page);
    }
    await page.goto(`${tenantPublicBase(stack, stack.tenantA)}/auth/login`);
    await safeCapture(page, info, stack === qa ? "branded-desktop-qa.png" : "branded-desktop-staging.png");
  }
});

test("[A02.branded-mobile] real narrow auth pages retain name/logo/actions without horizontal overflow", async ({ page, request }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const stack of [fixture.stacks.qa, fixture.stacks.staging]) {
    await setLogo(request, stack, stack.tenantA, syntheticLogo());
    for (const path of ["/auth/login", "/auth/register", "/auth/password-recovery", "/auth/email-verification"]) {
      await page.goto(`${tenantPublicBase(stack, stack.tenantA)}${path}`);
      await expect(page.getByRole("combobox", { name: /Institución/ })).toHaveCount(0);
      await expect(page.getByText(stack.tenantA.name, { exact: true }).filter({ visible: true }).first()).toBeVisible();
      const nameBounds = await page.getByText(stack.tenantA.name, { exact: true }).filter({ visible: true }).first().boundingBox();
      expect(nameBounds?.width ?? 0, "Mobile institution name uses readable card width, not the logo cap").toBeGreaterThan(200);
      await loadedLogo(page, stack.tenantA);
      await assertNoOverflow(page);
    }
    await page.goto(`${tenantPublicBase(stack, stack.tenantA)}/auth/login`);
    await safeCapture(page, info, stack === qa ? "branded-mobile-qa.png" : "branded-mobile-staging.png");
  }
});

test("[A02.no-logo] desktop/mobile branded access shows the actual name and never substitutes another logo", async ({ page, request }, info) => {
  await setLogo(request, qa, qa.tenantA, null);
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${tenantPublicBase(qa, qa.tenantA)}/auth/login`);
    await expect(page.getByRole("combobox", { name: /Institución/ })).toHaveCount(0);
    await expect(page.getByText(qa.tenantA.name, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("img")).toHaveCount(0);
    await assertNoOverflow(page);
    await safeCapture(page, info, viewport.width === 390 ? "no-logo-mobile.png" : "no-logo-desktop.png");
  }
});

test("[A03.payload-context] real branded action and backend reject a tampered institution ID", async ({ page, request }) => {
  await page.goto(`${tenantPublicBase(qa, qa.tenantA)}/auth/login`);
  await page.getByLabel(/Documento/).fill(qa.tenantA.document);
  await page.locator('input[name="institutionId"]').evaluate((input, id) => {
    (input as HTMLInputElement).value = id;
  }, qa.tenantB.id);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByText("La institución no corresponde a este acceso.")).toBeVisible();
  await expect(page.getByLabel(/^Contraseña(?:\s|$)/)).toHaveCount(0);
  const response = await request.post(backendUrl(qa, "/api/v1/auth/login/identify"), {
    headers: tenantHeader(qa, qa.tenantA),
    data: { institutionId: qa.tenantB.id, documentNumber: qa.tenantB.document },
  });
  assertStatus(response, 403, "Backend rejects institution payload inconsistent with Host");
});

test("[A03.attempt-context] real password/passkey endpoints reject a login attempt from another institution", async ({ request }) => {
  const identified = await request.post(backendUrl(qa, "/api/v1/auth/login/identify"), {
    headers: tenantHeader(qa, qa.tenantA),
    data: { institutionId: qa.tenantA.id, documentNumber: qa.tenantA.document },
  });
  assertStatus(identified, 200, "Create real tenant-A login attempt");
  const { loginAttemptId } = (await identified.json()) as { loginAttemptId: string };
  const password = await request.post(backendUrl(qa, "/api/v1/auth/login/password"), {
    headers: tenantHeader(qa, qa.tenantB),
    data: { loginAttemptId, password: qa.tenantA.password, rememberMe: false },
  });
  assertStatus(password, 403, "Password attempt is tenant-bound");
  const passkey = await request.post(backendUrl(qa, "/api/v1/auth/passkeys/authentication/options"), {
    headers: tenantHeader(qa, qa.tenantB),
    data: { loginAttemptId },
  });
  assertStatus(passkey, 403, "Passkey attempt is tenant-bound");
});

test("[A03.session-context] a real tenant-A JWT cannot read the tenant-B current session", async ({ request }) => {
  const tokens = await institutionTokens(request, qa, qa.tenantA);
  const response = await request.get(backendUrl(qa, "/api/v1/auth/me"), {
    headers: { ...tenantHeader(qa, qa.tenantB), Authorization: `Bearer ${tokens.accessToken}` },
  });
  assertStatus(response, 403, "JWT context mismatch is forbidden");
});

test("[A03.untrusted-header] browser-supplied internal tenant header cannot override actual frontend Host", async ({ page }) => {
  await page.context().setExtraHTTPHeaders({
    "X-Institutional-Host": new URL(tenantPublicBase(qa, qa.tenantB)).hostname,
  });
  await loginInstitution(page, qa, qa.tenantA);
  const cookies = await page.context().cookies(tenantPublicBase(qa, qa.tenantA));
  expect(
    cookies.some((cookie) => cookie.name === ACCESS_COOKIE),
    "Actual tenant-A host authenticated despite forged peer context",
  ).toBe(true);
});

test("[L01.platform-logo-lifecycle] platform UI uploads, replaces and removes real synthetic PNG logos", async ({ page, request }, info) => {
  await setLogo(request, qa, qa.tenantA, null);
  await loginPlatform(page, qa);
  await page.goto(`${qa.publicBase}/admin/institutions/${qa.tenantA.id}`);
  const logo = logoSection(page);
  await logo.getByLabel("Imagen del logo").setInputFiles({ name: "synthetic-acceptance.png", mimeType: "image/png", buffer: syntheticLogo() });
  await expect(logo.getByRole("img", { name: "Vista previa del nuevo logo", exact: true })).toBeVisible();
  await logo.getByRole("button", { name: "Cargar logo", exact: true }).click();
  await expect(logo.getByText("Logo guardado.", { exact: true })).toBeVisible();
  const first = await (await loadedLogo(page, qa.tenantA)).getAttribute("src");
  await logo
    .getByLabel("Imagen del logo")
    .setInputFiles({ name: "synthetic-replacement.png", mimeType: "image/png", buffer: syntheticLogo(10, 70, 110) });
  await logo.getByRole("button", { name: "Reemplazar logo", exact: true }).click();
  await expect
    .poll(async () => logo.getByRole("img", { name: `Logo de ${qa.tenantA.name}`, exact: true }).getAttribute("src"), {
      message: "Replacement has a fresh opaque logo version",
    })
    .not.toBe(first);
  await loadedLogo(page, qa.tenantA);
  await safeCapture(page, info, "platform-logo-replaced.png");
  await logo.getByRole("button", { name: "Eliminar logo", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar logo", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(logo.getByText("Logo eliminado. Se mostrará el nombre de la institución.", { exact: true })).toBeVisible();
  await expect(logo.getByRole("button", { name: "Cargar logo", exact: true })).toBeVisible();
});

test("[L02.institution-logo-lifecycle] institutional authority UI uploads, replaces and removes only its own logo", async ({
  page,
  request,
}, info) => {
  await setLogo(request, qa, qa.tenantA, null);
  await loginInstitution(page, qa, qa.tenantA);
  await page.goto(`${tenantPublicBase(qa, qa.tenantA)}/institution`);
  const logo = logoSection(page);
  await logo.getByLabel("Imagen del logo").setInputFiles({ name: "synthetic-authority.png", mimeType: "image/png", buffer: syntheticLogo() });
  await logo.getByRole("button", { name: "Cargar logo", exact: true }).click();
  await expect(logo.getByText("Logo guardado.", { exact: true })).toBeVisible();
  const first = await (await loadedLogo(page, qa.tenantA)).getAttribute("src");
  await logo
    .getByLabel("Imagen del logo")
    .setInputFiles({ name: "synthetic-authority-replacement.png", mimeType: "image/png", buffer: syntheticLogo(10, 70, 110) });
  await logo.getByRole("button", { name: "Reemplazar logo", exact: true }).click();
  await expect
    .poll(async () => logo.getByRole("img", { name: `Logo de ${qa.tenantA.name}`, exact: true }).getAttribute("src"), {
      message: "Institutional replacement updates opaque version",
    })
    .not.toBe(first);
  await loadedLogo(page, qa.tenantA);
  await safeCapture(page, info, "institution-logo-replaced.png");
  await logo.getByRole("button", { name: "Eliminar logo", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar logo", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(logo.getByText(/Sin logo/)).toBeVisible();
});

test("[L03.real-image-validation] [L03.replacement-failure] invalid real bytes/oversize fail without replacing displayed logo", async ({
  page,
  request,
}) => {
  await setLogo(request, qa, qa.tenantA, syntheticLogo());
  await loginPlatform(page, qa);
  await page.goto(`${qa.publicBase}/admin/institutions/${qa.tenantA.id}`);
  const logo = logoSection(page);
  const oldSource = await (await loadedLogo(page, qa.tenantA)).getAttribute("src");
  await logo
    .getByLabel("Imagen del logo")
    .setInputFiles({ name: "malformed.png", mimeType: "image/png", buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>") });
  await logo.getByRole("button", { name: "Reemplazar logo", exact: true }).click();
  await expect(logo.getByText("El logo debe ser una imagen PNG o JPEG válida de hasta 2 MiB.", { exact: true })).toBeVisible();
  expect(
    await logo.getByRole("img", { name: `Logo de ${qa.tenantA.name}`, exact: true }).getAttribute("src"),
    "Failed replacement retains the old displayed image URL",
  ).toBe(oldSource);
  await loadedLogo(page, qa.tenantA);
  const tokens = await platformTokens(request, qa);
  const oversized = await request.put(backendUrl(qa, `/api/v1/admin/institutions/${qa.tenantA.id}/logo`), {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    multipart: { file: { name: "oversized.png", mimeType: "image/png", buffer: Buffer.alloc(2 * 1024 * 1024 + 1) } },
  });
  assertStatus(oversized, 400, "Backend enforces logo byte size, independently of UI");
});

test("[L03.logo-cache-fallback] public same-host image updates opaque version, is no-store and falls back to name after removal", async ({
  page,
  request,
}, info) => {
  await setLogo(request, qa, qa.tenantA, syntheticLogo());
  const publicBase = tenantPublicBase(qa, qa.tenantA);
  await page.goto(`${publicBase}/auth/login`);
  const first = await (await loadedLogo(page, qa.tenantA)).getAttribute("src");
  const imageResult = await page.evaluate(async () => {
    const image = [...document.images].find((candidate) => candidate.src.includes("/api/public/institutions/"));
    if (!image) {
      return { status: 0, cache: "", safe: false };
    }
    const response = await fetch(image.src);
    return {
      status: response.status,
      cache: response.headers.get("cache-control"),
      safe: response.headers.get("x-content-type-options") === "nosniff",
    };
  });
  expect(imageResult).toEqual({ status: 200, cache: "no-store", safe: true });
  await setLogo(request, qa, qa.tenantA, syntheticLogo(10, 70, 110));
  await page.reload();
  expect(await (await loadedLogo(page, qa.tenantA)).getAttribute("src")).not.toBe(first);
  await setLogo(request, qa, qa.tenantA, null);
  await page.reload();
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByText(qa.tenantA.name, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await safeCapture(page, info, "logo-removed-auth-fallback.png");
});

test("[A05.refresh-browser] concurrent protected browser reads rotate host-only cookies and copied refresh cannot cross tenants", async ({
  page,
  browser,
}) => {
  const publicBase = tenantPublicBase(qa, qa.tenantA);
  await loginInstitution(page, qa, qa.tenantA);
  const original = (await page.context().cookies(publicBase)).find((cookie) => cookie.name === REFRESH_COOKIE);
  expect(Boolean(original?.value), "Password login issued refresh cookie").toBe(true);
  if (!original) {
    throw new Error("Login did not issue refresh cookie.");
  }
  await page.context().clearCookies({ name: ACCESS_COOKIE });
  const path = `/api/institutional/search?institutionId=${qa.tenantA.id}&search=Prueba&limit=2`;
  const statuses = await page.evaluate(
    async (target) => Promise.all([fetch(target), fetch(target)]).then((responses) => responses.map((response) => response.status)),
    path,
  );
  expect(statuses).toEqual([200, 200]);
  const rotated = await page.context().cookies(publicBase);
  const refresh = rotated.find((cookie) => cookie.name === REFRESH_COOKIE);
  const access = rotated.find((cookie) => cookie.name === ACCESS_COOKIE);
  expect(Boolean(refresh?.value && refresh.value !== original.value), "Refresh token rotated without logging its value").toBe(true);
  expect(Boolean(access?.value), "Current upstream requests received the rotated access token").toBe(true);
  for (const cookie of [access, refresh]) {
    expect(cookie?.domain, "Cookie stays host-only").toBe(new URL(publicBase).hostname);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.secure).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
  }
  if (!refresh) {
    throw new Error("Rotated refresh cookie is absent.");
  }
  const attack = await browser.newContext({ ignoreHTTPSErrors: true });
  try {
    const peerBase = tenantPublicBase(qa, qa.tenantB);
    await attack.addCookies([{ name: REFRESH_COOKIE, value: refresh.value, url: peerBase, httpOnly: true, secure: true, sameSite: "Lax" }]);
    const peer = await attack.newPage();
    const response = await peer.goto(`${peerBase}/api/institutional/search?institutionId=${qa.tenantB.id}&search=Prueba&limit=2`);
    expect(response?.status(), "Copied tenant-A refresh cannot authorize tenant-B browser").toBe(403);
    const peerCookies = await attack.cookies(peerBase);
    expect(
      peerCookies.some((cookie) => cookie.name === ACCESS_COOKIE),
      "No rotated access cookie leaks into another tenant",
    ).toBe(false);
    expect(
      peerCookies.find((cookie) => cookie.name === REFRESH_COOKIE)?.value === refresh.value,
      "403 neither clears nor replaces the copied refresh cookie",
    ).toBe(true);
  } finally {
    await attack.close();
  }
});

test("[A06.canonical-email] [A06.registration-verification] [A06.invalid-tokens] [L02.logo-authorization] new branded applicant verifies captured mail; wrong-host/reused tokens and unprivileged logo writes fail", async ({
  page,
  request,
}) => {
  const applicant = syntheticApplicant(fixture.namespace, qa, "verification");
  await registerApplicant(page, qa, applicant);
  const link = await mailLink(request, qa, applicant.email, "/auth/email-verification/confirm");
  const wrongHost = new URL(link);
  wrongHost.hostname = new URL(tenantPublicBase(qa, qa.tenantB)).hostname;
  await page.goto(wrongHost.href);
  await page.getByRole("button", { name: "Confirmar correo electrónico", exact: true }).click();
  await expect(page.getByText("Este acceso pertenece a otra institución.", { exact: true })).toBeVisible();
  await confirmApplicant(page, link, qa);
  const token = new URL(link).searchParams.get("token");
  const reused = await request.post(backendUrl(qa, "/api/v1/auth/email-verification/confirm"), {
    headers: tenantHeader(qa, qa.tenantA),
    data: { token },
  });
  assertStatus(reused, 400, "Consumed verification token cannot be reused");
  const invalid = await request.post(backendUrl(qa, "/api/v1/auth/email-verification/confirm"), {
    headers: tenantHeader(qa, qa.tenantA),
    data: { token: "invalid-token" },
  });
  assertStatus(invalid, 400, "Malformed verification token is rejected");
  const syntheticTenant = { ...qa.tenantA, document: applicant.document, email: applicant.email, password: applicant.password };
  await loginInstitution(page, qa, syntheticTenant);
  const student = await institutionTokens(request, qa, syntheticTenant);
  const forbidden = await request.put(backendUrl(qa, `/api/v1/institutions/${qa.tenantA.id}/logo`), {
    headers: { ...tenantHeader(qa, qa.tenantA), Authorization: `Bearer ${student.accessToken}` },
    multipart: { file: { name: "student-forbidden.png", mimeType: "image/png", buffer: syntheticLogo() } },
  });
  assertStatus(forbidden, 403, "Self-registered student lacks institutional logo update permission");
  const authority = await institutionTokens(request, qa, qa.tenantA);
  const peer = await request.delete(backendUrl(qa, `/api/v1/institutions/${qa.tenantB.id}/logo`), {
    headers: { ...tenantHeader(qa, qa.tenantA), Authorization: `Bearer ${authority.accessToken}` },
  });
  assertStatus(peer, 403, "Institutional authority cannot change another institution's logo");
});

test("[A06.password-recovery] [A06.invalid-tokens] new synthetic applicant resets through branded captured mail; peer/reused reset tokens fail", async ({
  page,
  request,
}) => {
  const applicant = syntheticApplicant(fixture.namespace, qa, "recovery");
  await registerApplicant(page, qa, applicant);
  await confirmApplicant(page, await mailLink(request, qa, applicant.email, "/auth/email-verification/confirm"), qa);
  const base = tenantPublicBase(qa, qa.tenantA);
  await page.goto(`${base}/auth/password-recovery`);
  await expect(page.getByRole("combobox", { name: /Institución/ })).toHaveCount(0);
  await page.getByLabel(/Documento/).fill(applicant.document);
  await page.getByRole("button", { name: "Enviar enlace", exact: true }).click();
  await expect(page.getByText("Solicitud recibida", { exact: true })).toBeVisible();
  const link = await mailLink(request, qa, applicant.email, "/auth/password-recovery/reset");
  const resetToken = new URL(link).searchParams.get("token");
  const newPassword = `${applicant.password}R9!`;
  const peer = await request.post(backendUrl(qa, "/api/v1/auth/password-recovery/reset"), {
    headers: tenantHeader(qa, qa.tenantB),
    data: { token: resetToken, password: newPassword, confirmPassword: newPassword },
  });
  assertStatus(peer, 403, "Recovery token cannot be consumed by another host");
  await page.goto(link);
  await page.getByLabel("Nueva contraseña", { exact: false }).fill(newPassword);
  await page.getByLabel("Confirmar contraseña", { exact: false }).fill(newPassword);
  await page.getByRole("button", { name: "Restablecer contraseña", exact: true }).click();
  await expect(page).toHaveURL(`${base}/auth/login`);
  await expect(page.getByText("¡Listo! Contraseña actualizada", { exact: true })).toBeVisible();
  const reused = await request.post(backendUrl(qa, "/api/v1/auth/password-recovery/reset"), {
    headers: tenantHeader(qa, qa.tenantA),
    data: { token: resetToken, password: newPassword, confirmPassword: newPassword },
  });
  assertStatus(reused, 400, "Consumed recovery token cannot be reused");
  const invalid = await request.post(backendUrl(qa, "/api/v1/auth/password-recovery/reset"), {
    headers: tenantHeader(qa, qa.tenantA),
    data: { token: "invalid-token", password: newPassword, confirmPassword: newPassword },
  });
  assertStatus(invalid, 400, "Malformed recovery token is rejected");
  await loginInstitution(page, qa, { ...qa.tenantA, document: applicant.document, email: applicant.email, password: newPassword });
});

// Keep WebAuthn last: adding a fixture passkey intentionally changes its next login step.
test("[A04.passkey-general-branded] [A04.untrusted-origin] real virtual key registered on general host logs in on branded host but rejects signed peer-origin assertion", async ({
  page,
  request,
}, info) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  const { authenticatorId } = await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "usb",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  try {
    await loginInstitution(page, qa, qa.tenantA, false);
    expect(await page.evaluate(() => window.isSecureContext), "Actual HTTPS secure context enables WebAuthn").toBe(true);
    await page.goto(`${qa.publicBase}/account/passkeys`);
    await page.getByRole("button", { name: "Añadir llave de acceso", exact: true }).click();
    const label = "Llave sintética de aceptación";
    await page.getByRole("dialog").getByLabel("Nombre", { exact: false }).fill(label);
    await page.getByRole("dialog").getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByText(label, { exact: true })).toBeVisible();
    const stored = await cdp.send("WebAuthn.getCredentials", { authenticatorId });
    expect(stored.credentials.length, "Real Chromium virtual authenticator retained one credential").toBe(1);
    await page.context().clearCookies();

    const identified = await request.post(backendUrl(qa, "/api/v1/auth/login/identify"), {
      headers: tenantHeader(qa, qa.tenantA),
      data: { institutionId: qa.tenantA.id, documentNumber: qa.tenantA.document },
    });
    assertStatus(identified, 200, "Create actual passkey login attempt");
    const { loginAttemptId } = (await identified.json()) as { loginAttemptId: string };
    const optionsResponse = await request.post(backendUrl(qa, "/api/v1/auth/passkeys/authentication/options"), {
      headers: tenantHeader(qa, qa.tenantA),
      data: { loginAttemptId },
    });
    assertStatus(optionsResponse, 200, "Issue real tenant-A challenge");
    const options = (await optionsResponse.json()) as { ceremonyId: string; options: PublicKeyCredentialRequestOptionsJSON };
    await page.goto(`${tenantPublicBase(qa, qa.tenantB)}/auth/login`);
    const credential = await page.evaluate(async (json) => {
      const options = PublicKeyCredential.parseRequestOptionsFromJSON(json);
      const credential = (await navigator.credentials.get({ publicKey: options })) as PublicKeyCredential | null;
      if (!credential) {
        throw new Error("Virtual authenticator did not produce an assertion.");
      }
      return credential.toJSON();
    }, options.options);
    const rejected = await request.post(backendUrl(qa, "/api/v1/auth/passkeys/authentication/verify"), {
      headers: tenantHeader(qa, qa.tenantA),
      data: { loginAttemptId, ceremonyId: options.ceremonyId, credential, rememberMe: false },
    });
    assertStatus(rejected, 401, "A validly signed peer-origin credential is rejected");

    const base = tenantPublicBase(qa, qa.tenantA);
    await page.goto(`${base}/auth/login`);
    await page.getByLabel(/Documento/).fill(qa.tenantA.document);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ingresá con tu llave de acceso", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page).toHaveURL(`${base}/`);
    expect(
      (await page.context().cookies(base)).some((cookie) => cookie.name === ACCESS_COOKIE),
      "Branded passkey login issued host-only access cookie",
    ).toBe(true);
    await safeCapture(page, info, "branded-passkey-authenticated.png");
  } finally {
    await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId });
    await cdp.detach();
  }
});
