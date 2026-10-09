import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const script = resolve("scripts/dependency-snapshot.mjs");

const directories: string[] = [];

function fixture() {
  const full = {
    bomFormat: "CycloneDX",
    metadata: {
      timestamp: "2026-10-09T00:35:42Z",
      component: { name: "boero-ui", "bom-ref": "application" },
      tools: { components: [{ name: "pnpm", version: "12.3.4" }] },
    },
    components: [
      { "bom-ref": "next", purl: "pkg:npm/next@16.3.8" },
      { "bom-ref": "eslint", purl: "pkg:npm/eslint@9.39.4" },
      { "bom-ref": "shared", purl: "pkg:npm/%40example/shared@1.0.0" },
    ],
    dependencies: [
      { ref: "application", dependsOn: ["next", "eslint"] },
      { ref: "next", dependsOn: ["shared"] },
      { ref: "eslint", dependsOn: ["shared"] },
      { ref: "shared", dependsOn: [] },
    ],
  };

  const production = {
    ...full,
    components: full.components.filter((component) => component["bom-ref"] !== "eslint").map((component) => ({ ...component })),
  };

  return { full, production };
}

function runSnapshot(full: unknown, production: unknown) {
  const directory = mkdtempSync(join(tmpdir(), "boero-dependency-snapshot-"));

  directories.push(directory);

  const fullPath = join(directory, "full.json");

  const productionPath = join(directory, "production.json");

  const outputPath = join(directory, "snapshot.json");

  writeFileSync(fullPath, JSON.stringify(full));
  writeFileSync(productionPath, JSON.stringify(production));
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({ name: "boero-ui", dependencies: { next: "16.3.8" }, devDependencies: { eslint: "9.39.4" } }),
  );

  execFileSync(process.execPath, [script, fullPath, productionPath, outputPath], {
    cwd: directory,
    stdio: "pipe",
    env: {
      ...process.env,
      GITHUB_SHA: "a".repeat(40),
      GITHUB_REF: "refs/heads/develop",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "2",
    },
  });

  return JSON.parse(readFileSync(outputPath, "utf8"));
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("GitHub dependency snapshot", () => {
  it("preserves direct and transitive dependencies, with runtime taking precedence over development", () => {
    const { full, production } = fixture();

    const snapshot = runSnapshot(full, production);

    const manifest = snapshot.manifests["pnpm-lock.yaml"];

    expect(snapshot.sha).toBe("a".repeat(40));
    expect(snapshot.ref).toBe("refs/heads/develop");
    expect(snapshot.job).toEqual({ id: "123-2", correlator: "pnpm-native-sbom" });
    expect(manifest.file.source_location).toBe("pnpm-lock.yaml");
    expect(Object.keys(manifest.resolved)).toHaveLength(3);
    expect(manifest.resolved["pkg:npm/next@16.3.8"]).toEqual({
      package_url: "pkg:npm/next@16.3.8",
      relationship: "direct",
      scope: "runtime",
      dependencies: ["pkg:npm/%40example/shared@1.0.0"],
    });
    expect(manifest.resolved["pkg:npm/eslint@9.39.4"]).toMatchObject({ relationship: "direct", scope: "development" });
    expect(manifest.resolved["pkg:npm/%40example/shared@1.0.0"]).toMatchObject({ relationship: "indirect", scope: "runtime" });
  });

  it("merges peer variants without dropping their dependencies or adding self references", () => {
    const { full, production } = fixture();

    full.components.push(
      { "bom-ref": "shared-peer", purl: "pkg:npm/%40example/shared@1.0.0" },
      { "bom-ref": "left", purl: "pkg:npm/left@1.0.0" },
      { "bom-ref": "right", purl: "pkg:npm/right@1.0.0" },
    );
    full.dependencies.find((dependency) => dependency.ref === "shared")!.dependsOn = ["left", "shared-peer"];
    full.dependencies.push({ ref: "shared-peer", dependsOn: ["right"] }, { ref: "left", dependsOn: [] }, { ref: "right", dependsOn: [] });

    const snapshot = runSnapshot(full, production);

    const resolved = snapshot.manifests["pnpm-lock.yaml"].resolved;

    expect(Object.keys(resolved)).toHaveLength(5);
    expect(resolved["pkg:npm/%40example/shared@1.0.0"].dependencies).toEqual(["pkg:npm/left@1.0.0", "pkg:npm/right@1.0.0"]);
  });

  it("rejects an incomplete graph instead of silently omitting declared dependencies", () => {
    const { full, production } = fixture();

    full.dependencies[0].dependsOn = ["eslint"];

    expect(() => runSnapshot(full, production)).toThrow("The SBOM omits declared dependencies: next");
  });

  it("rejects dependency edges whose package versions are absent from the inventory", () => {
    const { full, production } = fixture();

    full.dependencies[1].dependsOn = ["missing"];

    expect(() => runSnapshot(full, production)).toThrow("Unresolved dependency reference: missing");
  });

  it("rejects a production inventory generated from a different dependency resolution", () => {
    const { full, production } = fixture();

    production.components[0].purl = "pkg:npm/next@16.3.0";

    expect(() => runSnapshot(full, production)).toThrow("Production SBOM contains dependencies absent from the complete inventory");
  });
});
