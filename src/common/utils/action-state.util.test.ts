import { getResponseErrorActionState } from "@common/utils/action-state.util";

describe("action response errors", () => {
  const fields = ["email", "password"] as const;

  it("returns no error state for successful responses", async () => {
    await expect(getResponseErrorActionState(new Response(null, { status: 204 }), fields, "Fallback")).resolves.toBeUndefined();
  });

  it("returns backend and recognized field errors", async () => {
    const response = Response.json(
      {
        message: "Credenciales inválidas",
        fieldErrors: { email: "Correo inválido", ignored: "No mostrar" },
      },
      { status: 401 },
    );

    await expect(getResponseErrorActionState(response, fields, "Fallback")).resolves.toEqual({
      error: "Credenciales inválidas",
      fieldErrors: { email: "Correo inválido" },
    });
  });

  it("uses the fallback for network and malformed response errors", async () => {
    await expect(getResponseErrorActionState(Promise.reject(new Error("offline")), fields, "Fallback")).resolves.toEqual({
      error: "Fallback",
    });

    await expect(getResponseErrorActionState(new Response("not-json", { status: 500 }), fields, "Fallback")).resolves.toEqual({
      error: "Fallback",
    });
  });
});
