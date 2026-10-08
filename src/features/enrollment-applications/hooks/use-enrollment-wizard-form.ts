"use client";

import { useMemo, useReducer, useState } from "react";

import { format, isValid } from "date-fns";

import type { Shift } from "@features/academic/types/shift.types";
import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import type { EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-academic-background.types";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { parseInitialBirthDate } from "@features/enrollment-applications/utils/enrollment-birth-date.util";
import { createSchoolingFormState, schoolingFormReducer } from "@features/enrollment-applications/utils/enrollment-schooling-form.util";
import { getEnrollmentShiftOptions } from "@features/enrollment-applications/utils/enrollment-shift-options.util";

export function useEnrollmentWizardForm(
  initialData: EnrollmentApplicationResponse["data"],
  initialShifts: readonly Shift[],
  readOnly: boolean,
  selectedCourseIds: string[],
) {
  // 1. Datos Personales
  const firstName = initialData?.personalData?.firstName ?? "";
  const lastName = initialData?.personalData?.lastName ?? "";
  const documentNumber = initialData?.personalData?.documentNumber ?? "";
  const birthDate = parseInitialBirthDate(initialData?.personalData?.birthDate);
  const birthDateRequiresProfileUpdate = !birthDate && !readOnly;
  const phoneNumber = initialData?.personalData?.phoneNumber ?? "";
  const email = initialData?.personalData?.email ?? "";

  // 2. Escolaridad
  const [schooling, dispatchSchooling] = useReducer(schoolingFormReducer, initialData?.academicBackground, createSchoolingFormState);

  const handleCurrentlyStudyingChange = (value: string): void => {
    dispatchSchooling({ type: "attendanceChanged", value: value === "yes" });
  };

  const handleEducationLevelChange = (value: EnrollmentEducationLevel): void => {
    dispatchSchooling({ type: "educationLevelChanged", value });
  };

  // 3. Salud e Inclusión
  const [receivesReasonableAdjustments, setReceivesReasonableAdjustments] = useState(
    Boolean(initialData?.healthInclusion?.receivesReasonableAdjustments),
  );
  const [adjustmentDetails, setAdjustmentDetails] = useState(initialData?.healthInclusion?.adjustmentDetails ?? "");

  // 4. Responsable / Tutor Legal
  const [responsibleFullName, setResponsibleFullName] = useState(initialData?.responsible?.fullName ?? "");
  const [responsibleDocumentNumber, setResponsibleDocumentNumber] = useState(initialData?.responsible?.documentNumber ?? "");
  const [responsiblePhoneNumber, setResponsiblePhoneNumber] = useState(initialData?.responsible?.phoneNumber ?? "");
  const [responsibleEmail, setResponsibleEmail] = useState(initialData?.responsible?.email ?? "");
  const [responsibleOccupation, setResponsibleOccupation] = useState(initialData?.responsible?.occupation ?? "");
  const [responsibleEducationLevel, setResponsibleEducationLevel] = useState(initialData?.responsible?.educationLevel ?? "");

  // 5. Trayecto Formativo (resolved when the application starts)
  const selectedTrainingPathId = initialData?.careerSelection?.trainingPathId ?? "";

  // 7. Preferencias
  const [preferredShift, setPreferredShift] = useState(initialData?.preference?.preferredShift ?? "");
  const shiftOptions = useMemo(() => getEnrollmentShiftOptions(initialShifts, preferredShift), [initialShifts, preferredShift]);
  const [allowsImageUse, setAllowsImageUse] = useState(Boolean(initialData?.preference?.allowsImageUse));
  const [isReenrolling, setIsReenrolling] = useState(Boolean(initialData?.preference?.isReenrolling));
  const [previousTeacher, setPreviousTeacher] = useState(initialData?.preference?.previousTeacher ?? "");

  // Reactive age computation
  const calculatedAge = useMemo(() => {
    return calculateAge(birthDate);
  }, [birthDate]);

  const isMinor = calculatedAge !== null && calculatedAge < 18;
  const structuredData: EnrollmentApplicationData = useMemo(() => {
    return {
      personalData: {
        firstName,
        lastName,
        documentNumber,
        birthDate: birthDate && isValid(birthDate) ? format(birthDate, "yyyy-MM-dd") : null,
        phoneNumber,
        email,
      },
      academicBackground: {
        currentlyStudying: schooling.currentlyStudying,
        educationLevel: schooling.educationLevel,
        schoolOrigin: schooling.schoolOrigin || null,
        currentGradeYear: schooling.currentGradeYear || null,
        levelCompleted:
          schooling.currentlyStudying === false && schooling.educationLevel === "SECONDARY" ? schooling.secondaryCompleted : schooling.levelCompleted,
        secondaryCompleted: schooling.secondaryCompleted,
        secondaryDegreeTitle: schooling.secondaryDegreeTitle || null,
      },
      healthInclusion: {
        receivesReasonableAdjustments,
        adjustmentDetails,
      },
      responsible: {
        fullName: responsibleFullName,
        documentNumber: responsibleDocumentNumber,
        phoneNumber: responsiblePhoneNumber,
        email: responsibleEmail,
        occupation: responsibleOccupation,
        educationLevel: responsibleEducationLevel,
      },
      careerSelection: selectedTrainingPathId ? { trainingPathId: selectedTrainingPathId } : undefined,
      courses: selectedCourseIds.map((courseId) => ({
        courseId,
        preferredTeacherId: initialData?.courses?.find((course) => course.courseId === courseId)?.preferredTeacherId ?? null,
      })),
      preference: {
        preferredShift,
        allowsImageUse,
        isReenrolling,
        previousTeacher,
      },
    };
  }, [
    firstName,
    lastName,
    documentNumber,
    birthDate,
    phoneNumber,
    email,
    schooling,
    receivesReasonableAdjustments,
    adjustmentDetails,
    responsibleFullName,
    responsibleDocumentNumber,
    responsiblePhoneNumber,
    responsibleEmail,
    responsibleOccupation,
    responsibleEducationLevel,
    selectedTrainingPathId,
    initialData?.courses,
    selectedCourseIds,
    preferredShift,
    allowsImageUse,
    isReenrolling,
    previousTeacher,
  ]);

  return {
    firstName,
    lastName,
    documentNumber,
    birthDate,
    birthDateRequiresProfileUpdate,
    phoneNumber,
    email,
    schooling,
    dispatchSchooling,
    handleCurrentlyStudyingChange,
    handleEducationLevelChange,
    receivesReasonableAdjustments,
    setReceivesReasonableAdjustments,
    adjustmentDetails,
    setAdjustmentDetails,
    responsibleFullName,
    setResponsibleFullName,
    responsibleDocumentNumber,
    setResponsibleDocumentNumber,
    responsiblePhoneNumber,
    setResponsiblePhoneNumber,
    responsibleEmail,
    setResponsibleEmail,
    responsibleOccupation,
    setResponsibleOccupation,
    responsibleEducationLevel,
    setResponsibleEducationLevel,
    selectedTrainingPathId,
    preferredShift,
    setPreferredShift,
    shiftOptions,
    allowsImageUse,
    setAllowsImageUse,
    isReenrolling,
    setIsReenrolling,
    previousTeacher,
    setPreviousTeacher,
    calculatedAge,
    isMinor,
    structuredData,
  };
}
