import { readFileSync, writeFileSync } from "node:fs";
import { argv, env } from "node:process";

const [fullPath, productionPath, outputPath] = argv.slice(2);

if (!fullPath || !productionPath || !outputPath) {
  throw new Error("Expected full SBOM, production SBOM and output paths");
}

if (!/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "") || !env.GITHUB_REF?.startsWith("refs/heads/") || !env.GITHUB_RUN_ID) {
  throw new Error("A commit SHA, branch ref and run ID are required");
}

const full = JSON.parse(readFileSync(fullPath, "utf8"));

const production = JSON.parse(readFileSync(productionPath, "utf8"));

const manifest = JSON.parse(readFileSync("package.json", "utf8"));

function references(bom) {
  if (bom.bomFormat !== "CycloneDX" || bom.metadata?.component?.name !== manifest.name || !bom.components?.length) {
    throw new Error("Expected a nonempty application SBOM for the current project");
  }

  const result = new Map();

  for (const component of bom.components) {
    const reference = component["bom-ref"];

    const purl = component.purl;

    if (!reference || typeof purl !== "string" || !purl.startsWith("pkg:npm/") || purl.lastIndexOf("@") <= 8 || purl.endsWith("@")) {
      throw new Error("Every dependency must have a versioned npm package URL and a reference");
    }

    if (result.has(reference) && result.get(reference) !== purl) {
      throw new Error("Conflicting package references in the SBOM");
    }

    result.set(reference, purl);
  }

  return result;
}

const packages = references(full);

const runtime = new Set(references(production).values());

const inventory = new Set(packages.values());

if ([...runtime].some((purl) => !inventory.has(purl))) {
  throw new Error("Production SBOM contains dependencies absent from the complete inventory");
}

function packageUrl(reference) {
  const purl = packages.get(reference);

  if (!purl) {
    throw new Error(`Unresolved dependency reference: ${reference}`);
  }

  return purl;
}

const root = full.metadata.component["bom-ref"];

const rootDependencies = full.dependencies?.find((dependency) => dependency.ref === root);

if (!rootDependencies) {
  throw new Error("The SBOM omits the application's dependency relationships");
}

const direct = new Set(rootDependencies.dependsOn.map(packageUrl));

const directNames = new Set([...direct].map((purl) => decodeURIComponent(purl.slice(8, purl.lastIndexOf("@")))));

const declared = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies, ...manifest.optionalDependencies });

const missing = declared.filter((name) => !directNames.has(name));

if (missing.length) {
  throw new Error(`The SBOM omits declared dependencies: ${missing.join(", ")}`);
}

const resolved = {};

for (const purl of packages.values()) {
  resolved[purl] = {
    package_url: purl,
    relationship: direct.has(purl) ? "direct" : "indirect",
    scope: runtime.has(purl) ? "runtime" : "development",
    dependencies: [],
  };
}

for (const dependency of full.dependencies) {
  if (dependency.ref === root) {
    continue;
  }

  const purl = packageUrl(dependency.ref);

  const children = new Set([...resolved[purl].dependencies, ...dependency.dependsOn.map(packageUrl)]);

  children.delete(purl);
  resolved[purl].dependencies = [...children].sort();
}

const pnpm = full.metadata.tools?.components?.find((tool) => tool.name === "pnpm");

if (!pnpm?.version || !Number.isFinite(Date.parse(full.metadata.timestamp))) {
  throw new Error("The SBOM must identify its pnpm version and scan time");
}

const snapshot = {
  version: 0,
  sha: env.GITHUB_SHA,
  ref: env.GITHUB_REF,
  job: { id: `${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT ?? "1"}`, correlator: "pnpm-native-sbom" },
  detector: { name: "pnpm-native-sbom", version: pnpm.version, url: "https://pnpm.io/cli/sbom" },
  scanned: full.metadata.timestamp,
  manifests: {
    "pnpm-lock.yaml": {
      name: "pnpm-lock.yaml",
      file: { source_location: "pnpm-lock.yaml" },
      resolved,
    },
  },
};

writeFileSync(outputPath, `${JSON.stringify(snapshot)}\n`);
console.info(`Dependency snapshot contains ${Object.keys(resolved).length} package versions`);
