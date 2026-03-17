"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CreditCard,
  Globe,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  ownerOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/(dashboard)", icon: LayoutDashboard },
  { label: "Réservations", href: "/(dashboard)/reservations", icon: CalendarDays },
  { label: "Catalogue", href: "/(dashboard)/catalog", icon: Package },
  { label: "Packs", href: "/(dashboard)/packs", icon: Layers },
  { label: "Site Web", href: "/(dashboard)/website", icon: Globe, ownerOnly: true },
  { label: "Abonnement", href: "/(dashboard)/subscription", icon: CreditCard, ownerOnly: true },
  { label: "Équipe", href: "/(dashboard)/team", icon: Users, ownerOnly: true },
  { label: "Paramètres", href: "/(dashboard)/settings", icon: Settings, ownerOnly: true },
];

type SidebarProps = {
  shopName: string;
  userName: string;
  userRole: "owner" | "employee";
};

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-active hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-h-[44px]",
        isActive
          ? "bg-sidebar-active text-primary"
          : "text-muted-foreground",
      )}
    >
      <item.icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-primary",
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      {item.label}
    </Link>
  );
}

function SidebarContent({ shopName, userName, userRole, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.ownerOnly || userRole === "owner",
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-h3 leading-tight text-foreground">Rentic</p>
            <p className="truncate text-caption text-muted-foreground">{shopName}</p>
          </div>
        </div>
      </div>

      <Separator className="mx-4 my-3 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Navigation principale">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || (item.href !== "/(dashboard)" && pathname.startsWith(item.href))}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
            <span className="text-sm font-semibold text-secondary-foreground">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <Badge
              variant="secondary"
              className="mt-0.5 text-[10px] font-medium uppercase tracking-wide"
            >
              {userRole === "owner" ? "Propriétaire" : "Employé"}
            </Badge>
          </div>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — fixed */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col rounded-r-2xl bg-sidebar shadow-lg">
          <SidebarContent {...props} />
        </div>
      </aside>

      {/* Mobile sidebar — sheet */}
      <div className="fixed left-0 top-0 z-40 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="m-3 h-11 w-11 rounded-lg bg-card shadow-md"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
