import React, { useState } from 'react';
import {
  X, Download, Copy, CheckCircle2, FileText,
  Calendar, CreditCard, User, Building2, Shield,
  Receipt, Banknote, Clock, Mail, Hash, Layers
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { usePDF, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',   fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',  fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',    fontWeight: 700 },
  ]
});

/* ─── shared helpers ────────────────────────────────── */
const SectionCard = ({ icon: Icon, iconBg, iconColor, title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
    <div className="h-0.5 bg-linear-to-r from-blue-500 to-purple-500" />
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value, mono = false, badge = false, badgeCls = '' }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    {badge ? (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${badgeCls}`}>
        <CheckCircle2 className="w-3 h-3" /> {value}
      </span>
    ) : (
      <span className={`text-xs font-bold text-gray-900 dark:text-white text-right ${mono ? 'font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg' : ''}`}>
        {value}
      </span>
    )}
  </div>
);

/* ─── PDF styles ─────────────────────────────────────── */
const pdfStyles = StyleSheet.create({
  page:            { padding: 32, fontFamily: 'Helvetica', backgroundColor: '#f8fafc' },
  header:          { alignItems: 'center', marginBottom: 24 },
  companyRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  companyName:     { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  companyTag:      { fontSize: 10, color: '#64748b' },
  receiptTitle:    { fontSize: 17, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 4 },
  txnId:           { fontSize: 10, color: '#64748b', marginBottom: 8 },
  statusPill:      { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusTxt:       { fontSize: 9, fontWeight: 'bold', color: '#065f46' },
  grid:            { flexDirection: 'row', gap: 14, marginBottom: 24 },
  col:             { flex: 1, gap: 14 },
  card:            { backgroundColor: '#ffffff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle:       { fontSize: 11, fontWeight: 'bold', color: '#1e293b', marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  row:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  lbl:             { fontSize: 9, color: '#64748b' },
  val:             { fontSize: 9, fontWeight: 'bold', color: '#1e293b' },
  green:           { fontSize: 9, fontWeight: 'bold', color: '#059669' },
  amtCard:         { backgroundColor: '#1d4ed8', borderRadius: 10, padding: 14 },
  amtHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  amtTitle:        { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  amtVal:          { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  divider:         { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: 10 },
  amtRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  amtLbl:          { fontSize: 9, color: '#bfdbfe' },
  amtSubVal:       { fontSize: 9, color: '#fff', fontWeight: 'bold' },
  totalRow:        { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: 8, marginTop: 6 },
  totalTxt:        { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  footer:          { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  footerTxt:       { fontSize: 8, color: '#64748b', marginBottom: 5, textAlign: 'center', lineHeight: 1.5 },
  footerNote:      { fontSize: 7, color: '#94a3b8', marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
});

/* ─── Main Component ─────────────────────────────────── */
const PaymentReceiptModal = ({ payment, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!payment) return null;

  const formatDate = (ds) => {
    try {
      const d = parseISO(ds);
      return { full: format(d, 'MMMM dd, yyyy'), time: format(d, 'hh:mm a') };
    } catch { return { full: ds, time: '' }; }
  };
  const dateInfo = formatDate(payment.paidAt);

  /* ── PDF Doc ── */
  const ReceiptPDF = () => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companyRow}>
            <View>
              <Text style={pdfStyles.companyName}>CityFix</Text>
              <Text style={pdfStyles.companyTag}>Public Issue Reporting</Text>
            </View>
          </View>
          <Text style={pdfStyles.receiptTitle}>PAYMENT RECEIPT</Text>
          <Text style={pdfStyles.txnId}>Transaction ID: {payment.transactionId}</Text>
          <View style={pdfStyles.statusPill}><Text style={pdfStyles.statusTxt}>✓ Payment Verified & Secured</Text></View>
        </View>

        <View style={pdfStyles.grid}>
          <View style={pdfStyles.col}>
            <View style={pdfStyles.card}>
              <Text style={pdfStyles.cardTitle}>PAYMENT INFORMATION</Text>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Transaction ID</Text><Text style={pdfStyles.val}>{payment.transactionId}</Text></View>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Payment Type</Text><Text style={pdfStyles.val}>{payment.type}</Text></View>
              {payment.issueId && <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Issue ID</Text><Text style={pdfStyles.val}>{payment.issueId}</Text></View>}
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Method</Text><Text style={pdfStyles.val}>Credit Card</Text></View>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Status</Text><Text style={pdfStyles.green}>✓ Completed</Text></View>
            </View>
            <View style={pdfStyles.card}>
              <Text style={pdfStyles.cardTitle}>DATE & TIME</Text>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Date</Text><Text style={pdfStyles.val}>{dateInfo.full}</Text></View>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Time</Text><Text style={pdfStyles.val}>{dateInfo.time}</Text></View>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Time Zone</Text><Text style={pdfStyles.val}>UTC+6 (BDT)</Text></View>
            </View>
          </View>

          <View style={pdfStyles.col}>
            <View style={pdfStyles.card}>
              <Text style={pdfStyles.cardTitle}>CUSTOMER INFORMATION</Text>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>User ID</Text><Text style={pdfStyles.val}>{payment?.userId || 'N/A'}</Text></View>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Name</Text><Text style={pdfStyles.val}>{payment?.userName || 'N/A'}</Text></View>
              <View style={pdfStyles.row}><Text style={pdfStyles.lbl}>Email</Text><Text style={pdfStyles.val}>{payment.customerEmail || 'N/A'}</Text></View>
            </View>
            <View style={pdfStyles.amtCard}>
              <View style={pdfStyles.amtHeader}>
                <Text style={pdfStyles.amtTitle}>Amount Paid</Text>
                <Text style={pdfStyles.amtVal}>৳{payment.amount}</Text>
              </View>
              <View style={pdfStyles.divider}>
                <View style={pdfStyles.amtRow}><Text style={pdfStyles.amtLbl}>Subtotal</Text><Text style={pdfStyles.amtSubVal}>৳{payment.amount}</Text></View>
                <View style={pdfStyles.amtRow}><Text style={pdfStyles.amtLbl}>Tax (0%)</Text><Text style={pdfStyles.amtSubVal}>৳0.00</Text></View>
              </View>
              <View style={pdfStyles.totalRow}>
                <Text style={pdfStyles.totalTxt}>TOTAL</Text>
                <Text style={pdfStyles.totalTxt}>৳{payment.amount}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerTxt}>This receipt serves as an official record of your payment. Please keep it for your records.</Text>
          <Text style={pdfStyles.footerTxt}>For questions, contact support@cityfix.com or call +8801712349876.</Text>
          <Text style={pdfStyles.footerNote}>Official digital receipt. No physical copy will be mailed. Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );

  const [instance] = usePDF({ document: <ReceiptPDF /> });

  const handleDownloadPDF = () => {
    if (!instance.url) return;
    const a = document.createElement('a');
    a.href = instance.url;
    a.download = `Receipt-${payment.transactionId}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const copyToClipboard = async () => {
    const txt = `CityFix Payment Receipt\nTransaction ID: ${payment.transactionId}\nDate: ${dateInfo.full} ${dateInfo.time}\nType: ${payment.type}\nAmount: ৳${payment.amount}\nStatus: Completed`;
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { console.error(e); }
  };

  /* ── Render ── */
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl my-4 sm:my-8 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top gradient bar ── */}
        <div className="h-1.5 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

        {/* ── Modal Header ─────────────────────────── */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Payment Receipt</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{payment.transactionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────── */}
        <div className="p-4 sm:p-6">

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            <button
              onClick={handleDownloadPDF}
              disabled={!instance.url || instance.loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {instance.loading
                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
                : <><Download className="w-3.5 h-3.5" /> Download PDF</>
              }
            </button>

            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:scale-[1.02] ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {copied
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                : <><Copy className="w-3.5 h-3.5" /> Copy Details</>
              }
            </button>
          </div>

          {/* ── Receipt Preview ───────────────────── */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">

            {/* Company header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">CityFix</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Public Issue Reporting</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Payment Receipt</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" /> Payment Verified & Secured
                </div>
              </div>
            </div>

            {/* 2-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

              {/* Left col */}
              <div className="space-y-4">
                <SectionCard icon={CreditCard} iconBg="bg-blue-50 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" title="Payment Information">
                  <InfoRow label="TXN ID" value={payment.transactionId} mono />
                  <InfoRow label="Payment Type"   value={payment.type} />
                  {payment.issueId && <InfoRow label="Issue ID" value={payment.issueId} />}
                  <InfoRow label="Method" value="Credit Card" />
                  <InfoRow label="Status" value="Completed" badge badgeCls="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" />
                </SectionCard>

                <SectionCard icon={Calendar} iconBg="bg-violet-50 dark:bg-violet-900/30" iconColor="text-violet-600 dark:text-violet-400" title="Date & Time">
                  <InfoRow label="Date"      value={dateInfo.full} />
                  <InfoRow label="Time"      value={dateInfo.time} />
                  <InfoRow label="Time Zone" value="UTC+6 (BDT)" />
                </SectionCard>
              </div>

              {/* Right col */}
              <div className="space-y-4">
                <SectionCard icon={User} iconBg="bg-fuchsia-50 dark:bg-fuchsia-900/30" iconColor="text-fuchsia-600 dark:text-fuchsia-400" title="Customer Information">
                  <InfoRow label="User ID" value={payment?.userId       || 'N/A'} mono />
                  <InfoRow label="Name"    value={payment?.userName     || 'N/A'} />
                  <InfoRow label="Email"   value={payment?.customerEmail || 'N/A'} />
                </SectionCard>

                {/* Amount card */}
                <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-4 sm:p-5 shadow-xl shadow-blue-500/20 border border-blue-500/20">
                  {/* ambient glow */}
                  <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-purple-300/10 blur-2xl" />

                  {/* Amount header */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Amount Paid</p>
                      <p className="text-4xl font-black text-white tracking-tight">৳{payment.amount?.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                      <Banknote className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2.5 border-t border-white/20 pt-4">
                    {[
                      { l: 'Subtotal', v: `৳${payment.amount}` },
                      { l: 'Tax (0%)', v: '৳0.00' },
                    ].map(({ l, v }) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-xs text-white/60">{l}</span>
                        <span className="text-xs font-bold text-white/80">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2.5 border-t border-white/20">
                      <span className="text-sm font-black text-white">TOTAL</span>
                      <span className="text-sm font-black text-white">৳{payment.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="pt-5 border-t border-gray-200 dark:border-gray-700 text-center space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This receipt serves as an official record. Please keep it for your records.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Questions? Contact{' '}
                <a href="mailto:support@cityfix.com" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">support@cityfix.com</a>
                {' '}or{' '}
                <a href="tel:+8801712349876" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">+8801712349876</a>
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                Official digital receipt. No physical copy will be mailed.
              </p>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Need help?{' '}
            <a href="mailto:support@cityfix.com" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">support@cityfix.com</a>
            {' '}·{' '}
            <a href="tel:+8801712349876" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">+8801712349876</a>
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              disabled={!instance.url || instance.loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              {instance.loading ? 'Generating…' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;