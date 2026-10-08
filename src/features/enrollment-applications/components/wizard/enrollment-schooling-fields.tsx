"use client";

import type { ActionDispatch, ReactElement } from "react";

import { CardContent } from "@common/components/ui/card";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";

import { EnrollmentBooleanField } from "@features/enrollment-applications/components/wizard/enrollment-boolean-field";
import { SCHOOLING_EDUCATION_LEVEL_OPTIONS } from "@features/enrollment-applications/constants/enrollment-application.constants";
import type { EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-academic-background.types";
import type { SchoolingFormAction } from "@features/enrollment-applications/types/enrollment-schooling-action.types";
import type { SchoolingFormState } from "@features/enrollment-applications/types/enrollment-schooling-state.types";

export function EnrollmentSchoolingFields({
  getFieldError,
  schooling,
  handleCurrentlyStudyingChange,
  handleEducationLevelChange,
  dispatchSchooling,
}: {
  getFieldError: (path: (string | number)[]) => string | undefined;
  schooling: SchoolingFormState;
  handleCurrentlyStudyingChange: (value: string) => void;
  handleEducationLevelChange: (value: EnrollmentEducationLevel) => void;
  dispatchSchooling: ActionDispatch<[action: SchoolingFormAction]>;
}): ReactElement {
  return (
    <CardContent className="space-y-5">
      <EnrollmentBooleanField
        id="currentlyStudying"
        label="¿Actualmente asistís a una institución educativa?"
        value={schooling.currentlyStudying}
        error={getFieldError(["academicBackground", "currentlyStudying"])}
        onChange={(value) => handleCurrentlyStudyingChange(value ? "yes" : "no")}
      />

      {schooling.currentlyStudying !== null ? (
        <Field data-invalid={!!getFieldError(["academicBackground", "educationLevel"])}>
          <FieldLabel htmlFor="educationLevel" required>
            {schooling.currentlyStudying ? "Nivel educativo actual" : "Máximo nivel alcanzado"}
          </FieldLabel>
          <Select
            value={schooling.educationLevel ?? undefined}
            onValueChange={(value) => handleEducationLevelChange(value as EnrollmentEducationLevel)}
          >
            <SelectTrigger id="educationLevel" className="h-9! w-full" aria-invalid={!!getFieldError(["academicBackground", "educationLevel"])}>
              <SelectValue placeholder="Seleccioná un nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {!schooling.currentlyStudying ? (
                  <SelectItem value="NO_SCHOOLING" className="px-2.5 py-1.5">
                    Sin escolarización
                  </SelectItem>
                ) : null}
                {SCHOOLING_EDUCATION_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="px-2.5 py-1.5">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[{ message: getFieldError(["academicBackground", "educationLevel"]) }]} />
        </Field>
      ) : null}

      {schooling.educationLevel && schooling.educationLevel !== "NO_SCHOOLING" ? (
        <Field data-invalid={!!getFieldError(["academicBackground", "schoolOrigin"])}>
          <FieldLabel htmlFor="schoolOrigin" required={schooling.currentlyStudying === true}>
            {schooling.currentlyStudying ? "Institución educativa actual" : "Última institución educativa (opcional)"}
          </FieldLabel>
          <Input
            id="schoolOrigin"
            maxLength={150}
            value={schooling.schoolOrigin}
            onChange={(event) => dispatchSchooling({ type: "schoolOriginChanged", value: event.target.value })}
            placeholder="Nombre de la institución"
            aria-invalid={!!getFieldError(["academicBackground", "schoolOrigin"])}
          />
          <FieldError errors={[{ message: getFieldError(["academicBackground", "schoolOrigin"]) }]} />
        </Field>
      ) : null}

      {schooling.currentlyStudying && schooling.educationLevel ? (
        <Field>
          <FieldLabel htmlFor="currentGradeYear">Sala, grado o año de cursado (opcional)</FieldLabel>
          <Input
            id="currentGradeYear"
            maxLength={50}
            value={schooling.currentGradeYear}
            onChange={(event) => dispatchSchooling({ type: "currentGradeYearChanged", value: event.target.value })}
            placeholder="Sala de 4, 3.º grado o 2.º año"
          />
        </Field>
      ) : null}

      {schooling.currentlyStudying === false &&
      schooling.educationLevel &&
      schooling.educationLevel !== "NO_SCHOOLING" &&
      schooling.educationLevel !== "SECONDARY" ? (
        <EnrollmentBooleanField
          id="levelCompleted"
          label="¿Completaste ese nivel?"
          value={schooling.levelCompleted}
          error={getFieldError(["academicBackground", "levelCompleted"])}
          onChange={(value) => dispatchSchooling({ type: "levelCompletedChanged", value })}
        />
      ) : null}

      {schooling.educationLevel && ["SECONDARY", "NON_UNIVERSITY_HIGHER", "UNIVERSITY"].includes(schooling.educationLevel) ? (
        <EnrollmentBooleanField
          id="secondaryCompleted"
          label="¿Completaste el secundario?"
          value={schooling.secondaryCompleted}
          error={getFieldError(["academicBackground", "secondaryCompleted"])}
          onChange={(value) => dispatchSchooling({ type: "secondaryCompletedChanged", value })}
        />
      ) : null}

      {schooling.secondaryCompleted === true ? (
        <Field>
          <FieldLabel htmlFor="secondaryDegreeTitle">Título secundario obtenido (opcional)</FieldLabel>
          <Input
            id="secondaryDegreeTitle"
            maxLength={150}
            value={schooling.secondaryDegreeTitle}
            onChange={(event) =>
              dispatchSchooling({
                type: "secondaryDegreeTitleChanged",
                value: event.target.value,
              })
            }
            placeholder="Bachiller en Arte y Música"
          />
        </Field>
      ) : null}
    </CardContent>
  );
}
