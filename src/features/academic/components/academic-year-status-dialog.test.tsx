import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { updateAcademicStatusAction } from "@features/academic/actions/update-academic-status.action";
import { AcademicYearStatusDialog } from "@features/academic/components/academic-year-status-dialog";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

import { renderWithQueryClient as render } from "@/../test/utils/render-with-query-client";

jest.mock("@features/academic/actions/update-academic-status.action", () => ({
  updateAcademicStatusAction: jest.fn(),
}));

const YEAR_ID = "019f9c3a-f891-7bc5-a98d-e65332998126";
const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";

describe("AcademicYearStatusDialog", () => {
  afterEach(() => jest.restoreAllMocks());

  it("locks finalization while pending and preserves the dialog after a rejected change", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    let finishUpdate!: (state: AcademicActionState) => void;
    const updateResult = new Promise<AcademicActionState>((resolve) => {
      finishUpdate = resolve;
    });
    jest.mocked(updateAcademicStatusAction).mockReturnValue(updateResult);
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(Response.json({ count: 2 }));

    render(
      <AcademicYearStatusDialog
        academicYearLabel="2026"
        id={YEAR_ID}
        institutionId={INSTITUTION_ID}
        onOpenChange={onOpenChange}
        open
        returnTo="/academic-years?page=1"
        scope={AcademicScope.INSTITUTIONAL}
        targetStatus="CLOSED"
      />,
    );

    expect(await screen.findByText(/cursos asociados \(2 cursos\)/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/institutional/academic/academic-years/" + YEAR_ID + "/courses/count?institutionId=" + INSTITUTION_ID,
      { cache: "no-store", signal: expect.any(AbortSignal) },
    );

    await user.click(screen.getByRole("button", { name: "Finalizar ciclo lectivo" }));

    expect(screen.getByRole("button", { name: "Finalizando…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(updateAcademicStatusAction).toHaveBeenCalledTimes(1);
    expect(updateAcademicStatusAction).toHaveBeenCalledWith(
      AcademicScope.INSTITUTIONAL,
      INSTITUTION_ID,
      AcademicResource.ACADEMIC_YEAR,
      YEAR_ID,
      "/academic-years?page=1",
      {},
      expect.any(FormData),
    );
    const submitted = jest.mocked(updateAcademicStatusAction).mock.calls[0].at(-1) as FormData;
    expect(submitted.get("status")).toBe("CLOSED");

    finishUpdate({ error: "No se pudo finalizar el ciclo lectivo." });

    expect(await screen.findByText("No se pudo finalizar el ciclo lectivo.")).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finalizar ciclo lectivo" })).toBeEnabled();
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
