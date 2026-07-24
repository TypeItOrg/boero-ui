import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { PlatformAccountProvider } from "@features/platform-auth/components/platform-account-provider";
import { PlatformMobileBottomNavigation } from "@features/platform-auth/components/platform-mobile-bottom-navigation";
import { SidebarInset, SidebarProvider } from "@common/components/ui/sidebar";
import { PlatformSidebar } from "@features/platform-auth/components/platform-sidebar";
import { PlatformTopbar } from "@features/platform-auth/components/platform-topbar";

export default async function PlatformLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const account = await getPlatformAccount();

  return (
    <PlatformAccountProvider initialAccount={account}>
      <SidebarProvider
        open={false}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-mobile": "18rem",
            "--sidebar-width-icon": "4.5rem",
          } as React.CSSProperties
        }
      >
        <PlatformSidebar />
        <SidebarInset className="bg-background gap-3 pb-[calc((var(--spacing)*21)+env(safe-area-inset-bottom))] md:m-0 md:ml-0 md:gap-4 md:rounded-none md:p-4 md:shadow-none md:peer-data-[state=collapsed]:ml-0">
          <PlatformTopbar />
          <div className="bg-muted flex min-w-0 flex-1 flex-col overflow-x-hidden rounded-2xl">{children}</div>
        </SidebarInset>
        <PlatformMobileBottomNavigation />
      </SidebarProvider>
    </PlatformAccountProvider>
  );
}

// pb-[calc(var(--spacing)*12+env(safe-area-inset-bottom))]
