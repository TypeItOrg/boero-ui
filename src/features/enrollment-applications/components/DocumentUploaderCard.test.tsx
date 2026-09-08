import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentUploaderCard } from "./DocumentUploaderCard";
import * as actions from "../actions/enrollment-application.actions";

jest.mock("../actions/enrollment-application.actions", () => ({
  uploadEnrollmentAttachmentAction: jest.fn(),
  deleteEnrollmentAttachmentAction: jest.fn(),
}));

describe("DocumentUploaderCard", () => {
  const defaultProps = {
    applicationId: "app-123",
    documentType: "DNI_FRONT" as const,
    title: "DNI Frente",
    description: "Foto del frente del documento",
    required: true,
    attachment: null,
    onUploadSuccess: jest.fn(),
    onDeleteSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders upload button and required badge when no attachment is provided", () => {
    render(<DocumentUploaderCard {...defaultProps} />);

    expect(screen.getByText("DNI Frente")).toBeInTheDocument();
    expect(screen.getByText("Foto del frente del documento")).toBeInTheDocument();
    expect(screen.getByText("Requerido")).toBeInTheDocument();
    expect(screen.getByText("Seleccionar archivo (PDF o Imagen)")).toBeInTheDocument();
  });

  it("renders attachment info and action buttons when attachment is present", () => {
    const attachment = {
      id: "att-1",
      documentType: "DNI_FRONT" as const,
      fileName: "dni-frente.pdf",
      fileSize: 1024 * 50,
    };

    render(<DocumentUploaderCard {...defaultProps} attachment={attachment} />);

    expect(screen.getByText("Cargado")).toBeInTheDocument();
    expect(screen.getByText("dni-frente.pdf")).toBeInTheDocument();
    expect(screen.getByText("50 KB")).toBeInTheDocument();
    expect(screen.getByText("Ver / Descargar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("calls delete action and onDeleteSuccess callback when clicking delete", async () => {
    (actions.deleteEnrollmentAttachmentAction as jest.Mock).mockResolvedValueOnce(undefined);

    const attachment = {
      id: "att-1",
      documentType: "DNI_FRONT" as const,
      fileName: "dni-frente.pdf",
    };

    render(<DocumentUploaderCard {...defaultProps} attachment={attachment} />);

    const deleteBtn = screen.getByText("Eliminar");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(actions.deleteEnrollmentAttachmentAction).toHaveBeenCalledWith("app-123", "att-1");
      expect(defaultProps.onDeleteSuccess).toHaveBeenCalledWith("DNI_FRONT", "att-1");
    });
  });

  it("hides delete button when readOnly is true", () => {
    const attachment = {
      id: "att-1",
      documentType: "DNI_FRONT" as const,
      fileName: "dni-frente.pdf",
    };

    render(<DocumentUploaderCard {...defaultProps} attachment={attachment} readOnly />);

    expect(screen.getByText("Ver / Descargar")).toBeInTheDocument();
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
  });
});
