import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { AcademicSpaceDropdown, TrainingPathDropdown } from "@features/academic/components/academic-option-dropdown";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";

jest.mock("@features/academic/services/academic-options.service", () => ({
  fetchAcademicOptionPage: jest.fn(),
}));

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: `virtual-${index}`,
        size: estimateSize(),
        start: index * estimateSize(),
      })),
    getTotalSize: () => count * estimateSize(),
    scrollToOffset: jest.fn(),
    measure: jest.fn(),
  }),
}));

describe("Academic Option Dropdowns", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  describe("TrainingPathDropdown", () => {
    it("renders empty state with route icon and title when no training paths exist", async () => {
      const user = userEvent.setup();
      jest.mocked(fetchAcademicOptionPage).mockResolvedValueOnce({
        items: [],
        nextPage: null,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <TrainingPathDropdown ariaInvalid={false} institutionId="test-inst-id" name="trainingPathId" scope={AcademicScope.INSTITUTIONAL} />
        </QueryClientProvider>,
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(await screen.findByText("No hay trayectos formativos")).toBeInTheDocument();
    });
  });

  describe("AcademicSpaceDropdown", () => {
    it("renders empty state with icon and title when no academic spaces exist", async () => {
      const user = userEvent.setup();
      jest.mocked(fetchAcademicOptionPage).mockResolvedValueOnce({
        items: [],
        nextPage: null,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AcademicSpaceDropdown ariaInvalid={false} institutionId="test-inst-id" name="academicSpaceId" scope={AcademicScope.INSTITUTIONAL} />
        </QueryClientProvider>,
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(await screen.findByText("No hay espacios académicos")).toBeInTheDocument();
    });
  });
});
