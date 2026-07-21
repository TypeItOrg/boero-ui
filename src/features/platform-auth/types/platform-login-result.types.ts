import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

export type PlatformLoginResult = {
  account: PlatformAccount;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};
