import { fireEvent, render, screen } from "@testing-library/react";
import { InstitutionLogoManager } from "@features/institutions/components/institution-logo-manager";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";

const institutionId = "22222222-2222-4222-8222-222222222222";
const oldLogo = `/api/v1/institutions/${institutionId}/logo?v=old`;
const props = { institutionId, institutionName: "Boero", logoUrl: oldLogo };

it.each(["platform", "institutional"] as const)("%s details display the persisted logo without editing controls", (scope) => {
  render(<InstitutionLogoManager {...props} scope={scope} canUpdate />);

  expect(screen.getByAltText("Logo de Boero")).toHaveAttribute("src", `http://localhost/api/public/institutions/${institutionId}/logo?v=old`);
  expect(screen.queryByLabelText("Imagen del logo")).not.toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("read-only institution exposes no upload/delete controls", () => {
  render(<InstitutionLogoManager {...props} scope="institutional" canUpdate={false} />);

  expect(screen.getByAltText("Logo de Boero")).toBeInTheDocument();
  expect(screen.queryByLabelText("Imagen del logo")).not.toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("shows the institution-name fallback when no logo is persisted", () => {
  render(<InstitutionLogoManager {...props} logoUrl={null} />);

  expect(screen.getByText("Sin logo. Se mostrará el nombre de la institución.")).toBeInTheDocument();
  expect(screen.queryByAltText("Logo de Boero")).not.toBeInTheDocument();
});

it("shows a fallback when the persisted image fails to load", () => {
  render(<InstitutionLogoManager {...props} />);
  fireEvent.error(screen.getByAltText("Logo de Boero"));

  expect(screen.getByRole("img", { name: INSTITUTION_ERROR_MESSAGES.PREVIEW_UNAVAILABLE })).toBeInTheDocument();
});
