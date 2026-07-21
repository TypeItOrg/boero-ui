import { act, renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@common/components/ui/sidebar";
import { useMobileSidebarNavigation } from "./use-mobile-sidebar-navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@common/components/ui/sidebar", () => ({
  useSidebar: jest.fn(),
}));

describe("useMobileSidebarNavigation", () => {
  const mockUsePathname = usePathname as jest.Mock;
  const mockUseSidebar = useSidebar as jest.Mock;
  const mockSetOpenMobile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("clears pendingUrl on desktop so external navigations update active link state", () => {
    mockUsePathname.mockReturnValue("/people");

    const { result, rerender } = renderHook(() => useMobileSidebarNavigation());

    // Click link for /people while on /people
    act(() => {
      result.current.handleNavigation("/people");
    });

    rerender();

    // On desktop, pendingUrl is cleared because pathname === pendingUrl
    expect(result.current.isActive("/people")).toBe(true);

    // Now simulate user navigating to /profile (e.g. from table action)
    mockUsePathname.mockReturnValue("/profile");
    rerender();

    expect(result.current.isActive("/people")).toBe(false);
    expect(result.current.isActive("/profile")).toBe(true);
  });

  it("clears pendingUrl when pathname changes to a new route", () => {
    mockUsePathname.mockReturnValue("/people");

    const { result, rerender } = renderHook(() => useMobileSidebarNavigation());

    // Click link for /roles while on /people
    act(() => {
      result.current.handleNavigation("/roles");
    });

    expect(result.current.isActive("/roles")).toBe(true);
    expect(result.current.isActive("/people")).toBe(false);

    // Route navigation completes to /roles
    mockUsePathname.mockReturnValue("/roles");
    rerender();

    // pendingUrl is cleared on desktop
    expect(result.current.isActive("/roles")).toBe(true);

    // Later navigate to /profile
    mockUsePathname.mockReturnValue("/profile");
    rerender();

    expect(result.current.isActive("/roles")).toBe(false);
    expect(result.current.isActive("/profile")).toBe(true);
  });

  it("closes mobile sidebar after delay on mobile when destination is reached", () => {
    mockUseSidebar.mockReturnValue({
      isMobile: true,
      setOpenMobile: mockSetOpenMobile,
    });
    mockUsePathname.mockReturnValue("/people");

    const { result, rerender } = renderHook(() => useMobileSidebarNavigation());

    act(() => {
      result.current.handleNavigation("/roles");
    });

    expect(result.current.isActive("/roles")).toBe(true);

    mockUsePathname.mockReturnValue("/roles");
    rerender();

    expect(mockSetOpenMobile).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
  });
});
