import type { ReactElement } from "react";

import type { Metadata } from "next";

import { NotFoundContent } from "@common/components/navigation/not-found-content";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que estás buscando no existe o cambió de ubicación.",
};

export default function NotFound(): ReactElement {
  return <NotFoundContent />;
}
