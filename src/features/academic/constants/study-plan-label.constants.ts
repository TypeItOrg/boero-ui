export const STUDY_PLAN_VERSION_LABELS: Readonly<Record<number, string>> = {
  2: "Segunda versión",
  3: "Tercera versión",
  4: "Cuarta versión",
  5: "Quinta versión",
  6: "Sexta versión",
  7: "Séptima versión",
  8: "Octava versión",
  9: "Novena versión",
  10: "Décima versión",
  11: "Undécima versión",
  12: "Duodécima versión",
  13: "Decimotercera versión",
  14: "Decimocuarta versión",
  15: "Decimoquinta versión",
  16: "Decimosexta versión",
  17: "Decimoséptima versión",
  18: "Decimoctava versión",
  19: "Decimonovena versión",
  20: "Vigésima versión",
};

export const STUDY_PLAN_VERSION_FALLBACK = (version: number): string => `Versión ${version}`;
