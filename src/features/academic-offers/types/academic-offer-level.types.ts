import type { AcademicOfferSpace } from "@features/academic-offers/types/academic-offer-space.types";

export type AcademicOfferLevel = {
  id: string;
  name: string;
  displayOrder: number;
  description: string | null;
  spaces: AcademicOfferSpace[];
};
