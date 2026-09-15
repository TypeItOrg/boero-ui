import type { EnrollmentAttachment } from "@features/enrollment-applications/types/enrollment-attachment.types";
import type { EnrollmentPersonalData } from "@features/enrollment-applications/types/enrollment-personal-data.types";
import type { EnrollmentAcademicBackground } from "@features/enrollment-applications/types/enrollment-academic-background.types";
import type { EnrollmentHealthInclusion } from "@features/enrollment-applications/types/enrollment-health-inclusion.types";
import type { EnrollmentResponsible } from "@features/enrollment-applications/types/enrollment-responsible.types";
import type { EnrollmentPreference } from "@features/enrollment-applications/types/enrollment-preference.types";
import type { EnrollmentCareerSelection } from "@features/enrollment-applications/types/enrollment-career-selection.types";
import type { EnrollmentAcademicSpaceSelection } from "@features/enrollment-applications/types/enrollment-academic-space-selection.types";
import type { EnrollmentInstrumentSelection } from "@features/enrollment-applications/types/enrollment-instrument-selection.types";

export interface EnrollmentApplicationData {
  personalData?: Partial<EnrollmentPersonalData>;
  academicBackground?: Partial<EnrollmentAcademicBackground>;
  healthInclusion?: Partial<EnrollmentHealthInclusion>;
  responsible?: Partial<EnrollmentResponsible>;
  preference?: Partial<EnrollmentPreference>;
  careerSelection?: EnrollmentCareerSelection;
  academicSpaceSelection?: EnrollmentAcademicSpaceSelection;
  instrumentSelection?: EnrollmentInstrumentSelection;
  attachments?: EnrollmentAttachment[];
  [key: string]: unknown;
}
