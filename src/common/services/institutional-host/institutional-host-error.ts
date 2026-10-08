export class InstitutionalHostError extends Error {
  constructor(public readonly status: 404 | 503) {
    super(
      status === 404
        ? "Verificá que el enlace o subdominio ingresado sea correcto, o comunicate con la institución para acceder al portal correspondiente."
        : "No se pudo consultar la institución. Intentá nuevamente en unos momentos.",
    );
    this.name = "InstitutionalHostError";
  }
}
