export const platformAccountKeys = {
  ALL: ["platform-account"] as const,
  byAccount(platformAccountId: string | null): readonly ["platform-account", string | null] {
    return ["platform-account", platformAccountId];
  },
};
