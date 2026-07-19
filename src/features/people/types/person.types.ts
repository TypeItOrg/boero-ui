export type PersonSummaryRole = {
  roleCode: string;
  displayName: string;
};

export type PersonSummary = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string | null;
  phoneNumber: string | null;
  enabled: boolean;
  roles?: PersonSummaryRole[];
};

export type PlatformPersonSummary = PersonSummary & {
  institutionId: string;
  institutionName: string;
  roles: PersonSummaryRole[];
};

export type Person = {
  personId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  institutionId: string;
  institutionName: string;
  deleted: boolean;
};
