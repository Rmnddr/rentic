import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteEmployeeDialog } from "@/features/employees/components/invite-employee-dialog";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";

export default async function TeamPage() {
  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;

  const { data: members } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, created_at")
    .eq("shop_id", shopId ?? "");

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, first_name, last_name, status, created_at")
    .eq("shop_id", shopId ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Équipe</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Gérez les membres de votre équipe
          </p>
        </div>
        <InviteEmployeeDialog />
      </header>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-h3">
            Membres
            <Badge variant="secondary" className="tabular-nums">
              {members?.length ?? 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-body-sm text-muted-foreground">
                Aucun membre
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      <span className="text-sm font-semibold text-secondary-foreground">
                        {(member.first_name ?? "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {[member.first_name, member.last_name]
                          .filter(Boolean)
                          .join(" ") || "Sans nom"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={member.role === "owner" ? "default" : "secondary"}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {member.role === "owner" ? "Propriétaire" : "Employé"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations */}
      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">Invitations en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {[inv.first_name, inv.last_name]
                        .filter(Boolean)
                        .join(" ") || inv.email}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {inv.email}
                    </p>
                  </div>
                  <Badge
                    variant={inv.status === "pending" ? "outline" : "secondary"}
                  >
                    {inv.status === "pending"
                      ? "En attente"
                      : inv.status === "accepted"
                        ? "Acceptée"
                        : "Expirée"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
