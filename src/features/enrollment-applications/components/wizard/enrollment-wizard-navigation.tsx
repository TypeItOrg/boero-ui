"use client";

import type { ReactElement } from "react";

import { HorizontalScrollArea } from "@common/components/ui/horizontal-scroll-area";
import { TabsList, TabsTrigger } from "@common/components/ui/tabs";

import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<EnrollmentWizardModel, "hydrated" | "visibleTabs" | "tabTriggerRefs">;

export function EnrollmentWizardNavigation({ hydrated, visibleTabs, tabTriggerRefs }: Props): ReactElement {
  if (!hydrated) {
    return (
      <div
        className="bg-muted flex h-[52px] w-full animate-pulse items-center gap-1 rounded-lg p-1"
        role="status"
        aria-label="Preparando pasos de la inscripción"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className="bg-background/70 h-10 flex-1 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <HorizontalScrollArea>
      <TabsList className="flex h-[52px]! w-max min-w-full gap-1 p-1">
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            ref={(element) => {
              if (element) {
                tabTriggerRefs.current.set(tab.id, element);
              } else {
                tabTriggerRefs.current.delete(tab.id);
              }
            }}
            value={tab.id}
            className="h-10! min-w-44 flex-[1_0_auto] px-5 py-2 text-center text-sm group-data-[overflow=true]/horizontal-scroll-area:h-11!"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </HorizontalScrollArea>
  );
}
