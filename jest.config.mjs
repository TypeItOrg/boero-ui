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
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
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
  const { maxWorkers, ...projectConfig } = config;
  const browserTests = [
    "<rootDir>/src/proxy.test.ts",
    "<rootDir>/src/proxy-institutional-host.test.ts",
    "<rootDir>/src/common/hooks/**/*.test.ts",
    "<rootDir>/src/features/institutional-auth/utils/webauthn-capability.util.test.ts",
    "<rootDir>/src/features/institutional-auth/utils/passkey-authentication.util.test.ts",
  ];
  const sharedConfig = {
    ...projectConfig,
    transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],
  };

  return {
    maxWorkers,
    projects: [
      {
        ...sharedConfig,
        displayName: "node",
        testEnvironment: "node",
        setupFiles: [],
        setupFilesAfterEnv: [],
        testMatch: ["<rootDir>/**/__tests__/**/*.?([mc])[jt]s", "<rootDir>/**/?(*.)+(spec|test).?([mc])[jt]s"],
        testPathIgnorePatterns: [
          ...config.testPathIgnorePatterns,
          "<rootDir>/src/proxy.*test.ts",
          "<rootDir>/src/common/hooks/",
          "<rootDir>/src/features/institutional-auth/utils/webauthn-capability.util.test.ts",
          "<rootDir>/src/features/institutional-auth/utils/passkey-authentication.util.test.ts",
        ],
      },
      {
        ...sharedConfig,
        displayName: "browser",
        testMatch: ["<rootDir>/**/__tests__/**/*.?([mc])[jt]sx", "<rootDir>/**/?(*.)+(spec|test).?([mc])[jt]sx", ...browserTests],
      },
    ],
  };
}

export default buildFinalJestConfig;
