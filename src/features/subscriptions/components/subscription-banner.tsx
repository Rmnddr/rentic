import Link from "next/link";
import { AlertTriangle, Clock, CreditCard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// Story 7.5 : bandeau d'alerte selon l'état de l'abonnement.
// Le blocage effectif de l'accès est assuré par le middleware ; ce bandeau
// prévient AVANT que le loueur se retrouve bloqué.

type Props = {
  status: string;
  trialEndsAt: string | null;
  /** L'utilisateur peut-il souscrire lui-même ? (les employés ne peuvent pas) */
  canManage: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Jours restants avant une date, borné à 0. */
function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS));
}

export function SubscriptionBanner({ status, trialEndsAt, canManage }: Props) {
  // Essai : on n'alerte que dans les 7 derniers jours, pour ne pas crier au loup
  if (status === "trialing") {
    if (!trialEndsAt) return null;
    const days = daysUntil(trialEndsAt);
    if (days > 7) return null;

    return (
      <Banner
        tone="warning"
        icon={<Clock className="size-5 shrink-0" aria-hidden />}
        message={
          days === 0
            ? "Votre essai gratuit se termine aujourd'hui."
            : `Votre essai gratuit se termine dans ${days} jour${days > 1 ? "s" : ""}.`
        }
        action={canManage ? { href: "/subscription", label: "Choisir un plan" } : null}
      />
    );
  }

  if (status === "past_due") {
    return (
      <Banner
        tone="warning"
        icon={<CreditCard className="size-5 shrink-0" aria-hidden />}
        message="Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour conserver l'accès."
        action={canManage ? { href: "/subscription", label: "Régulariser" } : null}
      />
    );
  }

  if (status === "canceled" || status === "expired") {
    return (
      <Banner
        tone="destructive"
        icon={<AlertTriangle className="size-5 shrink-0" aria-hidden />}
        message={
          status === "canceled"
            ? "Votre abonnement a été résilié. Réactivez-le pour retrouver l'accès à votre magasin."
            : "Votre abonnement a expiré. Réactivez-le pour retrouver l'accès à votre magasin."
        }
        action={canManage ? { href: "/subscription", label: "Réactiver" } : null}
      />
    );
  }

  return null;
}

function Banner({
  tone,
  icon,
  message,
  action,
}: {
  tone: "warning" | "destructive";
  icon: React.ReactNode;
  message: string;
  action: { href: string; label: string } | null;
}) {
  const toneClasses =
    tone === "destructive"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div
      role="status"
      className={`mb-6 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 ${toneClasses}`}
    >
      {icon}
      <p className="flex-1 text-body-sm font-medium">{message}</p>
      {action && (
        <Link
          href={action.href}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
