import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@features/academic/actions/academic-resource.action", () => ({
  updateAcademicStatusAction: jest.fn().mockResolvedValue({}),
}));

import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import { AcademicYearStatusDialog } from "@features/academic/components/academic-year-status-dialog";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

describe("AcademicYearStatusDialog", () => {
  it("submits the finalization without closing before the action completes", async () => {
    const user = userEvent.setup();
    const updateStatus = jest.mocked(updateAcademicStatusAction);

    render(
      <AcademicYearStatusDialog
        academicYearLabel="2026"
        id="019f9c3a-f891-7bc5-a98d-e65332998126"
        institutionId="019f9c3a-f891-7bc5-a98d-e65332998127"
        onOpenChange={jest.fn()}
        open
        returnTo="/academic-years"
        scope={AcademicScope.INSTITUTIONAL}
        targetStatus="CLOSED"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Finalizar ciclo lectivo" }));

    await waitFor(() => expect(updateStatus).toHaveBeenCalled());
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    const submittedFormData = updateStatus.mock.calls[0]?.at(-1);
    expect(submittedFormData).toBeInstanceOf(FormData);
    expect((submittedFormData as FormData).get("status")).toBe("CLOSED");
  });
});
