import { z } from "zod";

import { documentRequirementSchema } from "@features/enrollment-applications/schemas/document-requirement.schema";

export const progressSchema = z.object({
  trainingPathId: z.uuid(),
  requirementIds: z.record(z.uuid(), z.uuid()),
  requirementRevisions: z.record(z.uuid(), z.number().int().min(0)).optional(),
});

export const draftsSchema = z.array(
  documentRequirementSchema.extend({
    clientId: z.uuid(),
    id: z.uuid().nullable(),
    dirty: z.boolean(),
  }),
);
