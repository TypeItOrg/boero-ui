"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@common/utils/cn.util";

type HorizontalScrollAreaProps = {
  children: React.ReactNode;
};

export function HorizontalScrollArea({ children }: HorizontalScrollAreaProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [canScrollBackward, setCanScrollBackward] = React.useState(false);
  const [canScrollForward, setCanScrollForward] = React.useState(false);

  React.useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;

    if (!root || !viewport) {
      return;
    }

    function updateScrollState(): void {
      const maximumScrollLeft = viewport.scrollWidth - viewport.clientWidth;

      setCanScrollBackward(viewport.scrollLeft > 1);
      setCanScrollForward(viewport.scrollLeft < maximumScrollLeft - 1);
    }

    function handleWheel(event: WheelEvent): void {
      const maximumScrollLeft = viewport.scrollWidth - viewport.clientWidth;

      if (maximumScrollLeft <= 1) {
        return;
      }

      const verticalDelta = normalizeWheelDelta(event.deltaY, event.deltaMode, viewport.clientWidth);
      const scrollDelta = Math.abs(event.deltaX) >= Math.abs(verticalDelta) ? event.deltaX : verticalDelta;

      event.preventDefault();
      event.stopPropagation();

      if (scrollDelta === 0) {
        return;
      }

      viewport.scrollLeft = Math.max(0, Math.min(maximumScrollLeft, viewport.scrollLeft + scrollDelta));
    }

    const resizeObserver = new ResizeObserver(updateScrollState);
    const animationFrame = window.requestAnimationFrame(updateScrollState);

    root.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    resizeObserver.observe(viewport);

    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      root.removeEventListener("wheel", handleWheel, true);
      viewport.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      ref={rootRef}
      type="auto"
      data-overflow={canScrollBackward || canScrollForward}
      className="group/horizontal-scroll-area relative w-full overflow-hidden overscroll-contain rounded-lg"
    >
      <ScrollAreaPrimitive.Viewport ref={viewportRef} className="w-full rounded-lg">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <div
        aria-hidden="true"
        className={cn(
          "from-muted pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r to-transparent transition-opacity",
          canScrollBackward ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "from-muted pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l to-transparent transition-opacity",
          canScrollForward ? "opacity-100" : "opacity-0",
        )}
      />
      <ScrollAreaPrimitive.Scrollbar
        orientation="horizontal"
        className="bg-primary/10 absolute inset-x-0 bottom-0 flex h-2.5 cursor-grab touch-none rounded-full select-none active:cursor-grabbing"
      >
        <ScrollAreaPrimitive.Thumb className="bg-primary relative h-full rounded-full" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

function normalizeWheelDelta(delta: number, deltaMode: number, pageSize: number): number {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return delta * 16;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return delta * pageSize;
  }

  return delta;
}
