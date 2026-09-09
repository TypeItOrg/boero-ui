export type EnrollmentApplicationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED" | "REJECTED";

export type EnrollmentDocumentType = "DNI_FRONT" | "DNI_BACK" | "SECONDARY_CERTIFICATE" | "HEALTH_REPORT" | "PHOTO_ID";

export interface EnrollmentAttachment {
  id: string;
  attachmentType: EnrollmentDocumentType;
  originalFileName: string;
  contentType?: string;
  size?: number;
  url?: string;
  createdAt?: string;
}

export interface EnrollmentPersonalData {
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
}

export interface EnrollmentAcademicBackground {
  secondarySchool: string;
  schoolOrigin?: string;
  currentGradeYear?: string;
  secondaryCompleted: boolean;
  secondaryDegreeTitle?: string;
}

export interface EnrollmentHealthInclusion {
  receivesReasonableAdjustments: boolean;
  adjustmentDetails?: string;
}

export interface EnrollmentResponsible {
  fullName: string;
  documentNumber: string;
  phoneNumber: string;
  email: string;
  occupation: string;
  educationLevel: string;
}

export interface EnrollmentPreference {
  preferredShift: string;
  allowsImageUse: boolean;
  isReenrolling: boolean;
  previousTeacher?: string;
}

export interface EnrollmentCareerSelection {
  trainingPathId?: string;
}

export interface EnrollmentAcademicSpaceSelection {
  studyPlanSpaceIds?: string[];
}

export interface EnrollmentInstrumentSelection {
  studyPlanSpaceInstrumentIds?: Record<string, string>;
}

export interface EnrollmentApplicationSpaceResponse {
  spaceId: string;
  studyPlanSpaceId: string;
  spaceName: string;
  instrumentId: string | null;
  instrumentName: string | null;
  subjectCode: string | null;
  year: number | null;
}

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

export interface EnrollmentApplicationResponse {
  applicationId: string;
  institutionId: string;
  personId: string;
  studyPlanId: string;
  academicYearId: string;
  enrollmentPeriodId: string;
  studyPlanName?: string;
  academicYearName?: string;
  enrollmentPeriodName?: string;
  status: EnrollmentApplicationStatus;
  isEditable: boolean;
  data: EnrollmentApplicationData;
  spaces?: EnrollmentApplicationSpaceResponse[];
  applicantName?: string;
  applicantDocumentNumber?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface StartEnrollmentApplicationInput {
  studyPlanId: string;
  academicYearId: string;
}

export interface UpdateEnrollmentDraftInput {
  data: EnrollmentApplicationData;
}

export interface FetchEnrollmentApplicationsParams {
  periodId?: string;
  status?: EnrollmentApplicationStatus | string;
  search?: string;
  page?: number;
  size?: number;
}
