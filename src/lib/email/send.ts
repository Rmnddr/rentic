import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Couche d'envoi d'emails transactionnels (Resend) avec fallback no-op.
 *
 * Principe NCF : un email est un effet NON critique. Cette fonction ne jette
 * JAMAIS — quel que soit l'échec (clé absente, API Resend down, insert de log
 * raté), l'appelant reçoit simplement { sent: false }.
 *
 * Chaque tentative est tracée dans email_logs (via le client admin, car
 * l'appelant peut être anonyme — ex. tunnel de réservation public) :
 * - "skipped" : RESEND_API_KEY absente (environnement non configuré)
 * - "sent"    : envoi accepté par Resend
 * - "failed"  : erreur Resend ou exception
 */

const FROM_ADDRESS = "Rentic <noreply@rentic.fr>";

type EmailLogStatus = "sent" | "failed" | "skipped";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  /** Type métier de l'email (ex. "booking_confirmation", "employee_invitation"). */
  type: string;
  shopId?: string;
};

export type SendEmailResult = { sent: boolean };

/** Trace la tentative dans email_logs — ne jette jamais (best effort). */
async function logEmail(
  params: SendEmailParams,
  status: EmailLogStatus,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("email_logs").insert({
      shop_id: params.shopId ?? null,
      type: params.type,
      recipient: params.to,
      status,
    });
    if (error) {
      console.error("[email] Impossible de tracer dans email_logs:", error.message);
    }
  } catch (err) {
    console.error("[email] Impossible de tracer dans email_logs:", err);
  }
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    // Import paresseux : charger @/lib/env au moment de l'usage (et non à
    // l'import du module) évite de déclencher la validation d'env dans les
    // tests des actions qui nous importent, et reste couvert par le try.
    const { env } = await import("@/lib/env");

    if (!env.RESEND_API_KEY) {
      console.warn(
        "[email] RESEND_API_KEY absente — email non envoyé:",
        params.type,
      );
      await logEmail(params, "skipped");
      return { sent: false };
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[email] Échec Resend:", params.type, error.message);
      await logEmail(params, "failed");
      return { sent: false };
    }

    await logEmail(params, "sent");
    return { sent: true };
  } catch (err) {
    console.error("[email] Erreur inattendue:", params.type, err);
    await logEmail(params, "failed");
    return { sent: false };
  }
}
