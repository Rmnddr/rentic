import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/(auth)/login");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      {params.error === "owner-only" && (
        <div className="rounded-lg bg-warning/10 px-4 py-2 text-sm text-warning">
          Accès réservé au propriétaire
        </div>
      )}
      <h1 className="text-h1 text-primary">Dashboard</h1>
      <p className="text-muted-foreground">Bienvenue, {user.email}</p>
      <SignOutButton />
    </main>
  );
}
