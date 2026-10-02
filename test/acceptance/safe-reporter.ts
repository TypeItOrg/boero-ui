import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

type SafeTestResult = {
  title: string;
  status: string;
  duration: number;
  errors: string[];
  attachments: { name: string; path: string; sha256: string }[];
};

export default class SafeAcceptanceReporter implements Reporter {
  private readonly results: SafeTestResult[] = [];
  private readonly passwords: string[] = [];
  private readonly outputFile: string;

  constructor(options: { outputFile: string }) {
    this.outputFile = options.outputFile;
    const fixturePath = process.env.ACCEPTANCE_FIXTURE;
    if (fixturePath) {
      this.collectPasswords(JSON.parse(readFileSync(fixturePath, "utf8")) as unknown);
    }
  }

  private collectPasswords(value: unknown): void {
    if (!value || typeof value !== "object") {
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (key.toLowerCase().includes("password") && typeof child === "string") {
        this.passwords.push(child);
      } else {
        this.collectPasswords(child);
      }
    }
  }

  private redact(message: string): string {
    let safe = message;
    for (const password of this.passwords) {
      safe = safe.replaceAll(password, "[REDACTED]");
    }
    return safe
      .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[REDACTED JWT]")
      .replace(/([?&](?:token|code)=)[^&\s"'<>]+/gi, "$1[REDACTED]")
      .replace(/\b[A-Za-z0-9_-]{48,}\b/g, "[REDACTED TOKEN]");
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const title = test.titlePath().slice(1).join(" > ");
    this.results.push({
      title,
      status: result.status,
      duration: result.duration,
      errors: result.errors.map((error) => this.redact(error.message ?? "Browser check failed")),
      attachments: result.attachments.flatMap((attachment) =>
        attachment.path && attachment.contentType.startsWith("image/")
          ? [{ name: attachment.name, path: attachment.path, sha256: createHash("sha256").update(readFileSync(attachment.path)).digest("hex") }]
          : [],
      ),
    });
    process.stdout.write(`${result.status}: ${title}\n`);
  }

  onEnd(result: FullResult): void {
    mkdirSync(dirname(this.outputFile), { recursive: true });
    writeFileSync(this.outputFile, JSON.stringify({ status: result.status, tests: this.results }, null, 2) + "\n");
  }
}
