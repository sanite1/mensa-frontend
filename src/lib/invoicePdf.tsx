// invoicePdf.tsx — the printable invoice, one template shared by the admin
// detail page and the customer's public page. Follows the house template:
// INVOICE title with the logo, billed to and invoice meta, an ink header
// line table with alternating rows, right aligned totals ending in an ink
// grand total bar, notes, then payment information and the studio contact
// pinned to the foot of the page. Rendered in the browser, no server work.
//
// Amounts print as "NGN" because DM Sans has no naira glyph and standard
// PDF fonts cannot encode it either.

import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'

import dmSansRegular from '@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff?url'
import dmSansMedium from '@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff?url'
import dmSansBold from '@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff?url'
import logoSrc from '@/assets/mensa_logo.png'
import type { Invoice, InvoiceSettings } from '@/lib/network/api/invoice.api'

Font.register({
  family: 'DM Sans',
  fonts: [
    { src: dmSansRegular, fontWeight: 400 },
    { src: dmSansMedium, fontWeight: 500 },
    { src: dmSansBold, fontWeight: 700 },
  ],
})

// Hyphenation off, product names and emails should never break mid word.
Font.registerHyphenationCallback((word) => [word])

const INK = '#1A1410'
const PAPER = '#FFFCF6'
const GRAPHITE = '#4F433B'
const CREAM_SOFT = '#F6EFE4'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'DM Sans',
    fontSize: 10.5,
    color: INK,
    backgroundColor: PAPER,
    paddingTop: 48,
    paddingHorizontal: 48,
    paddingBottom: 150,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 38, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 },
  logo: { height: 30, objectFit: 'contain' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 44 },
  label: { fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' },
  metaText: { fontSize: 10.5, lineHeight: 1.55 },
  metaRight: { alignItems: 'flex-end', textAlign: 'right' },
  table: { marginTop: 40 },
  headRow: { flexDirection: 'row', backgroundColor: INK, color: PAPER },
  row: { flexDirection: 'row' },
  rowAlt: { backgroundColor: CREAM_SOFT },
  cellHead: {
    paddingVertical: 9,
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cell: { paddingVertical: 10, fontSize: 10.5 },
  colDesc: { flexGrow: 1, flexBasis: 0, paddingLeft: 14, paddingRight: 8 },
  colQty: { width: 74, textAlign: 'center' },
  colPrice: { width: 90, textAlign: 'right', paddingRight: 8 },
  colTotal: { width: 96, textAlign: 'right', paddingRight: 14 },
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  totals: { width: 240 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: INK,
    color: PAPER,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 6,
    fontWeight: 700,
    fontSize: 11.5,
  },
  notes: { marginTop: 22, fontSize: 10, lineHeight: 1.55, color: GRAPHITE },
  footer: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 48,
    borderTopWidth: 1,
    borderTopColor: INK,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerList: { marginTop: 5, fontSize: 10.5, lineHeight: 1.6 },
  footerRight: { fontSize: 10.5, lineHeight: 1.6, textAlign: 'right' },
  muted: { color: GRAPHITE },
})

const money = (kobo: number): string => `NGN ${(kobo / 100).toLocaleString('en-NG')}`

const dateLabel = (iso: string | null | undefined): string =>
  iso
    ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

export function InvoicePdfDocument({
  invoice,
  settings,
}: {
  invoice: Invoice
  settings: InvoiceSettings
}) {
  const hasBank = !!(settings.bankName || settings.accountName || settings.accountNumber)
  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`} author="Mensa Period Products">
      <Page size="A4" style={styles.page}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>INVOICE</Text>
          <Image src={logoSrc} style={styles.logo} />
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.label}>Billed to:</Text>
            <Text style={styles.metaText}>{invoice.customer.name}</Text>
            {invoice.customer.address ? (
              <Text style={styles.metaText}>{invoice.customer.address}</Text>
            ) : null}
            {invoice.customer.phone ? (
              <Text style={styles.metaText}>{invoice.customer.phone}</Text>
            ) : null}
            <Text style={[styles.metaText, styles.muted]}>{invoice.customer.email}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.label}>Date :</Text>
            <Text style={styles.metaText}>{dateLabel(invoice.sentAt ?? invoice.createdAt)}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Invoice no.</Text>
            <Text style={styles.metaText}>{invoice.invoiceNumber}</Text>
            {invoice.dueDate ? (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Due :</Text>
                <Text style={styles.metaText}>{dateLabel(invoice.dueDate)}</Text>
              </>
            ) : null}
            {invoice.status === 'paid' ? (
              <Text style={[styles.label, { marginTop: 8 }]}>Paid {dateLabel(invoice.paidAt)}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.headRow}>
            <Text style={[styles.cellHead, styles.colDesc]}>Description</Text>
            <Text style={[styles.cellHead, styles.colQty]}>Quantity</Text>
            <Text style={[styles.cellHead, styles.colPrice]}>Price</Text>
            <Text style={[styles.cellHead, styles.colTotal]}>Total</Text>
          </View>
          {invoice.lines.map((line, i) => (
            <View
              key={line._id ?? i}
              style={[styles.row, i % 2 === 0 ? styles.rowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colDesc]}>
                {line.description}
                {line.variantLabel ? ` · ${line.variantLabel}` : ''}
              </Text>
              <Text style={[styles.cell, styles.colQty]}>{line.qty}</Text>
              <Text style={[styles.cell, styles.colPrice]}>{money(line.unitPrice)}</Text>
              <Text style={[styles.cell, styles.colTotal]}>{money(line.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>{money(invoice.totals.subtotal)}</Text>
            </View>
            {invoice.totals.discount > 0 ? (
              <View style={styles.totalRow}>
                <Text>Discount:</Text>
                <Text>− {money(invoice.totals.discount)}</Text>
              </View>
            ) : null}
            {invoice.vatPercent != null && invoice.vatPercent > 0 ? (
              <View style={styles.totalRow}>
                <Text>VAT ({invoice.vatPercent}%):</Text>
                <Text>{money(invoice.totals.vat)}</Text>
              </View>
            ) : null}
            {invoice.totals.shipping > 0 ? (
              <View style={styles.totalRow}>
                <Text>{invoice.shippingLabel}:</Text>
                <Text>{money(invoice.totals.shipping)}</Text>
              </View>
            ) : null}
            <View style={styles.grandRow}>
              <Text>Grand Total:</Text>
              <Text>{money(invoice.totals.total)}</Text>
            </View>
          </View>
        </View>

        {invoice.notes ? <Text style={styles.notes}>{invoice.notes}</Text> : null}

        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.label}>Payment information</Text>
            {hasBank ? (
              <View style={styles.footerList}>
                {settings.bankName ? <Text>• {settings.bankName}</Text> : null}
                {settings.accountName ? <Text>• Account Name: {settings.accountName}</Text> : null}
                {settings.accountNumber ? (
                  <Text>• Account No: {settings.accountNumber}</Text>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.footerList, styles.muted]}>
                Pay online from the invoice link.
              </Text>
            )}
          </View>
          <View style={styles.footerRight}>
            {settings.contactPhone ? <Text>{settings.contactPhone}</Text> : null}
            {settings.contactAddress ? <Text>{settings.contactAddress}</Text> : null}
            {settings.contactWebsite ? <Text>{settings.contactWebsite}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  )
}

/** Render and hand the browser a download named after the invoice number. */
export async function downloadInvoicePdf(
  invoice: Invoice,
  settings: InvoiceSettings,
): Promise<void> {
  const blob = await pdf(<InvoicePdfDocument invoice={invoice} settings={settings} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${invoice.invoiceNumber}.pdf`
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
