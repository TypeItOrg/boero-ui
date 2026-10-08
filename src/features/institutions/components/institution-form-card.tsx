"use client";

import type { ReactElement, ReactNode } from "react";

export function FormCard({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <div className="bg-muted/25 flex flex-col gap-4 rounded-xl border p-5">
      <h2 className="text-foreground font-semibold">{title}</h2>
      {children}
    </div>
  );
}
