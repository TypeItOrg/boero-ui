import "server-only";

import type { Metadata } from "next";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";

export async function getInstitutionalMetadata(pageTitle: string): Promise<Metadata> {
  const person = await fetchInstitutionalPerson();
  const institutionName = person?.institutionName || "Boero";

  return {
    title: {
      absolute: `${pageTitle} | ${institutionName}`,
    },
  };
}
