import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DocumentFilePreview } from "@features/enrollment-applications/components/document-file-preview";

describe("document file preview", () => {
  it("recovers from a failed file when switching documents and allows retrying the current file", async () => {
    const { rerender } = render(<DocumentFilePreview src="/documents/a" name="Documento A" contentType="image/png" />);
    fireEvent.error(screen.getByRole("img", { name: "Vista previa de Documento A" }));
    expect(screen.getByText("No se pudo mostrar la vista previa.")).toBeVisible();

    rerender(<DocumentFilePreview src="/documents/b" name="Documento B" contentType="image/png" />);

    const currentImage = screen.getByRole("img", { name: "Vista previa de Documento B" });
    expect(new URL((currentImage as HTMLImageElement).src).pathname).toBe("/documents/b");
    expect(screen.queryByText("No se pudo mostrar la vista previa.")).not.toBeInTheDocument();
    fireEvent.error(currentImage);
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(new URL((screen.getByRole("img", { name: "Vista previa de Documento B" }) as HTMLImageElement).src).pathname).toBe("/documents/b");
    expect(screen.queryByText("No se pudo mostrar la vista previa.")).not.toBeInTheDocument();
  });
});
