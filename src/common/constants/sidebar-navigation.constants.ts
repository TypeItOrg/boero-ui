export const SIDEBAR_NAVIGATION_BUTTON_CLASS_NAME =
  "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground h-9 gap-3 rounded-md px-2 text-sm font-medium transition-colors motion-reduce:transition-none group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0!";

export const SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME =
  "data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground";

export const SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES = {
  institutional: "institutional-sidebar-groups",
  platform: "platform-sidebar-groups",
} as const;

export const SIDEBAR_NAVIGATION_GROUPS_COOKIE_MAX_AGE = 31536000;
