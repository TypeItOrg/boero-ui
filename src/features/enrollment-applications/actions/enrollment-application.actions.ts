"use server";

import {
  startOrGetEnrollmentApplication,
  fetchEnrollmentApplicationById,
  updateEnrollmentDraft,
  submitEnrollmentApplication,
  cancelEnrollmentApplication,
  fetchEnrollmentApplicationTrainingPaths,
  fetchEnrollmentApplicationStudyPlanSpaces,
} from "../services/enrollment-application.service";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type {
  EnrollmentApplicationResponse,
  StartEnrollmentApplicationInput,
  UpdateEnrollmentDraftInput,
} from "../types/enrollment-application.types";

export async function startOrGetEnrollmentApplicationAction(input: StartEnrollmentApplicationInput): Promise<EnrollmentApplicationResponse> {
  return startOrGetEnrollmentApplication(input);
}

export async function updateEnrollmentDraftAction(applicationId: string, input: UpdateEnrollmentDraftInput): Promise<EnrollmentApplicationResponse> {
  return updateEnrollmentDraft(applicationId, input);
}

export async function submitEnrollmentApplicationAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return submitEnrollmentApplication(applicationId);
}

export async function cancelEnrollmentApplicationAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return cancelEnrollmentApplication(applicationId);
}

export async function fetchEnrollmentApplicationTrainingPathsAction(applicationId: string): Promise<TrainingPath[]> {
  return fetchEnrollmentApplicationTrainingPaths(applicationId);
}

export async function fetchEnrollmentApplicationStudyPlanSpacesAction(applicationId: string): Promise<StudyPlanSpace[]> {
  return fetchEnrollmentApplicationStudyPlanSpaces(applicationId);
}

export async function getEnrollmentApplicationAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return fetchEnrollmentApplicationById(applicationId);
}
