import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AcademicTableRow } from "@features/academic/components/academic-table-row";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

describe("AcademicTableRow", () => {
  it("links training paths to their detail and exposes the detail action", async () => {
    const user = userEvent.setup();

    render(
      <table>
        <tbody>
          <AcademicTableRow
            basePath=""
            canChangeStatus={false}
            canUpdate={false}
            columns={{ primaryLabel: "Nombre", detailLabels: ["Descripción"] }}
            onStatusAction={jest.fn()}
            resource={AcademicResource.TRAINING_PATH}
            row={{
              id: "2d9ec931-453c-4778-86a9-dc40a06d0247",
              primaryValue: "CAVI",
              detailValues: ["Formación docente"],
              status: "Activo",
              active: true,
            }}
          />
        </tbody>
      </table>,
    );

    expect(screen.getByRole("link", { name: "CAVI" })).toHaveAttribute(
      "href",
      "/training-paths/2d9ec931-453c-4778-86a9-dc40a06d0247",
    );

    await user.click(screen.getByRole("button", { name: "Abrir acciones de CAVI" }));

    expect(screen.getByRole("menuitem", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/training-paths/2d9ec931-453c-4778-86a9-dc40a06d0247",
    );
  });
});
