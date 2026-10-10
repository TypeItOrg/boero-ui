import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { useDocumentCatalogAssignments } from "@features/document-catalog/hooks/use-document-catalog-assignments";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";

import { createTestQueryClient } from "@/../test/utils/render-with-query-client";

const SAVED: DocumentAssignment = {
  id: "assignment-a",
  trainingPathId: "path-a",
  trainingPathName: "Guitarra",
  revision: 4,
  level: "BEFORE_CONFIRMATION",
  displayOrder: 3,
  active: true,
  specificInstructions: "Ambas caras",
};
const DEFAULT_PROPS: Parameters<typeof useDocumentCatalogAssignments>[0] = {
  scope: AcademicScope.ADMIN,
  institutionId: "institution-a",
  currentId: "document-a",
  allowAssignments: true,
};

function renderAssignments() {
  const client = createTestQueryClient();

  return renderHook(useDocumentCatalogAssignments, {
    initialProps: DEFAULT_PROPS,
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

function page(items: DocumentAssignment[], pageNumber = 0, totalPages = 1): Response {
  return Response.json({ items, page: pageNumber, totalPages, totalItems: items.length, size: 20 });
}

describe("document assignments", () => {
  afterEach(() => jest.restoreAllMocks());

  it("restores a removed association with its saved rules, revision and instructions", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(page([SAVED]));
    const { result } = renderAssignments();

    await waitFor(() => expect(result.current.rows).toEqual([SAVED]));
    act(() => result.current.removePath(SAVED));

    expect(result.current.rows).toEqual([]);
    expect(result.current.changes[SAVED.trainingPathId]).toEqual({ ...SAVED, active: false });

    await act(async () => result.current.selectPath({ id: SAVED.trainingPathId, name: "Guitarra" }));

    expect(result.current.rows).toEqual([SAVED]);
    expect(result.current.changes[SAVED.trainingPathId]).toEqual(SAVED);
    expect(result.current.readError).toBe("");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("resets paging on a size or institution change and never displays associations from the previous institution", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input), "https://example.test");
      const pageNumber = Number(url.searchParams.get("page"));

      return page(url.pathname.includes("institution-a") ? [SAVED] : [], pageNumber, 3);
    });
    const { result, rerender } = renderAssignments();

    await waitFor(() => expect(result.current.rows).toEqual([SAVED]));
    act(() => result.current.setPage(1));
    await waitFor(() => expect(result.current.associations?.page).toBe(1));
    act(() => result.current.setPageSize(50));

    expect(result.current.page).toBe(0);
    await waitFor(() => expect(result.current.associationsLoading).toBe(false));
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe(
      "/api/admin/institutions/institution-a/document-definitions/document-a/training-paths?page=0&size=50&active=true",
    );
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.associations?.page).toBe(2));

    rerender({ ...DEFAULT_PROPS, institutionId: "institution-b", currentId: "document-b" });

    expect(result.current.page).toBe(0);
    expect(result.current.rows).toEqual([]);
    expect(result.current.pageSize).toBe(50);
    await waitFor(() => expect(result.current.associationsLoading).toBe(false));
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe(
      "/api/admin/institutions/institution-b/document-definitions/document-b/training-paths?page=0&size=50&active=true",
    );
    expect(result.current.rows).toEqual([]);
  });

  it("discards a late selection even if the user leaves an institution and comes back to the same document", async () => {
    let resolveSelection!: (response: Response) => void;
    const selection = new Promise<Response>((resolve) => {
      resolveSelection = resolve;
    });
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation((input) => (String(input).includes("trainingPathId=") ? selection : Promise.resolve(page([]))));
    const { result, rerender } = renderAssignments();
    await waitFor(() => expect(result.current.associationsLoading).toBe(false));
    let pendingSelection!: Promise<void>;

    act(() => {
      pendingSelection = result.current.selectPath({ id: "path-a", name: "Guitarra" });
    });
    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => String(input).includes("trainingPathId=path-a"))).toBe(true));
    rerender({ ...DEFAULT_PROPS, institutionId: "institution-b", currentId: "document-b" });
    await waitFor(() => expect(result.current.associationsLoading).toBe(false));
    rerender(DEFAULT_PROPS);
    await waitFor(() => expect(result.current.associationsLoading).toBe(false));

    await act(async () => {
      resolveSelection(page([SAVED]));
      await pendingSelection;
    });

    expect(result.current.rows).toEqual([]);
    expect(result.current.changes).toEqual({});
    expect(result.current.readError).toBe("");
  });
});
