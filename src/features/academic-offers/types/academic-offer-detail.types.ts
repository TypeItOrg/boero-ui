import type { AcademicOfferLevel } from "@features/academic-offers/types/academic-offer-level.types";
import type { AcademicOfferSpace } from "@features/academic-offers/types/academic-offer-space.types";
import type { AcademicOfferSummary } from "@features/academic-offers/types/academic-offer-summary.types";

export type AcademicOfferDetail = {
  offer: AcademicOfferSummary;
  levels: AcademicOfferLevel[];
  unassignedSpaces: AcademicOfferSpace[];
};
