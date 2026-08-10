import type { RefreshedTokens } from "@common/services/auth-proxy/refreshed-tokens.types";

export type RefreshAttempt = {
  status?: number;
  tokens?: RefreshedTokens;
};
