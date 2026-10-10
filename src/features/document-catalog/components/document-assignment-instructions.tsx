"use client";

import type { ReactElement } from "react";

export function AssignmentInstructions({ instructions }: { instructions: string }): ReactElement {
  return (
    <p className="text-muted-foreground mt-2 max-w-prose text-sm leading-relaxed break-words whitespace-pre-wrap">
      <span className="font-medium">Instrucciones específicas: </span>
      {instructions}
    </p>
  );
}
