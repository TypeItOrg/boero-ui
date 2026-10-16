"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@common/components/ui/button";

import { BulkPublishGradesDialog } from "@features/course-enrollments/components/bulk-publish-grades-dialog";

export function BulkPublishGradesButton(): ReactElement {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setIsOpen(true)}>
        Publicar notas
      </Button>
      <BulkPublishGradesDialog open={isOpen} onOpenChange={setIsOpen} onPublished={() => router.refresh()} />
    </>
  );
}
