import type { AcceptanceStack } from "./acceptance-stack.types";

export type AcceptanceFixture = {
  namespace: string;
  stacks: { qa: AcceptanceStack; staging: AcceptanceStack };
};
