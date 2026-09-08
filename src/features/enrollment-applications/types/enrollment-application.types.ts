export type EnrollmentApplicationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED" | "REJECTED";

export type EnrollmentDocumentType = "DNI_FRONT" | "DNI_BACK" | "SECONDARY_CERTIFICATE" | "HEALTH_REPORT" | "PHOTO_4X4";

export interface EnrollmentAttachment {
  id: string;
  documentType: EnrollmentDocumentType;
  fileName: string;
  contentType?: string;
  fileSize?: number;
  url?: string;
  uploadedAt?: string;
}

export interface EnrollmentPersonalData {
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface EnrollmentEducationBackground {
  secondarySchool: string;
  graduationYear?: string;
  isSecondaryComplete: boolean;
  secondaryTitle?: string;
}

export interface EnrollmentHealthInclusion {
  requiresSupport: boolean;
  supportDetails?: string;
}

export interface EnrollmentResponsible {
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  occupation: string;
  educationLevel: string;
}

export interface EnrollmentPreferences {
  preferredShift: string;
  imageAuthorization: boolean;
  isReentering: boolean;
  previousTeacher?: string;
}

export interface EnrollmentApplicationData {
  personalData?: Partial<EnrollmentPersonalData>;
  educationBackground?: Partial<EnrollmentEducationBackground>;
  academicBackground?: { secondarySchool?: string };
  healthInclusion?: Partial<EnrollmentHealthInclusion>;
  responsible?: Partial<EnrollmentResponsible>;
  preferences?: Partial<EnrollmentPreferences>;
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
  institutionId?: string;
  enrollmentPeriodId?: string;
  status?: EnrollmentApplicationStatus | string;
  search?: string;
  page?: number;
  size?: number;
}
