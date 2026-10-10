import { useActionState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ActionForm } from "@common/components/action-form";

function SaveForm({
  save,
}: {
  save: (previous: { error?: string; success?: boolean }, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [state, action, pending] = useActionState(save, {});

  return (
    <ActionForm action={action} resetOnSuccess={state.success}>
      <label>
        Nombre
        <input name="name" defaultValue="" />
      </label>
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        Guardar
      </button>
    </ActionForm>
  );
}

describe("action form resets", () => {
  it("preserves input after a failed action and resets only after a successful action", async () => {
    const save = jest.fn().mockResolvedValueOnce({ error: "Nombre inválido" }).mockResolvedValueOnce({ success: true });
    render(<SaveForm save={save} />);
    const input = screen.getByRole("textbox", { name: "Nombre" });
    await userEvent.type(input, "Nombre editado");

    fireEvent.submit(input.closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent("Nombre inválido");
    expect(input).toHaveValue("Nombre editado");
    fireEvent.submit(input.closest("form")!);

    await screen.findByDisplayValue("");
    expect(save.mock.calls[1][1].get("name")).toBe("Nombre editado");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
