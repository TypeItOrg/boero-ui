"use client";

import React from "react";

import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { useInstitutionalUser } from "@features/institutional-auth/hooks/use-institutional-user.hook";

type InstitutionalUserProviderProps = {
  initialUser: InstitutionalUser | null;
  children: React.ReactNode;
};

export function InstitutionalUserProvider({ initialUser, children }: InstitutionalUserProviderProps): React.ReactNode {
  useInstitutionalUser({ initialData: initialUser });

  return <React.Fragment>{children}</React.Fragment>;
}
