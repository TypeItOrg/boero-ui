"use client";

import * as React from "react";

export const GRADES_CHANGED_EVENT = "course-enrollment-grades-changed";

export function notifyGradesChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRADES_CHANGED_EVENT));
  }
}

export function useGradesChangedListener(onChanged: () => void): void {
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(GRADES_CHANGED_EVENT, onChanged);

    return () => {
      window.removeEventListener(GRADES_CHANGED_EVENT, onChanged);
    };
  }, [onChanged]);
}
