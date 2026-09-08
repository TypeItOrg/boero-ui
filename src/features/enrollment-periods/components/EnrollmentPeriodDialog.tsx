"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { EnrollmentPeriod } from "../types/enrollment-period.types";
import { createEnrollmentPeriodAction, updateEnrollmentPeriodAction } from "../actions/enrollment-period.actions";

import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";

interface Props {
  institutionId: string;
  academicYears: AcademicYear[];
  period: EnrollmentPeriod | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope?: AcademicScopeType;
}

export function EnrollmentPeriodDialog({ institutionId, academicYears, period, open, onOpenChange, scope = AcademicScope.INSTITUTIONAL }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(period?.name ?? "");
  const [academicYearId, setAcademicYearId] = useState(period?.academicYearId ?? academicYears[0]?.id ?? "");
  const [startDate, setStartDate] = useState(period?.startDate ? period.startDate.substring(0, 16) : "");
  const [endDate, setEndDate] = useState(period?.endDate ? period.endDate.substring(0, 16) : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (period) {
        await updateEnrollmentPeriodAction(
          institutionId,
          period.id,
          {
            name,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          },
          scope,
        );
      } else {
        await createEnrollmentPeriodAction(
          institutionId,
          {
            academicYearId,
            name,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          },
          scope,
        );
      }
      onOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al guardar el período de inscripción.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{period ? "Editar Período de Inscripción" : "Nuevo Período de Inscripción"}</DialogTitle>
            <DialogDescription>Configurá las fechas de inicio y fin para habilitar las pre-inscripciones.</DialogDescription>
          </DialogHeader>

          {error && <div className="bg-destructive/15 text-destructive my-2 rounded p-3 text-sm font-medium">{error}</div>}

          <div className="grid gap-4 py-4">
            {!period && (
              <div className="grid gap-2">
                <Label htmlFor="academicYear">Ciclo Lectivo</Label>
                <Select value={academicYearId} onValueChange={setAcademicYearId} required>
                  <SelectTrigger id="academicYear" className="w-full">
                    <SelectValue placeholder="Seleccioná un ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        No hay ciclos lectivos disponibles
                      </SelectItem>
                    ) : (
                      academicYears.map((ay) => (
                        <SelectItem key={ay.id} value={ay.id}>
                          Ciclo Lectivo {ay.year}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Período</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Inscripción 2026 - Primer Llamado" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha y Hora de Inicio</Label>
              <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha y Hora de Fin</Label>
              <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : period ? "Guardar Cambios" : "Crear Período"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
