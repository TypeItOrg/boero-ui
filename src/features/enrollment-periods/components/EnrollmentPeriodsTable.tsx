"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2Icon, ClockIcon, PlusIcon, XCircleIcon, MoreVerticalIcon, EditIcon, TrashIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { toast } from "sonner";
import { Input } from "@common/components/ui/input";
import { Badge } from "@common/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { EnrollmentPeriod, EnrollmentPeriodStatus } from "../types/enrollment-period.types";
import { EnrollmentPeriodDialog } from "./EnrollmentPeriodDialog";
import { deleteEnrollmentPeriodAction, updateEnrollmentPeriodStatusAction } from "../actions/enrollment-period.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";

interface Props {
  institutionId: string;
  data: PaginatedResponse<EnrollmentPeriod>;
  academicYears: AcademicYear[];
  canCreate: boolean;
  canUpdate: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  scope?: "institutional" | "admin";
}

const statusBadges: Record<
  EnrollmentPeriodStatus,
  { label: string; variant: "outline" | "default" | "secondary" | "destructive"; icon: typeof ClockIcon }
> = {
  PLANNED: { label: "Planificado", variant: "secondary", icon: ClockIcon },
  OPEN: { label: "Abierto", variant: "default", icon: CheckCircle2Icon },
  CLOSED: { label: "Cerrado", variant: "destructive", icon: XCircleIcon },
};

export function EnrollmentPeriodsTable({
  institutionId,
  data,
  academicYears,
  canCreate,
  canUpdate,
  canChangeStatus,
  canDelete,
  scope = "institutional",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState<EnrollmentPeriod | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "0");
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "0");
    router.push(`?${params.toString()}`);
  };

  const handleAcademicYearFilter = (academicYearId: string) => {
    const params = new URLSearchParams(searchParams);
    if (academicYearId && academicYearId !== "all") {
      params.set("academicYearId", academicYearId);
    } else {
      params.delete("academicYearId");
    }
    params.set("page", "0");
    router.push(`?${params.toString()}`);
  };

  const handleOpenCreate = () => {
    setSelectedPeriod(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (period: EnrollmentPeriod) => {
    setSelectedPeriod(period);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (periodId: string, status: EnrollmentPeriodStatus) => {
    try {
      await updateEnrollmentPeriodStatusAction(institutionId, periodId, { status }, scope);
      toast.success(`El período de inscripción fue ${status === "OPEN" ? "abierto" : "cerrado"} con éxito.`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo cambiar el estado del período de inscripción.";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deletingPeriodId) return;
    setIsDeleting(true);
    try {
      await deleteEnrollmentPeriodAction(institutionId, deletingPeriodId, scope);
      toast.success("El período de inscripción fue eliminado con éxito.");
      setDeletingPeriodId(null);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el período de inscripción.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Buscar por nombre..."
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-xs"
          />

          <Select defaultValue={searchParams.get("academicYearId") ?? "all"} onValueChange={handleAcademicYearFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ciclo Lectivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los ciclos</SelectItem>
              {academicYears.map((ay) => (
                <SelectItem key={ay.id} value={ay.id}>
                  Ciclo {ay.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PLANNED">Planificado</SelectItem>
              <SelectItem value="OPEN">Abierto</SelectItem>
              <SelectItem value="CLOSED">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canCreate && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <PlusIcon className="size-4" />
            Nuevo Período
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ciclo Lectivo</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                  No se encontraron períodos de inscripción.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((period) => {
                const statusInfo = statusBadges[period.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell>Ciclo {period.academicYearNumber}</TableCell>
                    <TableCell>{new Date(period.startDate).toLocaleString("es-AR")}</TableCell>
                    <TableCell>{new Date(period.endDate).toLocaleString("es-AR")}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="gap-1">
                        <StatusIcon className="size-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => handleOpenEdit(period)}>
                              <EditIcon className="mr-2 size-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canChangeStatus && period.status !== "OPEN" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(period.id, "OPEN")}>
                              <CheckCircle2Icon className="mr-2 size-4 text-green-600" />
                              Abrir Inscripciones
                            </DropdownMenuItem>
                          )}
                          {canChangeStatus && period.status !== "CLOSED" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(period.id, "CLOSED")}>
                              <XCircleIcon className="mr-2 size-4 text-red-600" />
                              Cerrar Inscripciones
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem onClick={() => setDeletingPeriodId(period.id)} className="text-destructive">
                              <TrashIcon className="mr-2 size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <EnrollmentPeriodDialog
        key={isDialogOpen ? (selectedPeriod?.id ?? "new") : "closed"}
        institutionId={institutionId}
        academicYears={academicYears}
        period={selectedPeriod}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        scope={scope}
      />

      <AlertDialog open={!!deletingPeriodId} onOpenChange={(open) => !open && setDeletingPeriodId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar período de inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El período dejará de estar disponible para las pre-inscripciones de la institución.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} variant="destructive" disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar Período"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
