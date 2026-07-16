export const COMMON_ERROR_MESSAGES = {
  ASYNC_DROPDOWN_RESULTS: "No se pudieron cargar los resultados.",
  MISSING_API_URL: "Falta configurar BOERO_API_URL.",
  UNEXPECTED_API_PROXY: "Ocurrió un error inesperado al comunicarse con la API.",
  BLOCKING_PAGE_TITLE: "No pudimos cargar esta página",
  BLOCKING_PAGE_DESCRIPTION:
    "El servicio puede no estar disponible temporalmente o se produjo un error inesperado. Intentá nuevamente en unos momentos.",
  DATA_TABLE_NAVIGATION_CONTEXT: "useDataTableNavigation debe usarse dentro de DataTableNavigationProvider.",
  CHART_CONTEXT: "useChart debe usarse dentro de un ChartContainer.",
  SIDEBAR_CONTEXT: "useSidebar debe usarse dentro de SidebarProvider.",
} as const;
