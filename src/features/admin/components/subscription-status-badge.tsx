import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "../types";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Actif", variant: "default" },
  trialing: { label: "Essai", variant: "secondary" },
  past_due: { label: "Impayé", variant: "destructive" },
  canceled: { label: "Résilié", variant: "outline" },
  expired: { label: "Expiré", variant: "outline" },
};

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus | null;
}) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Aucun abonnement
      </Badge>
    );
  }

  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
