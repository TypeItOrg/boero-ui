"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicInstitution } from "@features/institutions/types/public-institution.types";

const InstitutionalBrandContext = createContext<PublicInstitution | undefined>(undefined);

export function InstitutionalBrandProvider({ institution, children }: { institution?: PublicInstitution; children: ReactNode }): React.ReactElement {
  return <InstitutionalBrandContext.Provider value={institution}>{children}</InstitutionalBrandContext.Provider>;
}

export function useInstitutionalBrand(): PublicInstitution | undefined {
  return useContext(InstitutionalBrandContext);
}
