import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  usePathname: () => "/study-plans",
  useSearchParams: () => new URLSearchParams(),
}));

import { AcademicTableRow } from "@features/academic/components/academic-table-row";
import type { AcademicTableRow as AcademicTableRowData } from "@features/academic/config/academic-collection.config";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

const ROW_ID = "2d9ec931-453c-4778-86a9-dc40a06d0247";

describe("AcademicTableRow", () => {
  it("links training paths to their detail and exposes the detail action", async () => {
    const user = userEvent.setup();
    renderRow({ resource: AcademicResource.TRAINING_PATH, row: createRow({ primaryValue: "CAVI" }) });

    expect(screen.getByRole("link", { name: "CAVI" })).toHaveAttribute("href", `/training-paths/${ROW_ID}`);

    await openActions(user, "CAVI");

    expect(screen.getByRole("menuitem", { name: "Ver detalle" })).toHaveAttribute("href", `/training-paths/${ROW_ID}`);
  });

  it("offers deletion only for editable draft study plans", async () => {
    const user = userEvent.setup();
    const onLifecycleAction = jest.fn();
    renderRow({
      canChangeStatus: true,
      canUpdate: true,
      onLifecycleAction,
      resource: AcademicResource.STUDY_PLAN,
      row: createRow({ primaryValue: "Plan 2027", status: "Borrador", statusValue: "DRAFT" }),
    });

    await openActions(user, "Plan 2027");
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent?.trim())).toEqual([
      "Ver detalle",
      "Editar",
      "Activar",
      "Eliminar",
    ]);
    await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));

    expect(onLifecycleAction).toHaveBeenCalledWith(ROW_ID, "Plan 2027", "delete");
  });

  it.each([
    [AcademicResource.TRAINING_PATH, "Profesorado", true, "Desactivar", "INACTIVE"],
    [AcademicResource.TRAINING_PATH, "Profesorado", false, "Activar", "ACTIVE"],
    [AcademicResource.ACADEMIC_SPACE, "Armonía", true, "Desactivar", "INACTIVE"],
    [AcademicResource.ACADEMIC_SPACE, "Armonía", false, "Activar", "ACTIVE"],
    [AcademicResource.INSTRUMENT, "Piano", true, "Desactivar", "INACTIVE"],
    [AcademicResource.INSTRUMENT, "Piano", false, "Activar", "ACTIVE"],
    [AcademicResource.SHIFT, "Turno mañana", true, "Desactivar", "INACTIVE"],
    [AcademicResource.SHIFT, "Turno mañana", false, "Activar", "ACTIVE"],
  ] as const)(
    "offers %s for %s with its dedicated status permission",
    async (resource, primaryValue, active, action, targetStatus) => {
      const user = userEvent.setup();
      const onStatusAction = jest.fn();
      renderRow({
        canChangeStatus: true,
        onStatusAction,
        resource,
        row: createRow({ active, primaryValue, status: active ? "Activo" : "Inactivo" }),
      });

      await openActions(user, primaryValue);
      const statusAction = screen.getByRole("menuitem", { name: action });

      expect(statusAction).toHaveAttribute("data-variant", targetStatus === "INACTIVE" ? "destructive" : "default");
      await user.click(statusAction);
      expect(onStatusAction).toHaveBeenCalledWith({
        id: ROW_ID,
        resource,
        resourceLabel: primaryValue,
        targetStatus,
      });
    },
  );

  it.each([
    [AcademicResource.ACADEMIC_SPACE, "Armonía"],
    [AcademicResource.INSTRUMENT, "Piano"],
    [AcademicResource.SHIFT, "Turno mañana"],
  ] as const)("does not offer status changes for %s without permission", async (resource, primaryValue) => {
    const user = userEvent.setup();
    renderRow({ resource, row: createRow({ primaryValue }) });

    await openActions(user, primaryValue);

    expect(screen.queryByRole("menuitem", { name: "Desactivar" })).not.toBeInTheDocument();
  });

  it.each([
    [AcademicResource.ACADEMIC_SPACE, "Armonía"],
    [AcademicResource.INSTRUMENT, "Piano"],
    [AcademicResource.SHIFT, "Turno mañana"],
  ] as const)("preserves returnTo when editing %s", async (resource, primaryValue) => {
    const user = userEvent.setup();
    renderRow({ canUpdate: true, resource, row: createRow({ primaryValue }) });

    await openActions(user, primaryValue);

    expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveAttribute(
      "href",
      `/${resource}/${ROW_ID}/edit?returnTo=%2Fstudy-plans`,
    );
  });
});

function renderRow({
  canChangeStatus = false,
  canDelete = true,
  canRestore = true,
  canUpdate = false,
  onLifecycleAction = jest.fn(),
  onStatusAction = jest.fn(),
  resource,
  row,
}: {
  canChangeStatus?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canUpdate?: boolean;
  onLifecycleAction?: (id: string, itemLabel: string, kind: "delete" | "restore") => void;
  onStatusAction?: jest.Mock;
  resource: AcademicCollectionResource;
  row: AcademicTableRowData;
}): void {
  render(
    <table>
      <tbody>
        <AcademicTableRow
          basePath=""
          canChangeStatus={canChangeStatus}
          canDelete={canDelete}
          canRestore={canRestore}
          canUpdate={canUpdate}
          columns={{ primaryLabel: "Nombre", detailLabels: ["Descripción"] }}
          onLifecycleAction={onLifecycleAction}
          onStatusAction={onStatusAction}
          resource={resource}
          row={row}
        />
      </tbody>
    </table>,
  );
}

function createRow(overrides: Partial<AcademicTableRowData> = {}): AcademicTableRowData {
  return {
    active: true,
    detailValues: ["Descripción"],
    id: ROW_ID,
    primaryValue: "Registro académico",
    status: "Activo",
    ...overrides,
  };
}

async function openActions(user: ReturnType<typeof userEvent.setup>, label: string): Promise<void> {
  await user.click(screen.getByRole("button", { name: `Abrir acciones de ${label}` }));
}
