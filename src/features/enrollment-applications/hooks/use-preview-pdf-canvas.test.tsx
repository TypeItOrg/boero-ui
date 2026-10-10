import { act, render, screen, waitFor } from "@testing-library/react";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { usePreviewPdfCanvas } from "@features/enrollment-applications/hooks/use-preview-pdf-canvas";

function CanvasPreview(props: Parameters<typeof usePreviewPdfCanvas>[0]) {
  const { canvasRef, loading } = usePreviewPdfCanvas(props);

  return (
    <div>
      <output>{loading ? "Cargando" : "Renderizado"}</output>
      <canvas ref={canvasRef} role="img" aria-label={`Página ${props.pageNumber}`} />
    </div>
  );
}

describe("PDF canvas resource lifecycle", () => {
  it("waits for cancellation before reusing the canvas and only marks the current page as rendered", async () => {
    let finishFirst!: () => void;
    let finishSecond!: () => void;
    const firstTask = {
      promise: new Promise<void>((resolve) => {
        finishFirst = resolve;
      }),
      cancel: jest.fn(),
    };
    const secondTask = {
      promise: new Promise<void>((resolve) => {
        finishSecond = resolve;
      }),
      cancel: jest.fn(),
    };
    const renderPage = jest.fn().mockReturnValueOnce(firstTask).mockReturnValueOnce(secondTask);
    const pdf = {
      getPage: jest.fn().mockResolvedValue({
        getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 200 * scale }),
        render: renderPage,
      }),
    } as unknown as PDFDocumentProxy;
    const props = { pdf, pageNumber: 1, expanded: false, fitWidth: true, zoom: null, size: { width: 100, height: 200 }, onError: jest.fn() };
    const { rerender, unmount } = render(<CanvasPreview {...props} />);

    await waitFor(() => expect(renderPage).toHaveBeenCalledTimes(1));
    rerender(<CanvasPreview {...props} pageNumber={2} />);

    expect(firstTask.cancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando");
    expect(renderPage).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishFirst();
    });
    await waitFor(() => expect(renderPage).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("status")).toHaveTextContent("Cargando");
    await act(async () => {
      finishSecond();
    });

    expect(screen.getByRole("status")).toHaveTextContent("Renderizado");
    expect(screen.getByRole("img", { name: "Página 2" })).toHaveStyle({ width: "100px", height: "200px" });
    expect(props.onError).not.toHaveBeenCalled();
    unmount();
    expect(secondTask.cancel).toHaveBeenCalledTimes(1);
  });
});
