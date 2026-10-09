import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const requireFromEslint = createRequire(require.resolve("eslint-config-next"));

const requireFromNextPlugin = createRequire(requireFromEslint.resolve("@next/eslint-plugin-next"));

const requireFromFastGlob = createRequire(requireFromNextPlugin.resolve("fast-glob"));

const requireFromMicromatch = createRequire(requireFromFastGlob.resolve("micromatch"));

const bracesPath = requireFromMicromatch.resolve("braces");

const braces = requireFromMicromatch("braces") as {
  compile: (input: string) => string;
  expand: (input: string) => string[];
  parse: (input: string) => unknown;
  stringify: (input: unknown) => string;
};

describe("braces security patch", () => {
  it("rejects hostile pattern and AST nesting before exhausting the call stack", () => {
    const probe = `
      const assert = require("node:assert/strict");
      const braces = require(process.argv[1]);

      const patterns = [
        "{".repeat(4000) + "a,b" + "}".repeat(4000),
        "(".repeat(4000) + "a" + ")".repeat(4000),
        "{".repeat(4000),
      ];

      for (const pattern of patterns) {
        assert.throws(() => braces.parse(pattern), SyntaxError);

        for (const method of ["compile", "expand", "stringify"]) {
          assert.throws(() => braces[method](pattern), SyntaxError);
        }
      }

      let ast = { type: "text", value: "a" };

      for (let index = 0; index < 4000; index++) {
        ast = { type: "root", nodes: [ast] };
      }

      for (const method of ["compile", "expand", "stringify"]) {
        assert.throws(() => braces[method](ast), SyntaxError);
      }
    `;

    execFileSync(process.execPath, ["--stack-size=512", "-e", probe, bracesPath], { stdio: "pipe" });
  });

  it("preserves ordinary alternations, ranges and AST round trips", () => {
    const pattern = "{admin,institution}-{1..2}";

    const matches = ["admin-1", "admin-2", "institution-1", "institution-2"];

    const expression = new RegExp(`^${braces.compile(pattern)}$`);

    expect(braces.expand(pattern)).toEqual(matches);
    expect(braces.stringify(braces.parse(pattern))).toBe(pattern);

    for (const match of matches) {
      expect(expression.test(match)).toBe(true);
    }

    expect(expression.test("admin-3")).toBe(false);
    expect(expression.test("visitor-1")).toBe(false);
  });
});
