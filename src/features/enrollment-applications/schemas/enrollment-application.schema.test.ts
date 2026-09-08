import {
  calculateAge,
  personalDataSchema,
  educationBackgroundSchema,
  healthInclusionSchema,
  preferencesSchema,
  enrollmentApplicationSubmissionSchema,
} from "./enrollment-application.schema";

describe("enrollment-application.schema", () => {
  describe("calculateAge", () => {
    it("returns null for undefined or invalid date", () => {
      expect(calculateAge(undefined)).toBeNull();
      expect(calculateAge("invalid-date")).toBeNull();
    });

    it("calculates age correctly for adult", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      const age = calculateAge(birthDate);
      expect(age).toBe(25);
    });

    it("calculates age correctly for minor", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 16);
      const age = calculateAge(birthDate);
      expect(age).toBe(16);
    });
  });

  describe("step schemas", () => {
    it("validates personalDataSchema", () => {
      const valid = {
        firstName: "Juan",
        lastName: "Pérez",
        documentNumber: "40123456",
        birthDate: "2000-01-01",
        address: "San Martín 123",
        city: "Villa María",
        phone: "3534123456",
        email: "juan@example.com",
      };
      expect(personalDataSchema.safeParse(valid).success).toBe(true);

      const invalidEmail = { ...valid, email: "not-an-email" };
      expect(personalDataSchema.safeParse(invalidEmail).success).toBe(false);
    });

    it("validates educationBackgroundSchema", () => {
      expect(
        educationBackgroundSchema.safeParse({
          secondarySchool: "Colegio Nacional",
          isSecondaryComplete: true,
        }).success,
      ).toBe(true);

      expect(
        educationBackgroundSchema.safeParse({
          secondarySchool: "",
        }).success,
      ).toBe(false);
    });

    it("validates healthInclusionSchema", () => {
      expect(
        healthInclusionSchema.safeParse({
          requiresSupport: false,
        }).success,
      ).toBe(true);
    });

    it("validates preferencesSchema", () => {
      expect(
        preferencesSchema.safeParse({
          preferredShift: "MORNING",
          imageAuthorization: true,
          isReentering: false,
        }).success,
      ).toBe(true);

      expect(
        preferencesSchema.safeParse({
          preferredShift: "",
        }).success,
      ).toBe(false);
    });
  });

  describe("enrollmentApplicationSubmissionSchema (conditional rules)", () => {
    const baseValidAdult = {
      personalData: {
        firstName: "Ana",
        lastName: "García",
        documentNumber: "35123456",
        birthDate: "1995-05-15",
        address: "Mitre 456",
        city: "Córdoba",
        phone: "3514001122",
        email: "ana@example.com",
      },
      educationBackground: {
        secondarySchool: "Instituto San José",
        graduationYear: "2013",
        isSecondaryComplete: true,
        secondaryTitle: "Bachiller",
      },
      healthInclusion: {
        requiresSupport: false,
      },
      responsible: {},
      preferences: {
        preferredShift: "AFTERNOON",
        imageAuthorization: true,
        isReentering: false,
      },
      attachments: [
        { id: "1", documentType: "DNI_FRONT", fileName: "dni-frente.jpg" },
        { id: "2", documentType: "DNI_BACK", fileName: "dni-dorso.jpg" },
        { id: "3", documentType: "PHOTO_4X4", fileName: "foto.jpg" },
      ],
    };

    it("passes for a valid adult applicant with all base documents", () => {
      const result = enrollmentApplicationSubmissionSchema.safeParse(baseValidAdult);
      expect(result.success).toBe(true);
    });

    it("requires responsible data if applicant is minor (< 18)", () => {
      const minorData = {
        ...baseValidAdult,
        personalData: {
          ...baseValidAdult.personalData,
          birthDate: "2012-01-01",
        },
        responsible: {},
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(minorData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        const responsibleErrors = issues.filter((i) => i.path[0] === "responsible");
        expect(responsibleErrors.length).toBeGreaterThan(0);
      }
    });

    it("passes for minor applicant when responsible fields are complete", () => {
      const minorData = {
        ...baseValidAdult,
        personalData: {
          ...baseValidAdult.personalData,
          birthDate: "2012-01-01",
        },
        responsible: {
          fullName: "Carlos García",
          documentNumber: "18123456",
          phone: "3514998877",
          email: "carlos@example.com",
          occupation: "Docente",
          educationLevel: "TERTIARY_COMPLETE",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(minorData);
      expect(result.success).toBe(true);
    });

    it("requires health report attachment and support details if requiresSupport is true", () => {
      const healthSupportData = {
        ...baseValidAdult,
        healthInclusion: {
          requiresSupport: true,
          supportDetails: "",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(healthSupportData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("healthInclusion.supportDetails");
        expect(paths).toContain("attachments.HEALTH_REPORT");
      }
    });

    it("passes health inclusion check when details and health report are provided", () => {
      const healthSupportData = {
        ...baseValidAdult,
        healthInclusion: {
          requiresSupport: true,
          supportDetails: "Adaptación de material en macrotipo",
        },
        attachments: [...baseValidAdult.attachments, { id: "4", documentType: "HEALTH_REPORT", fileName: "informe-medico.pdf" }],
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(healthSupportData);
      expect(result.success).toBe(true);
    });

    it("requires previousTeacher when isReentering is true", () => {
      const reenteringData = {
        ...baseValidAdult,
        preferences: {
          ...baseValidAdult.preferences,
          isReentering: true,
          previousTeacher: "",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(reenteringData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("preferences.previousTeacher");
      }
    });

    it("fails when standard mandatory attachments are missing", () => {
      const missingDni = {
        ...baseValidAdult,
        attachments: [],
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(missingDni);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("attachments.DNI_FRONT");
        expect(paths).toContain("attachments.DNI_BACK");
        expect(paths).toContain("attachments.PHOTO_4X4");
      }
    });
  });
});
