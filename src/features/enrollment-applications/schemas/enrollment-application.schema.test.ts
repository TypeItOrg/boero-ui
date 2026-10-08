import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import {
  calculateAge,
  personalDataSchema,
  academicBackgroundSchema,
  healthInclusionSchema,
  preferenceSchema,
  enrollmentApplicationSubmissionSchema,
} from "@features/enrollment-applications/schemas/enrollment-application.schema";

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
      expect(personalDataSchema.safeParse(invalidEmail)).toMatchObject({
        success: false,
        error: { issues: [{ path: ["email"], message: ENROLLMENT_MESSAGES.EMAIL_INVALID }] },
      });
    });

    it("validates academicBackgroundSchema", () => {
      expect(
        academicBackgroundSchema.safeParse({
          schoolOrigin: "Colegio Nacional",
          currentlyStudying: false,
          educationLevel: "SECONDARY",
          currentGradeYear: null,
          levelCompleted: null,
          secondaryDegreeTitle: null,
          secondaryCompleted: true,
        }).success,
      ).toBe(true);

      const incomplete = academicBackgroundSchema.safeParse({ secondarySchool: "" });
      expect(incomplete.success).toBe(false);

      if (!incomplete.success) {
        expect(incomplete.error.issues).toHaveLength(7);
        expect(incomplete.error.issues.map((issue) => issue.path.join("."))).toEqual(
          expect.arrayContaining([
            "currentlyStudying",
            "educationLevel",
            "schoolOrigin",
            "currentGradeYear",
            "levelCompleted",
            "secondaryCompleted",
            "secondaryDegreeTitle",
          ]),
        );
      }
    });

    it("requires the current school when the applicant is studying", () => {
      const result = academicBackgroundSchema.safeParse({
        currentlyStudying: true,
        educationLevel: "SECONDARY",
        schoolOrigin: "   ",
        currentGradeYear: null,
        levelCompleted: null,
        secondaryCompleted: false,
        secondaryDegreeTitle: null,
      });

      expect(result).toMatchObject({
        success: false,
        error: { issues: [{ path: ["schoolOrigin"], message: ENROLLMENT_MESSAGES.EDUCATION_INSTITUTION_REQUIRED }] },
      });
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

      expect(preferenceSchema.safeParse({ preferredShift: "" })).toMatchObject({
        success: false,
        error: { issues: [{ path: ["preferredShift"], message: ENROLLMENT_MESSAGES.SHIFT_REQUIRED }] },
      });
    });
  });

  describe("enrollmentApplicationSubmissionSchema (conditional rules)", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    });
    afterEach(() => {
      jest.useRealTimers();
    });
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
        schoolOrigin: "Instituto San José",
        currentlyStudying: false,
        educationLevel: "SECONDARY",
        levelCompleted: null,
        currentGradeYear: "2013",
        secondaryCompleted: true,
        secondaryDegreeTitle: "Bachiller",
      },
      healthInclusion: {
        receivesReasonableAdjustments: false,
      },
      responsible: {},
      courses: [{ courseId: "00000000-0000-4000-8000-000000000001", preferredTeacherId: null }],
      preference: {
        preferredShift: "AFTERNOON",
        allowsImageUse: true,
        isReenrolling: false,
      },
      attachments: [
        {
          id: "1",
          requirementId: "00000000-0000-4000-8000-000000000001",
          originalFileName: "dni-frente.jpg",
        },
        {
          id: "2",
          requirementId: "00000000-0000-4000-8000-000000000002",
          originalFileName: "dni-dorso.jpg",
        },
        {
          id: "3",
          requirementId: "00000000-0000-4000-8000-000000000003",
          originalFileName: "foto.jpg",
        },
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
        expect(result.error.issues).toHaveLength(6);
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            { code: "custom", path: ["responsible", "fullName"], message: ENROLLMENT_MESSAGES.RESPONSIBLE_NAME_REQUIRED },
            { code: "custom", path: ["responsible", "documentNumber"], message: ENROLLMENT_MESSAGES.RESPONSIBLE_DOCUMENT_REQUIRED },
            { code: "custom", path: ["responsible", "phoneNumber"], message: ENROLLMENT_MESSAGES.RESPONSIBLE_PHONE_REQUIRED },
            { code: "custom", path: ["responsible", "email"], message: ENROLLMENT_MESSAGES.RESPONSIBLE_EMAIL_REQUIRED },
            { code: "custom", path: ["responsible", "occupation"], message: ENROLLMENT_MESSAGES.RESPONSIBLE_OCCUPATION_REQUIRED },
            { code: "custom", path: ["responsible", "educationLevel"], message: ENROLLMENT_MESSAGES.RESPONSIBLE_EDUCATION_REQUIRED },
          ]),
        );
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

    it.each([
      ["2008-09-26", true],
      ["2008-09-27", false],
    ])("applies the eighteenth birthday boundary for %s", (birthDate, success) => {
      const result = enrollmentApplicationSubmissionSchema.safeParse({
        ...baseValidAdult,
        personalData: { ...baseValidAdult.personalData, birthDate },
      });

      expect(result.success).toBe(success);

      if (!result.success) {
        expect(result.error.issues).toHaveLength(6);
        expect(result.error.issues.every((issue) => issue.path[0] === "responsible")).toBe(true);
      }
    });

    it("requires support details if receivesReasonableAdjustments is true", () => {
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
        expect(result.error.issues).toEqual([
          { code: "custom", path: ["healthInclusion", "adjustmentDetails"], message: ENROLLMENT_MESSAGES.ADJUSTMENT_DETAILS_REQUIRED },
        ]);
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
        expect(result.error.issues).toEqual([
          { code: "custom", path: ["preference", "previousTeacher"], message: ENROLLMENT_MESSAGES.PREVIOUS_TEACHER_REQUIRED },
        ]);
      }
    });

    it("accepts a returning applicant with a previous teacher", () => {
      expect(
        enrollmentApplicationSubmissionSchema.safeParse({
          ...baseValidAdult,
          preference: { ...baseValidAdult.preference, isReenrolling: true, previousTeacher: "María Pérez" },
        }).success,
      ).toBe(true);
    });

    it("requires at least one selected course", () => {
      const result = enrollmentApplicationSubmissionSchema.safeParse({ ...baseValidAdult, courses: [] });

      expect(result).toMatchObject({
        success: false,
        error: { issues: [{ path: ["courses"], message: ENROLLMENT_MESSAGES.SPACE_REQUIRED }] },
      });
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
