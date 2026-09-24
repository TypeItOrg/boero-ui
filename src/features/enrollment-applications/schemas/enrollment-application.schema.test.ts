import {
  calculateAge,
  personalDataSchema,
  academicBackgroundSchema,
  healthInclusionSchema,
  preferenceSchema,
  enrollmentApplicationSubmissionSchema,
  startEnrollmentApplicationSchema,
} from "@features/enrollment-applications/schemas/enrollment-application.schema";

describe("startEnrollmentApplicationSchema", () => {
  const base = { studyPlanId: "00000000-0000-4000-8000-000000000001", academicYearId: "00000000-0000-4000-8000-000000000002" };

  it("accepts a self application without applicantPersonId", () => {
    expect(startEnrollmentApplicationSchema.safeParse(base).success).toBe(true);
  });

  it("accepts an application on behalf of a dependent", () => {
    const applicantPersonId = "00000000-0000-4000-8000-000000000003";

    expect(startEnrollmentApplicationSchema.parse({ ...base, applicantPersonId })).toEqual({ ...base, applicantPersonId });
  });

  it("rejects an applicantPersonId that is not a UUID", () => {
    expect(startEnrollmentApplicationSchema.safeParse({ ...base, applicantPersonId: "not-a-uuid" }).success).toBe(false);
  });
});

describe("enrollment-application.schema", () => {
  describe("calculateAge", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("returns null for undefined or invalid date", () => {
      expect(calculateAge(undefined)).toBeNull();
      expect(calculateAge("invalid-date")).toBeNull();
    });

    it("calculates age correctly for adult", () => {
      expect(calculateAge("2001-09-14")).toBe(25);
    });

    it("calculates age correctly for minor", () => {
      expect(calculateAge("2010-09-14")).toBe(16);
    });
  });

  describe("step schemas", () => {
    it("validates personalDataSchema", () => {
      const valid = {
        firstName: "Juan",
        lastName: "Pérez",
        documentNumber: "40123456",
        birthDate: "2000-01-01",
        phoneNumber: "3534123456",
        email: "juan@example.com",
      };
      expect(personalDataSchema.safeParse(valid).success).toBe(true);

      const invalidEmail = { ...valid, email: "not-an-email" };
      expect(personalDataSchema.safeParse(invalidEmail).success).toBe(false);
    });

    it("validates academicBackgroundSchema", () => {
      expect(
        academicBackgroundSchema.safeParse({
          secondarySchool: "Colegio Nacional",
          secondaryCompleted: true,
        }).success,
      ).toBe(true);

      expect(
        academicBackgroundSchema.safeParse({
          secondarySchool: "",
        }).success,
      ).toBe(false);
    });

    it("validates healthInclusionSchema", () => {
      expect(
        healthInclusionSchema.safeParse({
          receivesReasonableAdjustments: false,
        }).success,
      ).toBe(true);
    });

    it("validates preferenceSchema", () => {
      expect(
        preferenceSchema.safeParse({
          preferredShift: "MORNING",
          allowsImageUse: true,
          isReenrolling: false,
        }).success,
      ).toBe(true);

      expect(
        preferenceSchema.safeParse({
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
        phoneNumber: "3514001122",
        email: "ana@example.com",
      },
      academicBackground: {
        secondarySchool: "Instituto San José",
        currentGradeYear: "2013",
        secondaryCompleted: true,
        secondaryDegreeTitle: "Bachiller",
      },
      healthInclusion: {
        receivesReasonableAdjustments: false,
      },
      responsible: {},
      preference: {
        preferredShift: "AFTERNOON",
        allowsImageUse: true,
        isReenrolling: false,
      },
      attachments: [
        { id: "1", attachmentType: "DNI_FRONT", originalFileName: "dni-frente.jpg" },
        { id: "2", attachmentType: "DNI_BACK", originalFileName: "dni-dorso.jpg" },
        { id: "3", attachmentType: "PHOTO_ID", originalFileName: "foto.jpg" },
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
          phoneNumber: "3514998877",
          email: "carlos@example.com",
          occupation: "Docente",
          educationLevel: "TERTIARY_COMPLETE",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(minorData);
      expect(result.success).toBe(true);
    });

    it("does not require an own email for a minor applicant (dependents have none)", () => {
      const minorWithoutEmail = {
        ...baseValidAdult,
        personalData: { ...baseValidAdult.personalData, birthDate: "2012-01-01", email: "" },
        responsible: {
          fullName: "Carlos García",
          documentNumber: "18123456",
          phoneNumber: "3514998877",
          email: "carlos@example.com",
          occupation: "Docente",
          educationLevel: "TERTIARY_COMPLETE",
        },
      };

      expect(enrollmentApplicationSubmissionSchema.safeParse(minorWithoutEmail).success).toBe(true);
      expect(
        enrollmentApplicationSubmissionSchema.safeParse({ ...minorWithoutEmail, personalData: { ...minorWithoutEmail.personalData, email: null } })
          .success,
      ).toBe(true);
    });

    it("still requires a valid email for an adult applicant", () => {
      const missing = enrollmentApplicationSubmissionSchema.safeParse({
        ...baseValidAdult,
        personalData: { ...baseValidAdult.personalData, email: "" },
      });
      const invalid = enrollmentApplicationSubmissionSchema.safeParse({
        ...baseValidAdult,
        personalData: { ...baseValidAdult.personalData, email: "not-an-email" },
      });

      for (const result of [missing, invalid]) {
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("personalData.email");
        }
      }
    });

    it("requires health report attachment and support details if receivesReasonableAdjustments is true", () => {
      const healthSupportData = {
        ...baseValidAdult,
        healthInclusion: {
          receivesReasonableAdjustments: true,
          adjustmentDetails: "",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(healthSupportData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("healthInclusion.adjustmentDetails");
      }
    });

    it("passes health inclusion check when details are provided", () => {
      const healthSupportData = {
        ...baseValidAdult,
        healthInclusion: {
          receivesReasonableAdjustments: true,
          adjustmentDetails: "Adaptación de material en macrotipo",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(healthSupportData);
      expect(result.success).toBe(true);
    });

    it("requires previousTeacher when isReenrolling is true", () => {
      const reenrollingData = {
        ...baseValidAdult,
        preference: {
          ...baseValidAdult.preference,
          isReenrolling: true,
          previousTeacher: "",
        },
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(reenrollingData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("preference.previousTeacher");
      }
    });

    it("allows submission when attachments are empty (documentation relegated)", () => {
      const withoutAttachments = {
        ...baseValidAdult,
        attachments: [],
      };

      const result = enrollmentApplicationSubmissionSchema.safeParse(withoutAttachments);
      expect(result.success).toBe(true);
    });
  });
});
