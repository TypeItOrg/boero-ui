import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("@features/institutional-auth/actions/institutional-register.action", () => ({ registerInstitutional: jest.fn() }));
jest.mock("@features/institutional-auth/components/institution-picker", () => ({ InstitutionPicker: () => null }));

import { InstitutionalRegisterForm } from "@features/institutional-auth/components/institutional-register-form";

function getBirthDateValue(container: HTMLElement): string {
  return container.querySelector<HTMLInputElement>('input[name="birthDate"]')!.value;
}

async function typeBirthDate(year: number): Promise<void> {
  await userEvent.type(screen.getByPlaceholderText("dd/mm/aaaa"), `01/01/${year}`);
}

describe("InstitutionalRegisterForm guardian birth date", () => {
  const currentYear = new Date().getFullYear();

  it("clears a minor birth date when the guardian switch is turned on", async () => {
    const { container } = render(<InstitutionalRegisterForm />);

    await typeBirthDate(currentYear - 10);
    expect(getBirthDateValue(container)).not.toBe("");

    await userEvent.click(screen.getByRole("switch"));

    expect(getBirthDateValue(container)).toBe("");
  });

  it("keeps an adult birth date when the guardian switch is turned on", async () => {
    const { container } = render(<InstitutionalRegisterForm />);

    await typeBirthDate(currentYear - 30);
    await userEvent.click(screen.getByRole("switch"));

    expect(getBirthDateValue(container)).toBe(`${currentYear - 30}-01-01`);
  });
});
