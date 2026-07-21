import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  setupFiles: ["<rootDir>/jest.polyfills.mjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  maxWorkers: "50%",
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  moduleNameMapper: {
    "^msw$": "<rootDir>/node_modules/msw/lib/core/index.js",
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1",
    "^server-only$": "<rootDir>/test/mocks/server-only.ts",
  },
};

const buildJestConfig = createJestConfig(customJestConfig);

async function buildFinalJestConfig() {
  const config = await buildJestConfig();

  return {
    ...config,
    transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],
  };
}

export default buildFinalJestConfig;
