import { academicStatusSchema, parseAcademicForm } from "@features/academic/schemas/academic-form.schema";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { getCurrentAcademicYear, getMaxAcademicYear } from "@features/academic/utils/academic-year.util";

describe("academic form schemas", () => {
  it("requires both academic year dates", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, `${year}-03-01`, "");

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
  });

  it("rejects inverted academic year dates", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, `${year}-07-31`, `${year}-07-29`);

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["endDate"],
            message: "La fecha final no puede ser anterior a la inicial.",
          }),
        ]),
      );
    }
  });

  it("rejects impossible calendar dates", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, `${year}-02-30`, `${year}-03-30`);

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["startDate"], message: "Ingresá una fecha válida." }),
        ]),
      );
    }
  });

  it("rejects an academic year outside the supported range", () => {
    const formData = academicYearFormData(getMaxAcademicYear() + 1, "", "");

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["year"] })]));
    }
  });

  it("rejects an academic year start date from another year", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, `${year - 1}-12-01`, `${year}-12-15`);

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["startDate"],
            message: "La fecha de inicio debe pertenecer al año del ciclo lectivo.",
          }),
        ]),
      );
    }
  });

  it("accepts an academic year that finishes during the following calendar year", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, `${year}-08-01`, `${year + 1}-07-31`);

    expect(parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData).success).toBe(true);
  });

  it("requires academic year dates when activating from the edit form", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, "", "");
    formData.set("status", "ACTIVE");

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["status"],
            message: "Completá las fechas de inicio y finalización para activar el ciclo lectivo.",
          }),
        ]),
      );
    }
  });

  it("rejects an academic year ending more than one calendar year later", () => {
    const year = getCurrentAcademicYear();
    const formData = academicYearFormData(year, `${year}-03-01`, `${year + 2}-03-01`);

    const result = parseAcademicForm(AcademicResource.ACADEMIC_YEAR, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["endDate"],
            message: "La fecha de finalización debe pertenecer al año del ciclo lectivo o al siguiente.",
          }),
        ]),
      );
    }
  });

  it("normalizes optional descriptions", () => {
    const formData = new FormData();
    formData.set("name", "  Piano  ");
    formData.set("description", "");

    const result = parseAcademicForm(AcademicResource.INSTRUMENT, formData);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ name: "Piano", description: null });
  });

  it("parses a shift with a required name and optional description", () => {
    const formData = new FormData();
    formData.set("name", "Turno mañana");
    formData.set("description", "De 8 a 12.");

    const result = parseAcademicForm(AcademicResource.SHIFT, formData);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ name: "Turno mañana", description: "De 8 a 12." });
  });

  it("accepts an open-ended study-plan validity", () => {
    const formData = new FormData();
    formData.set("name", "Plan 2027");
    formData.set("trainingPathId", "8c56005e-d58f-49ac-9498-7b18551952d0");
    formData.set("effectiveFrom", "2027-03-01");
    formData.set("effectiveTo", "");

    const result = parseAcademicForm(AcademicResource.STUDY_PLAN, formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Plan 2027",
        trainingPathId: "8c56005e-d58f-49ac-9498-7b18551952d0",
        effectiveFrom: "2027-03-01",
        effectiveTo: null,
      });
    }
  });

  it("rejects a study-plan final date without a start date", () => {
    const formData = new FormData();
    formData.set("name", "Plan 2027");
    formData.set("trainingPathId", "8c56005e-d58f-49ac-9498-7b18551952d0");
    formData.set("effectiveFrom", "");
    formData.set("effectiveTo", "2027-12-15");

    const result = parseAcademicForm(AcademicResource.STUDY_PLAN, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["effectiveFrom"],
            message: "Completá la fecha de inicio antes de indicar una fecha final.",
          }),
        ]),
      );
    }
  });

  it("accepts the effective date required to inactivate a study plan", () => {
    expect(
      academicStatusSchema.safeParse({
        resource: AcademicResource.STUDY_PLAN,
        status: "INACTIVE",
        effectiveTo: "2028-12-31",
      }).success,
    ).toBe(true);
  });

  it("requires an effective date when inactivating a study plan", () => {
    const result = academicStatusSchema.safeParse({
      resource: AcademicResource.STUDY_PLAN,
      status: "INACTIVE",
      effectiveTo: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["effectiveTo"], message: "Ingresá la fecha de finalización." }),
        ]),
      );
    }
  });

  it("rejects a study-plan finalization before its effective start", () => {
    const result = academicStatusSchema.safeParse({
      resource: AcademicResource.STUDY_PLAN,
      status: "INACTIVE",
      effectiveFrom: "2028-03-01",
      effectiveTo: "2028-02-29",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["effectiveTo"],
            message: "La fecha final no puede ser anterior al inicio del plan.",
          }),
        ]),
      );
    }
  });
});

function academicYearFormData(year: number, startDate: string, endDate: string): FormData {
  const formData = new FormData();
  formData.set("year", String(year));
  formData.set("startDate", startDate);
  formData.set("endDate", endDate);
  return formData;
}
