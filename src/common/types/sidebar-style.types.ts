import type { CSSProperties } from "react";

export type SidebarStyle = CSSProperties & {
  "--sidebar-width-mobile"?: CSSProperties["width"];
};
