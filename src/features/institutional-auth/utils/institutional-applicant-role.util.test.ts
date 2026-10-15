import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import {
  canManageDependents,
  canStartEnrollmentApplication,
  canViewOwnEnrollmentApplications,
  isGuardian,
} from "@features/institutional-auth/utils/institutional-applicant-role.util";

function createUser(roles: string[], permissions: string[] = []): InstitutionalUser {
  return {
    userId: "user-id",
    personId: "person-id",
    name: "Carlos",
    lastName: "González",
    documentNumber: "35123456",
    institutionId: "institution-id",
    roles,
    permissions,
  };
}

describe("institutional applicant role utils", () => {
  describe("canStartEnrollmentApplication", () => {
    it.each(["Postulante", "Estudiante", "Tutor"])("allows a %s", (role) => {
      expect(canStartEnrollmentApplication(createUser([role]))).toBe(true);
    });

    it.each(["Profesor", "Administrativo", "Administrador Institucional"])("does not allow a %s", (role) => {
      expect(canStartEnrollmentApplication(createUser([role]))).toBe(false);
    });
  });

  describe("canViewOwnEnrollmentApplications", () => {
    it.each(["Postulante", "Estudiante", "Tutor"])("allows a %s", (role) => {
      expect(canViewOwnEnrollmentApplications(createUser([role]))).toBe(true);
    });

    it("keeps the applicant views for staff who are also guardians", () => {
      expect(canViewOwnEnrollmentApplications(createUser(["Tutor", "Administrativo"]))).toBe(true);
    });
  });

  describe("guardians", () => {
    it("recognizes the guardian role", () => {
      expect(isGuardian(createUser(["Tutor"]))).toBe(true);
      expect(isGuardian(createUser(["Postulante"]))).toBe(false);
    });

    it("manages dependents only with the dependent management permission", () => {
      expect(canManageDependents(createUser(["Tutor"], [INSTITUTIONAL_PERMISSION.GUARDIAN_DEPENDENT_MANAGE]))).toBe(true);
      expect(canManageDependents(createUser(["Tutor"]))).toBe(false);
    });
  });
});
