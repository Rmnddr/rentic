import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingTable } from "@/features/admin/components/onboarding-table";
import { getOnboardingFunnel } from "@/features/admin/queries";

export default async function AdminOnboardingPage() {
  const { incomplete, inactive } = await getOnboardingFunnel();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-h1">Onboarding</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Loueurs bloqués dans le parcours d&apos;installation ou inscrits sans
          aucune activité
        </p>
      </header>

      <section aria-labelledby="titre-onboarding-incomplet">
        <Card>
          <CardHeader>
            <CardTitle id="titre-onboarding-incomplet" className="text-h3">
              Onboarding incomplet ({incomplete.length})
            </CardTitle>
            <CardDescription>
              Le parcours d&apos;installation n&apos;a jamais été terminé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingTable
              rows={incomplete}
              caption="Loueurs dont l'onboarding n'est pas terminé, avec l'étape atteinte"
              emptyLabel="Aucun onboarding en cours d'abandon."
              showStep
            />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="titre-onboarding-inactif">
        <Card>
          <CardHeader>
            <CardTitle id="titre-onboarding-inactif" className="text-h3">
              Onboarding terminé, zéro activité ({inactive.length})
            </CardTitle>
            <CardDescription>
              Installation finalisée, mais aucun produit ni aucune réservation
              créés à ce jour.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingTable
              rows={inactive}
              caption="Loueurs ayant terminé l'onboarding sans créer de produit ni de réservation"
              emptyLabel="Tous les loueurs installés ont démarré leur activité."
              showStep={false}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
