import type { CSSProperties } from "react";

export type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  mobileWidth: CSSProperties["width"];
  toggleSidebar: () => void;
};
