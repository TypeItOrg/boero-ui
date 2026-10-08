import { defineConfig } from "@playwright/test";

const artifacts = process.env.ACCEPTANCE_ARTIFACTS;
const fixture = process.env.ACCEPTANCE_FIXTURE;

if (!artifacts || !fixture) {
  throw new Error("Run the acceptance suite through make verify-qa-institutional-access; disposable fixtures are required.");
}

export default defineConfig({
  testDir: "./test/acceptance",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["./test/acceptance/safe-reporter.ts", { outputFile: `${artifacts}/playwright.json` }]],
  outputDir: `${artifacts}/browser-output`,
  use: {
    browserName: "chromium",
    ignoreHTTPSErrors: true, // Only the isolated, locally generated acceptance certificate.
    screenshot: "only-on-failure",
    trace: "off", // Network traces can retain tokens/passwords; explicit safe captures suffice.
    launchOptions: {
      args: ["--host-resolver-rules=MAP *.typeit.com.ar 127.0.0.1,EXCLUDE localhost"],
    },
  },
});
