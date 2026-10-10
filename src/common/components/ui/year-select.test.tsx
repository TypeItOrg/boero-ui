import { renderToStaticMarkup } from "react-dom/server";

import { YearSelect } from "@common/components/ui/year-select";

describe("YearSelect", () => {
  it("renders the controlled year in the initial HTML", () => {
    const markup = renderToStaticMarkup(<YearSelect minYear={2000} maxYear={2027} value="2025" />);

    expect(markup).toMatch(/data-slot="select-value"[^>]*>2025<\/span>/);
  });

  it("renders the label of the controlled all option in the initial HTML", () => {
    const markup = renderToStaticMarkup(<YearSelect allOptionLabel="Todos" minYear={2000} maxYear={2027} value="all" />);

    expect(markup).toMatch(/data-slot="select-value"[^>]*>Todos<\/span>/);
  });
});
