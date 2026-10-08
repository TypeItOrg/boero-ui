"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { useSearchParams } from "next/navigation";

function subscribeToHydration(): () => void {
  return () => undefined;
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

export function useEnrollmentWizardNavigation(isMinor: boolean, hasDocumentsStep: boolean, isSubmitDialogOpen: boolean) {
  const searchParams = useSearchParams();
  const tabTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const hasCenteredInitialTabRef = useRef(false);
  const [pendingFocusFieldId, setPendingFocusFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const requestedTab = searchParams.get("tab");

    return requestedTab === "training-path" ? "spaces" : requestedTab || "personal";
  });
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydrationSnapshot);

  const visibleTabs = useMemo(() => {
    const rawTabs = [
      { id: "personal", label: "Datos Personales" },
      { id: "education", label: "Escolaridad" },
      { id: "health", label: "Salud e Inclusión" },
      ...(isMinor ? [{ id: "responsible", label: "Tutor Legal" }] : []),
      { id: "spaces", label: "Cursos" },
      { id: "preferences", label: "Preferencias" },
      ...(hasDocumentsStep ? [{ id: "documents", label: "Documentación" }] : []),
    ];

    return rawTabs.map((tab, index) => ({
      ...tab,
      label: `${index + 1}. ${tab.label}`,
    }));
  }, [isMinor, hasDocumentsStep]);

  const effectiveActiveTab = visibleTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : activeTab === "responsible"
      ? "spaces"
      : activeTab === "documents"
        ? "preferences"
        : "personal";

  useLayoutEffect(() => {
    if (!hydrated) {
      return;
    }

    const activeTrigger = tabTriggerRefs.current.get(effectiveActiveTab);

    if (!activeTrigger) {
      return;
    }

    activeTrigger.scrollIntoView({
      behavior: hasCenteredInitialTabRef.current ? "smooth" : "auto",
      block: "nearest",
      inline: "center",
    });
    hasCenteredInitialTabRef.current = true;

    const centerActiveTabOnResize = (): void => {
      const bounds = activeTrigger.getBoundingClientRect();

      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        activeTrigger.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
      }
    };

    const scrollViewport = activeTrigger.closest("[data-radix-scroll-area-viewport]");
    const resizeObserver = new ResizeObserver(centerActiveTabOnResize);

    if (scrollViewport) {
      resizeObserver.observe(scrollViewport);
    }

    return () => resizeObserver.disconnect();
  }, [effectiveActiveTab, hydrated]);

  function handleActiveTabChange(nextTab: string): void {
    setActiveTab(nextTab);

    const params = new URLSearchParams(window.location.search);
    params.set("tab", nextTab);
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }

  // Focus the first invalid field once its tab has mounted after a failed
  // submission (the tab switch and this focus request commit together).
  useEffect(() => {
    if (!pendingFocusFieldId || isSubmitDialogOpen) {
      return;
    }

    const fieldId = pendingFocusFieldId;
    // The newly active TabsContent panel mounts through Radix's own Presence
    // state machine, which settles a render pass after this effect runs, so
    // the field isn't in the DOM yet here — defer the lookup a tick.
    const timeoutId = window.setTimeout(() => {
      document.getElementById(fieldId)?.focus();
      setPendingFocusFieldId(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pendingFocusFieldId, effectiveActiveTab, isSubmitDialogOpen]);

  return {
    hydrated,
    tabTriggerRefs,
    visibleTabs,
    effectiveActiveTab,
    handleActiveTabChange,
    setPendingFocusFieldId,
  };
}
