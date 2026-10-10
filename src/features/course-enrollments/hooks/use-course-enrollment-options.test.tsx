import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { useCourseEnrollmentOptions } from "@features/course-enrollments/hooks/use-course-enrollment-options";

import { createTestQueryClient } from "@/../test/utils/render-with-query-client";

function renderOptions(props: Parameters<typeof useCourseEnrollmentOptions>[0]) {
  const client = createTestQueryClient();

  return renderHook(useCourseEnrollmentOptions, {
    initialProps: props,
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

describe("course enrollment options", () => {
  afterEach(() => jest.restoreAllMocks());

  it("cancels an obsolete course read and never uses its late response for the current selection", async () => {
    let resolveFirst!: (response: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(Response.json({ courseId: "course-b", format: "GRUPAL", classes: [] }));
    const { result, rerender } = renderOptions({ courseId: "course-a" });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const firstSignal = fetchMock.mock.calls[0][1]?.signal;

    rerender({ courseId: "course-b" });

    expect(firstSignal?.aborted).toBe(true);
    expect(result.current.options).toBeUndefined();
    await waitFor(() => expect(result.current.options?.courseId).toBe("course-b"));

    await act(async () => {
      resolveFirst(Response.json({ courseId: "course-a", format: "GRUPAL", classes: [] }));
    });

    expect(result.current.options?.courseId).toBe("course-b");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("keeps admin reads within the selected institution and refuses an absent institution", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation(async () => Response.json({ courseId: "course-a", format: "GRUPAL", classes: [] }));
    const { result, rerender } = renderOptions({ courseId: "course-a", institutionId: "institution-a", scope: AcademicScope.ADMIN });

    await waitFor(() => expect(result.current.options?.courseId).toBe("course-a"));
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/courses/course-a/enrollment-options?institutionId=institution-a");

    rerender({ courseId: "course-a", institutionId: "institution-b", scope: AcademicScope.ADMIN });

    expect(result.current.options).toBeUndefined();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock.mock.calls[1][0]).toBe("/api/admin/courses/course-a/enrollment-options?institutionId=institution-b");

    rerender({ courseId: "course-a", scope: AcademicScope.ADMIN });

    expect(result.current.options).toBeUndefined();
    expect(result.current.error).toBe(COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_FAILED);
    expect(result.current.loading).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects options for another course and fetches fresh capacity after a revision", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(Response.json({ courseId: "wrong-course", format: "GRUPAL", classes: [] }))
      .mockResolvedValueOnce(Response.json({ courseId: "course-a", format: "GRUPAL", classes: [] }));
    const { result, rerender } = renderOptions({ courseId: "course-a", revision: 0 });

    await waitFor(() => expect(result.current.error).toBe(COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_FAILED));
    expect(result.current.options).toBeUndefined();

    rerender({ courseId: "course-a", revision: 1 });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    await waitFor(() => expect(result.current.options?.courseId).toBe("course-a"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
