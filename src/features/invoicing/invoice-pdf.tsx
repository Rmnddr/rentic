import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateFr } from "@/lib/utils/format-date";

/**
 * Template PDF de facture (conforme France) — MODULE SERVEUR UNIQUEMENT.
 * @react-pdf/renderer ne doit JAMAIS être importé dans un composant client :
 * ce fichier n'est consommé que par la route GET
 * /reservations/[reservationId]/invoice (renderToBuffer côté Node).
 *
 * NB : les couleurs sont des littéraux hex — les tokens CSS de l'app ne
 * s'appliquent pas à un document PDF.
 */

export type InvoiceShopInfo = {
  name: string;
  address: string | null;
  siret: string | null;
  tvaNumber: string | null;
  email: string | null;
  phone: string | null;
};

export type InvoiceLine = {
  label: string;
  quantity: number;
  /** Prix unitaire en centimes */
  unitPriceCents: number;
  /** Total ligne en centimes */
  totalCents: number;
};

export type InvoicePdfData = {
  invoiceNumber: string;
  /** Date d'émission au format ISO (AAAA-MM-JJ) */
  issueDate: string;
  shop: InvoiceShopInfo;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  /** Dates de location au format ISO (AAAA-MM-JJ) */
  startDate: string;
  endDate: string;
  lines: InvoiceLine[];
  /** Total TTC en centimes */
  totalCents: number;
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  shopName: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  muted: { color: "#5c5c70", lineHeight: 1.5 },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginBottom: 6,
  },
  invoiceMeta: { textAlign: "right", color: "#5c5c70", lineHeight: 1.5 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#5c5c70",
    marginBottom: 6,
  },
  customerName: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  table: { marginBottom: 16 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
    paddingBottom: 6,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d9d9e3",
    paddingVertical: 6,
  },
  colProduct: { flex: 5 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 2, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    alignItems: "baseline",
  },
  totalLabel: { fontFamily: "Helvetica-Bold", fontSize: 12, marginRight: 16 },
  totalValue: { fontFamily: "Helvetica-Bold", fontSize: 14 },
  vatNotice: { marginTop: 24, color: "#5c5c70" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: "center",
    color: "#8a8a9a",
    fontSize: 8,
  },
});

function InvoicePdf({ data }: { data: InvoicePdfData }) {
  const { shop } = data;

  return (
    <Document
      title={`Facture ${data.invoiceNumber}`}
      author={shop.name}
      language="fr-FR"
    >
      <Page size="A4" style={styles.page}>
        {/* En-tête : émetteur + numéro/date */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{shop.name}</Text>
            {shop.address ? <Text style={styles.muted}>{shop.address}</Text> : null}
            {shop.email ? <Text style={styles.muted}>{shop.email}</Text> : null}
            {shop.phone ? <Text style={styles.muted}>{shop.phone}</Text> : null}
            {shop.siret ? (
              <Text style={styles.muted}>SIRET : {shop.siret}</Text>
            ) : null}
            {shop.tvaNumber ? (
              <Text style={styles.muted}>
                N° TVA intracommunautaire : {shop.tvaNumber}
              </Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>Facture</Text>
            <Text style={styles.invoiceMeta}>N° {data.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>
              Date d&apos;émission : {formatDateFr(data.issueDate)}
            </Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturé à</Text>
          <Text style={styles.customerName}>{data.customerName}</Text>
          {data.customerEmail ? (
            <Text style={styles.muted}>{data.customerEmail}</Text>
          ) : null}
          {data.customerPhone ? (
            <Text style={styles.muted}>{data.customerPhone}</Text>
          ) : null}
        </View>

        {/* Période de location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Période de location</Text>
          <Text>
            Du {formatDateFr(data.startDate)} au {formatDateFr(data.endDate)}
          </Text>
        </View>

        {/* Lignes */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Produit</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>PU TTC</Text>
            <Text style={styles.colTotal}>Total TTC</Text>
          </View>
          {data.lines.map((line, index) => (
            <View style={styles.tableRow} key={`${line.label}-${index}`}>
              <Text style={styles.colProduct}>{line.label}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colUnit}>
                {formatCurrency(line.unitPriceCents)}
              </Text>
              <Text style={styles.colTotal}>
                {formatCurrency(line.totalCents)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(data.totalCents)}
            </Text>
          </View>
        </View>

        {/* Mention TVA obligatoire */}
        <Text style={styles.vatNotice}>
          {shop.tvaNumber
            ? `TVA acquittée sur les encaissements — N° TVA : ${shop.tvaNumber}`
            : "TVA non applicable, art. 293 B du CGI"}
        </Text>

        <Text style={styles.footer}>
          {[shop.name, shop.siret ? `SIRET ${shop.siret}` : null]
            .filter(Boolean)
            .join(" — ")}
        </Text>
      </Page>
    </Document>
  );
}

/** Rend la facture en Buffer PDF (appelé uniquement par la route GET). */
export async function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return renderToBuffer(<InvoicePdf data={data} />);
}
