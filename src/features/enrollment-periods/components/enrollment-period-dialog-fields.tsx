"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";

import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export function EnrollmentPeriodDialogFields({
  period,
  academicYearId,
  setAcademicYearId,
  fetchAcademicYears,
  scope,
  institutionId,
  loading,
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  period: EnrollmentPeriod | null;
  academicYearId: string;
  setAcademicYearId: Dispatch<SetStateAction<string>>;
  fetchAcademicYears: (input: AsyncDropdownFetchPageInput) => Promise<AsyncDropdownPage<AcademicYear>>;
  scope: AcademicScope;
  institutionId: string;
  loading: boolean;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  startDate: string;
  setStartDate: Dispatch<SetStateAction<string>>;
  endDate: string;
  setEndDate: Dispatch<SetStateAction<string>>;
}): ReactElement {
  return (
    <div className="grid gap-4 py-4">
      {!period && (
        <div className="grid gap-2">
          <Label htmlFor="academicYear">Ciclo Lectivo</Label>
          <input type="hidden" name="academicYearId" value={academicYearId} />
          <AsyncDropdown<AcademicYear>
            id="academicYear"
            value={academicYearId}
            onValueChange={(value) => setAcademicYearId(value ?? "")}
            fetchPage={fetchAcademicYears}
            queryKey={["enrollment-period-academic-years", scope, institutionId]}
            getItemValue={(year) => year.id}
            getItemLabel={(year) => `Ciclo Lectivo ${year.year}`}
            placeholder="Seleccioná un ciclo"
            searchPlaceholder="Buscar ciclo lectivo…"
            disabled={loading}
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="name">Nombre del Período</Label>
        <Input
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Inscripción 2026 - Primer Llamado"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="startDate">Fecha y Hora de Inicio</Label>
        <Input name="startDate" id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="endDate">Fecha y Hora de Fin</Label>
        <Input name="endDate" id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>
    </div>
  );
}
