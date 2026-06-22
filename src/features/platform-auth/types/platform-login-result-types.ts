import type { PlatformAccount } from "./platform-account-types";

export type PlatformLoginResult = {
  account: PlatformAccount;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};
