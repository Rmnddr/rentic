import { Sidebar } from "@/features/dashboard/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role, shop_id")
    .eq("id", user.id)
    .single();

  const { data: shop } = await supabase
    .from("shops")
    .select("name, onboarding_completed")
    .eq("id", profile?.shop_id ?? "")
    .single();

  // Redirect to onboarding if not completed
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "";
  const isOnboardingPage = pathname.includes("/onboarding");

  if (shop && !shop.onboarding_completed && !isOnboardingPage) {
    redirect("/onboarding");
  }

  const userName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "Utilisateur";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        shopName={shop?.name ?? "Mon magasin"}
        userName={userName}
        userRole={(profile?.role as "owner" | "employee") ?? "owner"}
      />

      <main className="min-h-screen pt-16 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
