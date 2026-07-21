"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Store, UserRoundSearch } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const NAV_ITEMS: AdminNavItem[] = [
  { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { label: "Loueurs", href: "/admin/loueurs", icon: Store },
  { label: "Onboarding", href: "/admin/onboarding", icon: UserRoundSearch },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-1"
      aria-label="Navigation administration"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-sidebar-active text-primary"
                : "text-muted-foreground hover:bg-sidebar-active hover:text-primary",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
