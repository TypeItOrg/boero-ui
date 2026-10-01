import { render, screen } from "@testing-library/react";

import { TeachersTableRow } from "@features/people/components/teachers-table-row";

jest.mock("next/navigation", () => ({
  usePathname: () => "/teachers",
  useSearchParams: () => new URLSearchParams("search=ana&page=0"),
}));

describe("TeachersTableRow", () => {
  it("renders teacher identity, contact data and access status", () => {
    render(
      <table>
        <tbody>
          <TeachersTableRow
            teacher={{
              id: "teacher-1",
              firstName: "Ana",
              lastName: "García",
              documentNumber: "12345678",
              email: "ana@example.com",
              phoneNumber: null,
              enabled: false,
            }}
          />
        </tbody>
      </table>,
    );

    expect(screen.getByText("García, Ana")).toBeInTheDocument();
    expect(screen.getByText("12345678")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Sin teléfono")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "García, Ana" })).toHaveAttribute(
      "href",
      "/people/teacher-1?view=detail&returnTo=%2Fteachers%3Fsearch%3Dana%26page%3D0",
    );
  });
});
