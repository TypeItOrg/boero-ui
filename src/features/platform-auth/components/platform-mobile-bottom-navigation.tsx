"use client";

import { MobileBottomNavigation } from "@common/components/navigation/mobile-bottom-navigation";
import { PLATFORM_BOTTOM_NAVIGATION_ITEMS, PLATFORM_PRIMARY_NAVIGATION_ITEM } from "@features/platform-auth/constants/platform-navigation.constants";

export function PlatformMobileBottomNavigation(): React.ReactElement {
  return <MobileBottomNavigation items={PLATFORM_BOTTOM_NAVIGATION_ITEMS} primaryItem={PLATFORM_PRIMARY_NAVIGATION_ITEM} />;
}
