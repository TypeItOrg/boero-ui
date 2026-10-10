import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useEnrollmentCourseOptions } from "@features/enrollment-applications/hooks/use-enrollment-course-options";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import type { EnrollmentWizardProps } from "@features/enrollment-applications/types/enrollment-wizard-props.types";

import { createTestQueryClient } from "@/../test/utils/render-with-query-client";

const COURSE: EnrollmentCourseOption = {
  courseId: "course-a",
  studyPlanSpaceId: "space-a",
  academicSpaceName: "Ensamble",
  academicLevelName: null,
  studyPlanName: "Plan",
  trainingPathName: "Guitarra",
  format: "GRUPAL",
  instrumentId: null,
  instrumentName: null,
  academicYear: 2026,
  eligibility: { eligible: true, requirements: [] },
  hasCapacity: true,
};
const PROPS: EnrollmentWizardProps = {
  initialApplication: {
    applicationId: "application-a",
    institutionId: "institution-a",
    personId: "person-a",
    studyPlanId: "plan-a",
    academicYearId: "year-a",
    enrollmentPeriodId: "period-a",
    status: "DRAFT",
    isEditable: true,
    data: {},
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  initialCourseOptions: [COURSE],
  initialCourseOptionsPage: 0,
  initialCourseOptionsTotalPages: 2,
};

function renderCourses() {
  const client = createTestQueryClient();

  return renderHook(useEnrollmentCourseOptions, {
    initialProps: PROPS,
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

describe("enrollment course pagination", () => {
  afterEach(() => jest.restoreAllMocks());

  it("deduplicates rapid page requests and course IDs, retaining the latest metadata and selected instruments", async () => {
    let finish!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetchMock = jest.spyOn(global, "fetch").mockReturnValue(pending);
    const { result } = renderCourses();
    const selected = { ...COURSE, courseId: "selected-instrument", instrumentId: "instrument-a", instrumentName: "Piano", instrumental: true };
    act(() => result.current.rememberCourse(selected));
    await waitFor(() => expect(result.current.courseOptions).toEqual([COURSE, selected]));

    act(() => {
      result.current.loadMoreCourseOptions();
      result.current.loadMoreCourseOptions();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.loadingMoreCourses).toBe(true));
    expect(result.current.courseOptions).toEqual([COURSE, selected]);
    expect(result.current.loadingMoreCourses).toBe(true);
    const updated = { ...COURSE, hasCapacity: false };
    const nextCourse = { ...COURSE, courseId: "course-b" };
    await act(async () => {
      finish(Response.json({ items: [updated, nextCourse], page: 1, size: 50, totalItems: 2, totalPages: 2 }));
    });

    await waitFor(() => expect(result.current.loadingMoreCourses).toBe(false));
    expect(result.current.courseOptions).toEqual([updated, selected, nextCourse]);
    expect(result.current.hasMoreCourseOptions).toBe(false);
    act(() => result.current.loadMoreCourseOptions());
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("preserves the loaded catalog after a read failure and retries the failed page without skipping it", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(Response.json({ message: "No se pudo consultar" }, { status: 500 }))
      .mockResolvedValueOnce(Response.json({ items: [], page: 1, size: 50, totalItems: 1, totalPages: 2 }));
    const { result } = renderCourses();
    act(() => result.current.loadMoreCourseOptions());

    await waitFor(() => expect(result.current.courseOptionsError).toBeTruthy());
    expect(result.current.courseOptions).toEqual([COURSE]);
    expect(result.current.loadingMoreCourses).toBe(false);
    expect(result.current.hasMoreCourseOptions).toBe(true);
    act(() => result.current.loadMoreCourseOptions());

    await waitFor(() => expect(result.current.hasMoreCourseOptions).toBe(false));
    expect(result.current.courseOptionsError).toBeUndefined();
    expect(result.current.courseOptions).toEqual([COURSE]);
    expect(fetchMock.mock.calls.map(([input]) => input)).toEqual([
      "/api/enrollment-applications/application-a/courses?page=1&size=50",
      "/api/enrollment-applications/application-a/courses?page=1&size=50",
    ]);
  });
});
