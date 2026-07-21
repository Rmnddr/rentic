/**
 * Templates HTML des emails transactionnels — français, styles inline
 * uniquement (compatibilité clients mail). Aucune dépendance externe.
 */

type BookingItem = {
  name: string;
  quantity: number;
  /** Prix unitaire en centimes. */
  unitPrice: number;
};

export type BookingConfirmationParams = {
  shopName: string;
  customerName: string;
  /** Date ISO (yyyy-mm-dd). */
  startDate: string;
  /** Date ISO (yyyy-mm-dd). */
  endDate: string;
  items: BookingItem[];
  /** Total en centimes. */
  totalPrice: number;
  reference: string;
};

export type EmployeeInvitationParams = {
  shopName: string;
  inviteUrl: string;
};

/** Formate un montant en centimes → "12,50 €". */
function formatEuros(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

/** Formate une date ISO → "01/08/2026". */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

/** Échappe le HTML des valeurs dynamiques (noms saisis par l'utilisateur). */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const WRAPPER_STYLE =
  "font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;";
const CARD_STYLE =
  "background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;";
const CELL_STYLE =
  "padding:8px 4px;border-bottom:1px solid #e5e7eb;font-size:14px;";

export function bookingConfirmationHtml(params: BookingConfirmationParams): string {
  const rows = params.items
    .map(
      (item) => `
        <tr>
          <td style="${CELL_STYLE}">${escapeHtml(item.name)}</td>
          <td style="${CELL_STYLE}text-align:center;">${item.quantity}</td>
          <td style="${CELL_STYLE}text-align:right;">${formatEuros(item.unitPrice)}</td>
        </tr>`,
    )
    .join("");

  return `
  <div style="${WRAPPER_STYLE}">
    <h1 style="font-size:20px;margin:0 0 8px;">Réservation confirmée</h1>
    <p style="font-size:14px;line-height:1.5;">
      Bonjour ${escapeHtml(params.customerName)},<br />
      Votre réservation chez <strong>${escapeHtml(params.shopName)}</strong> est confirmée.
    </p>
    <div style="${CARD_STYLE}">
      <p style="font-size:14px;margin:0 0 4px;">
        <strong>Référence :</strong> ${escapeHtml(params.reference)}
      </p>
      <p style="font-size:14px;margin:0;">
        <strong>Période :</strong> du ${formatDate(params.startDate)} au ${formatDate(params.endDate)}
      </p>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="${CELL_STYLE}text-align:left;">Article</th>
          <th style="${CELL_STYLE}text-align:center;">Qté</th>
          <th style="${CELL_STYLE}text-align:right;">Prix unitaire</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
    <p style="font-size:16px;text-align:right;margin:16px 0;">
      <strong>Total : ${formatEuros(params.totalPrice)}</strong>
    </p>
    <p style="font-size:12px;color:#6b7280;line-height:1.5;">
      Présentez cette référence en magasin le jour du retrait.
      Pour toute question, contactez directement ${escapeHtml(params.shopName)}.
    </p>
  </div>`;
}

export function employeeInvitationHtml(params: EmployeeInvitationParams): string {
  return `
  <div style="${WRAPPER_STYLE}">
    <h1 style="font-size:20px;margin:0 0 8px;">Invitation à rejoindre ${escapeHtml(params.shopName)}</h1>
    <p style="font-size:14px;line-height:1.5;">
      Bonjour,<br />
      Vous avez été invité(e) à rejoindre l'équipe de
      <strong>${escapeHtml(params.shopName)}</strong> sur Rentic.
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a
        href="${params.inviteUrl}"
        style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;"
      >Rejoindre l'équipe</a>
    </p>
    <p style="font-size:12px;color:#6b7280;line-height:1.5;">
      Ce lien expire dans 7 jours. Si le bouton ne fonctionne pas, copiez cette
      adresse dans votre navigateur :<br />
      ${params.inviteUrl}
    </p>
  </div>`;
}
