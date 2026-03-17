import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, onboarding_current_step, shop_id")
    .eq("id", user.id)
    .single();

  const { data: shop } = await supabase
    .from("shops")
    .select("name, address, siret, tva_number, phone, onboarding_completed")
    .eq("id", profile?.shop_id ?? "")
    .single();

  if (shop?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <OnboardingWizard
        currentStep={profile?.onboarding_current_step ?? 1}
        profile={{
          firstName: profile?.first_name ?? "",
          lastName: profile?.last_name ?? "",
        }}
        shop={{
          name: shop?.name ?? "",
          address: shop?.address ?? "",
          siret: shop?.siret ?? "",
          tvaNumber: shop?.tva_number ?? "",
          phone: shop?.phone ?? "",
        }}
      />
    </div>
  );
}
