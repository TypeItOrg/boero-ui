import { cookies } from "next/headers";

import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { PlatformAccountProvider } from "@features/platform-auth/components/platform-account-provider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@common/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@common/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@common/components/ui/sidebar-constants";
import { Separator } from "@common/components/ui/separator";
import { PlatformSidebar } from "@features/platform-auth/components/platform-sidebar";

export default async function PlatformLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const account = await getPlatformAccount();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <PlatformAccountProvider initialAccount={account}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "20rem",
            "--sidebar-width-mobile": "8rem",
            "--sidebar-width-icon": "4.5rem",
          } as React.CSSProperties
        }
      >
        <PlatformSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Panel de Control</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </PlatformAccountProvider>
  );
}
