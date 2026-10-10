"use client";

import { useEffect, useRef, useState } from "react";

export function usePreviewContainerSize() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = container.clientWidth;

      const height = container.clientHeight;

      setSize((previous) => (previous.width === width && previous.height === height ? previous : { width, height }));
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}
