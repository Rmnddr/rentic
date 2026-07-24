import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { signOutAction } from "@/features/auth/actions";
import { isPlatformAdmin } from "@/features/admin/auth";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Défense en profondeur : le middleware masque déjà /admin aux non-admins.
  if (!(await isPlatformAdmin())) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  R
                </span>
              </div>
              <div>
                <p className="text-h3 leading-tight text-foreground">Rentic</p>
                <p className="text-caption text-muted-foreground">
                  Console plateforme
                </p>
              </div>
              <Badge variant="secondary" className="uppercase tracking-wide">
                Administration
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Retour au back-office</Link>
              </Button>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Déconnexion
                </Button>
              </form>
            </div>
          </div>

          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>

      <Toaster />
    </div>
  );
}
