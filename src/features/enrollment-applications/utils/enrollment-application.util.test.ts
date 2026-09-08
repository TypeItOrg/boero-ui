import {
  formatApplicationDate,
  formatApplicationDateTime,
  formatBirthDate,
  formatFileSize,
  getApplicantDni,
  getApplicantFullName,
} from "./enrollment-application.util";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

describe("enrollment-application.util", () => {
  const baseApplication: EnrollmentApplicationResponse = {
    applicationId: "app-123",
    institutionId: "inst-1",
    personId: "person-1",
    studyPlanId: "plan-1",
    academicYearId: "year-1",
    enrollmentPeriodId: "period-1",
    status: "SUBMITTED",
    isEditable: false,
    data: {},
    createdAt: "2026-03-01T10:30:00Z",
    updatedAt: "2026-03-01T10:30:00Z",
  };

  describe("getApplicantFullName", () => {
    it("returns applicantName if present", () => {
      const app: EnrollmentApplicationResponse = {
        ...baseApplication,
        applicantName: "Juan Gómez",
      };
      expect(getApplicantFullName(app)).toBe("Juan Gómez");
    });

    it("extracts full name from personalData if applicantName is missing", () => {
      const app: EnrollmentApplicationResponse = {
        ...baseApplication,
        data: {
          personalData: {
            firstName: "María",
            lastName: "López",
          },
        },
      };
      expect(getApplicantFullName(app)).toBe("María López");
    });

    it("returns fallback when no name is found", () => {
      expect(getApplicantFullName(baseApplication)).toBe("Sin nombre registrado");
    });
  });

  describe("getApplicantDni", () => {
    it("returns applicantDocumentNumber if present", () => {
      const app: EnrollmentApplicationResponse = {
        ...baseApplication,
        applicantDocumentNumber: "38999888",
      };
      expect(getApplicantDni(app)).toBe("38999888");
    });

    it("extracts DNI from personalData if applicantDocumentNumber is missing", () => {
      const app: EnrollmentApplicationResponse = {
        ...baseApplication,
        data: {
          personalData: {
            documentNumber: "40111222",
          },
        },
      };
      expect(getApplicantDni(app)).toBe("40111222");
    });

    it("returns fallback when no DNI is found", () => {
      expect(getApplicantDni(baseApplication)).toBe("—");
    });
  });

  describe("formatApplicationDate", () => {
    it("formats ISO date string into DD/MM/YYYY", () => {
      const result = formatApplicationDate("2026-05-15T00:00:00Z");
      expect(result).toMatch(/15\/05\/2026/);
    });

    it("returns — for null or undefined", () => {
      expect(formatApplicationDate(null)).toBe("—");
      expect(formatApplicationDate(undefined)).toBe("—");
    });
  });

  describe("formatApplicationDateTime", () => {
    it("formats ISO date string with time", () => {
      const result = formatApplicationDateTime("2026-05-15T14:30:00Z");
      expect(result).toContain("15/05/2026");
    });

    it("returns — for null or undefined", () => {
      expect(formatApplicationDateTime(null)).toBe("—");
      expect(formatApplicationDateTime(undefined)).toBe("—");
    });
  });

  describe("formatBirthDate", () => {
    it("formats YYYY-MM-DD string into DD/MM/YYYY", () => {
      expect(formatBirthDate("2000-11-20")).toBe("20/11/2000");
    });

    it("returns — for null or undefined", () => {
      expect(formatBirthDate(null)).toBe("—");
    });
  });

  describe("formatFileSize", () => {
    it("formats bytes, KB and MB", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(2048)).toBe("2.0 KB");
      expect(formatFileSize(5242880)).toBe("5.0 MB");
    });

    it("handles undefined or null gracefully", () => {
      expect(formatFileSize(undefined)).toBe("");
    });
  });
});
