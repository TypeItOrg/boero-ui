import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

export type InstitutionalLoginResult = {
  user: InstitutionalUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};
