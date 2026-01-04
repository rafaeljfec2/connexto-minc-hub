import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { BrandText } from "@/components/ui/BrandText";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    roles: [
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.LEADER,
      UserRole.MEMBER,
    ],
  },
  {
    label: "Igrejas",
    href: "/churches",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN],
  },
  {
    label: "Times",
    href: "/ministries",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    label: "Equipes",
    href: "/teams",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    label: "Servos",
    href: "/people",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    label: "Cultos",
    href: "/services",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    label: "Escalas",
    href: "/schedules",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    label: "Comunicação",
    href: "/communication",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
];

const MOCK_MODE =
  import.meta.env.VITE_MOCK_MODE === "true" || !import.meta.env.VITE_API_URL;

export function Sidebar() {
  const location = useLocation();
  const { user, hasAnyRole } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return MOCK_MODE || hasAnyRole(item.roles);
  });

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-dark-900 border-r border-dark-800 fixed left-0 top-0 h-screen z-40">
        <div className="flex items-center gap-2 p-6 border-b border-dark-800">
          <img
            src="/Logo-minc.png"
            alt="MINC Hub Logo"
            className="h-8 w-auto object-contain"
          />
          <BrandText size="sm" />
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-dark-300 hover:bg-dark-800 hover:text-dark-50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        {user && (
          <div className="p-4 border-t border-dark-800">
            <div className="px-4 py-2 text-sm text-dark-400">{user.name}</div>
          </div>
        )}
      </aside>

      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-50"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {isMobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-40 cursor-pointer"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Fechar menu"
            />
            <aside className="fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-800 z-50 overflow-y-auto">
              <div className="flex items-center gap-2 p-6 border-b border-dark-800">
                <img
                  src="/Logo-minc.png"
                  alt="MINC Hub Logo"
                  className="h-8 w-auto object-contain"
                />
                <BrandText size="sm" />
              </div>
              <nav className="p-4">
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary-600 text-white"
                            : "text-dark-300 hover:bg-dark-800 hover:text-dark-50"
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
              {user && (
                <div className="p-4 border-t border-dark-800">
                  <div className="px-4 py-2 text-sm text-dark-400">
                    {user.name}
                  </div>
                </div>
              )}
            </aside>
          </>
        )}
      </div>
    </>
  );
}
