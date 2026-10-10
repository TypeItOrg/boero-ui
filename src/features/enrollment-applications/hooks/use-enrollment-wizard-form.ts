"use client";

import { useReducer, useState } from "react";

import type { Shift } from "@features/academic/types/shift.types";
import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import type { EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-academic-background.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentHealthInclusion } from "@features/enrollment-applications/types/enrollment-health-inclusion.types";
import type { EnrollmentPreference } from "@features/enrollment-applications/types/enrollment-preference.types";
import type { EnrollmentResponsible } from "@features/enrollment-applications/types/enrollment-responsible.types";
import { parseInitialBirthDate } from "@features/enrollment-applications/utils/enrollment-birth-date.util";
import { createSchoolingFormState, schoolingFormReducer } from "@features/enrollment-applications/utils/enrollment-schooling-form.util";
import { getEnrollmentShiftOptions } from "@features/enrollment-applications/utils/enrollment-shift-options.util";
import { buildEnrollmentWizardData } from "@features/enrollment-applications/utils/enrollment-wizard-data.util";

export function useEnrollmentWizardForm(
  initialData: EnrollmentApplicationResponse["data"],
  initialShifts: readonly Shift[],
  readOnly: boolean,
  selectedCourseIds: string[],
) {
  const [schooling, dispatchSchooling] = useReducer(schoolingFormReducer, initialData?.academicBackground, createSchoolingFormState);

  const [healthInclusion, setHealthInclusion] = useState<EnrollmentHealthInclusion>(() => ({
    receivesReasonableAdjustments: Boolean(initialData?.healthInclusion?.receivesReasonableAdjustments),
    adjustmentDetails: initialData?.healthInclusion?.adjustmentDetails ?? "",
  }));

  const [responsible, setResponsible] = useState<EnrollmentResponsible>(() => ({
    fullName: initialData?.responsible?.fullName ?? "",
    documentNumber: initialData?.responsible?.documentNumber ?? "",
    phoneNumber: initialData?.responsible?.phoneNumber ?? "",
    email: initialData?.responsible?.email ?? "",
    occupation: initialData?.responsible?.occupation ?? "",
    educationLevel: initialData?.responsible?.educationLevel ?? "",
  }));

  const [preference, setPreference] = useState<EnrollmentPreference>(() => ({
    preferredShift: initialData?.preference?.preferredShift ?? "",
    allowsImageUse: Boolean(initialData?.preference?.allowsImageUse),
    isReenrolling: Boolean(initialData?.preference?.isReenrolling),
    previousTeacher: initialData?.preference?.previousTeacher ?? "",
  }));

  const birthDate = parseInitialBirthDate(initialData?.personalData?.birthDate);

  const calculatedAge = calculateAge(birthDate);

  function updateResponsible(field: keyof EnrollmentResponsible, value: string): void {
    setResponsible((previous) => ({ ...previous, [field]: value }));
  }

  function updatePreference<TField extends keyof EnrollmentPreference>(field: TField, value: EnrollmentPreference[TField]): void {
    setPreference((previous) => ({ ...previous, [field]: value }));
  }

  function updateHealthInclusion<TField extends keyof EnrollmentHealthInclusion>(field: TField, value: EnrollmentHealthInclusion[TField]): void {
    setHealthInclusion((previous) => ({ ...previous, [field]: value }));
  }

  return {
    firstName: initialData?.personalData?.firstName ?? "",
    lastName: initialData?.personalData?.lastName ?? "",
    documentNumber: initialData?.personalData?.documentNumber ?? "",
    birthDate,
    birthDateRequiresProfileUpdate: !birthDate && !readOnly,
    phoneNumber: initialData?.personalData?.phoneNumber ?? "",
    email: initialData?.personalData?.email ?? "",
    schooling,
    dispatchSchooling,
    handleCurrentlyStudyingChange: (value: string) => dispatchSchooling({ type: "attendanceChanged", value: value === "yes" }),
    handleEducationLevelChange: (value: EnrollmentEducationLevel) => dispatchSchooling({ type: "educationLevelChanged", value }),
    healthInclusion,
    updateHealthInclusion,
    responsible,
    updateResponsible,
    preference,
    updatePreference,
    selectedTrainingPathId: initialData?.careerSelection?.trainingPathId ?? "",
    shiftOptions: getEnrollmentShiftOptions(initialShifts, preference.preferredShift),
    calculatedAge,
    isMinor: calculatedAge !== null && calculatedAge < 18,
    structuredData: buildEnrollmentWizardData({ initial: initialData, schooling, healthInclusion, responsible, preference, selectedCourseIds }),
  };
}
