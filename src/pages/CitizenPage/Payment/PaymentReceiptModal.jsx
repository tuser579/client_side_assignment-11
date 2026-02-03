import React, { useState } from 'react';
import {
    X,
    Download,
    Printer,
    Copy,
    CheckCircle,
    FileText,
    Calendar,
    CreditCard,
    User,
    Building,
    Shield
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { usePDF, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for better PDF styling (optional)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ]
});

const PaymentReceiptModal = ({ payment, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!payment) return null;

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = parseISO(dateString);
            return {
                full: format(date, 'MMMM dd, yyyy'),
                time: format(date, 'hh:mm a'),
                iso: format(date, 'yyyy-MM-dd')
            };
        } catch {
            return {
                full: dateString,
                time: '',
                iso: dateString
            };
        }
    };

    const dateInfo = formatDate(payment.paidAt);

    // React PDF Document Component - Matching your modal design
    const ReceiptPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header matching modal */}
                <View style={styles.header}>
                    <View style={styles.companySection}>
                        <View>
                            <Text style={styles.companyName}>CityFix</Text>
                            <Text style={styles.companyTagline}>Public Issue Reporting</Text>
                        </View>
                    </View>

                    <View style={styles.receiptTitleSection}>
                        <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
                        <Text style={styles.transactionId}>Transaction ID: {payment.transactionId}</Text>
                    </View>

                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>✓ Payment Verified & Secured</Text>
                    </View>
                </View>

                {/* Main Content Grid - Matching your 2-column layout */}
                <View style={styles.contentGrid}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                        {/* Payment Information Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>PAYMENT INFORMATION</Text>
                            </View>
                            <View style={styles.cardBody}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Transaction ID:</Text>
                                    <Text style={styles.infoValue}>{payment.transactionId}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Payment Type:</Text>
                                    <Text style={styles.infoValue}>{payment.type}</Text>
                                </View>
                                {
                                    payment.issueId && <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Issue Id:</Text>
                                        <Text style={styles.infoValue}>{payment.issueId}</Text>
                                    </View>
                                }
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Payment Method:</Text>
                                    <Text style={styles.infoValue}>Credit Card</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Status:</Text>
                                    <Text style={styles.statusBadgeText}>✓ Completed</Text>
                                </View>
                            </View>
                        </View>

                        {/* Date & Time Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>DATE & TIME</Text>
                            </View>
                            <View style={styles.cardBody}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Date:</Text>
                                    <Text style={styles.infoValue}>{dateInfo.full}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Time:</Text>
                                    <Text style={styles.infoValue}>{dateInfo.time}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Time Zone:</Text>
                                    <Text style={styles.infoValue}>UTC+6 (BDT)</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Right Column */}
                    <View style={styles.rightColumn}>
                        {/* Customer Information Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>CUSTOMER INFORMATION</Text>
                            </View>
                            <View style={styles.cardBody}>
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>User Id:</Text>
                                    <Text style={styles.infoValue}>{payment?.userId || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Name:</Text>
                                    <Text style={styles.infoValue}>{payment?.userName || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Email:</Text>
                                    <Text style={styles.infoValue}>{payment.customerEmail || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Amount Card - Matching your modal's design */}
                        <View style={styles.amountCard}>
                            <View style={styles.amountHeader}>
                                <Text style={styles.amountTitle}>Amount Paid</Text>
                                <Text style={styles.amountValue}>{payment.amount}</Text>
                            </View>
                            <View style={styles.amountBreakdown}>
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>Subtotal:</Text>
                                    <Text style={styles.breakdownValue}>{payment.amount}</Text>
                                </View>
                                <View style={styles.breakdownRow}>
                                    <Text style={styles.breakdownLabel}>Tax(0%):</Text>
                                    <Text style={styles.breakdownValue}>0.00</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>TOTAL:</Text>
                                    <Text style={styles.totalLabel}>{payment.amount}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer matching modal */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This receipt serves as an official record of your payment. Please keep it for your records.
                    </Text>
                    <Text style={styles.footerText}>
                        For any questions regarding this payment, contact our support team at support@cityfix.com
                        or call +8801712349876.
                    </Text>
                    <Text style={styles.footerNote}>
                        This is an official digital receipt. No physical copy will be mailed.
                        Generated on {new Date().toLocaleDateString()}
                    </Text>
                </View>
            </Page>
        </Document>
    );

    // PDF Styles matching your modal design
    const styles = StyleSheet.create({
        page: {
            padding: 30,
            fontFamily: 'Helvetica',
            backgroundColor: '#f8fafc'
        },
        header: {
            marginBottom: 25,
            alignItems: 'center'
        },
        companySection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
            gap: 10
        },
        companyIcon: {
            width: 40,
            height: 40,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e2e8f0'
        },
        buildingIcon: {
            fontSize: 18
        },
        companyName: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: 2,
            textAlign: 'center'
        },
        companyTagline: {
            fontSize: 11,
            color: '#64748b'
        },
        receiptTitleSection: {
            marginBottom: 10,
            alignItems: 'center'
        },
        receiptTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: 4
        },
        transactionId: {
            fontSize: 11,
            color: '#64748b'
        },
        statusBadge: {
            backgroundColor: '#d1fae5',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginTop: 5
        },
        statusText: {
            color: '#065f46',
            fontSize: 10,
            fontWeight: 'bold'
        },
        contentGrid: {
            flexDirection: 'row',
            gap: 15,
            marginBottom: 25
        },
        leftColumn: {
            flexDirection: 'col',
            justifyContent: 'space-between',
            gap: 3
        },
        rightColumn: {
            flexDirection: 'col',
            justifyContent: 'space-between',
            gap: 3
        },
        card: {
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0'
        },
        cardIcon: {
            fontSize: 14,
            marginRight: 8
        },
        cardTitle: {
            fontSize: 13,
            fontWeight: 'bold',
            color: '#1e293b'
        },
        cardBody: {
            paddingTop: 4
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8
        },
        infoSection: {
            marginBottom: 10
        },
        infoLabel: {
            fontSize: 10,
            color: '#64748b',
            marginBottom: 2
        },
        infoValue: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#1e293b'
        },
        statusBadgeText: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#059669'
        },
        amountCard: {
            backgroundColor: '#1e40af',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#1e3a8a',
            boxShadow: '0 4px 6px rgba(30, 64, 175, 0.2)'
        },
        amountHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15
        },
        amountTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff'
        },
        amountValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffffff'
        },
        amountBreakdown: {
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.3)',
            paddingTop: 12
        },
        breakdownRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6
        },
        breakdownLabel: {
            fontSize: 10,
            color: '#e2e8f0'
        },
        breakdownValue: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#ffffff'
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.3)'
        },
        totalLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#ffffff'
        },
        totalAmount: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#ffffff'
        },
        footer: {
            marginTop: 25,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            textAlign: 'center'
        },
        footerText: {
            fontSize: 9,
            color: '#64748b',
            marginBottom: 8,
            lineHeight: 1.4
        },
        footerNote: {
            fontSize: 8,
            color: '#94a3b8',
            marginTop: 12,
            fontStyle: 'italic'
        }
    });

    // Use PDF hook
    const [instance, updateInstance] = usePDF({ document: <ReceiptPDF /> });

    // Copy to clipboard
    const copyToClipboard = async () => {
        const receiptText = `
Transaction ID: ${payment.transactionId}
Date: ${dateInfo.full}
Type: ${payment.type}
Amount: ৳${payment.amount}
Status: Completed
        `;

        try {
            await navigator.clipboard.writeText(receiptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Handle PDF download
    const handleDownloadPDF = () => {
        if (instance.url) {
            const link = document.createElement('a');
            link.href = instance.url;
            link.download = `Payment-Receipt-${payment.transactionId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 rounded-t-2xl pt-150 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
                            <p className="text-gray-600">Transaction ID: {payment.transactionId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border hover:border-red-200"
                        title="Close"
                    >
                        <X className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    </button>
                </div>

                {/* Receipt Content */}
                <div className="p-6">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={!instance.url || instance.loading}
                            className="px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {instance.loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>


                        <button
                            onClick={copyToClipboard}
                            className={`px-4 py-2 border rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow ${copied
                                ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Details
                                </>
                            )}
                        </button>
                    </div>

                    {/* Display receipt preview - This matches the PDF design */}
                    <div id="receipt-content" className="bg-linear-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-6 border border-blue-100 shadow-inner">
                        {/* Company Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-blue-200">
                                    <Building className="w-7 h-7 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">CityFix</h1>
                                    <p className="text-gray-600 text-sm">Public Issue Reporting</p>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full border border-green-200">
                                <Shield className="w-4 h-4" />
                                <span className="font-medium text-sm">Payment Verified & Secured</span>
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="flex flex-col justify-between">
                                {/* Payment Information */}
                                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Payment Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Transaction ID:</span>
                                            <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                {payment.transactionId}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Payment Type:</span>
                                            <span className="font-bold text-gray-900">{payment.type}</span>
                                        </div>
                                        {payment.issueId &&
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 text-sm">Issue Id:</span>
                                                <span className="font-bold text-gray-900">{payment.issueId}</span>
                                            </div>
                                        }
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Payment Method:</span>
                                            <span className="font-bold text-gray-900">Credit Card</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Status:</span>
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                                                <CheckCircle className="w-3 h-3" />
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Date & Time</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Date:</span>
                                            <span className="font-bold text-gray-900">{dateInfo.full}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Time:</span>
                                            <span className="font-bold text-gray-900">{dateInfo.time}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Time Zone:</span>
                                            <span className="font-bold text-gray-900">UTC+6 (BDT)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col justify-between gap-3">
                                {/* Customer Information */}
                                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">User Id</p>
                                            <p className="font-bold text-gray-900 text-lg">{payment?.userId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">Name</p>
                                            <p className="font-bold text-gray-900 text-lg">{payment?.userName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm mb-1">Email</p>
                                            <p className="font-bold text-gray-900">{payment.customerEmail || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Paid */}
                                <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl p-6 shadow-lg border border-blue-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">Amount Paid</h3>
                                        <span className="text-3xl font-bold text-white">৳{payment.amount}</span>
                                    </div>
                                    <div className="pt-4 border-t border-blue-500/30">
                                        <div className="flex justify-between text-blue-100 mb-2">
                                            <span className="text-sm">Subtotal</span>
                                            <span className="text-sm">৳{payment.amount}</span>
                                        </div>
                                        <div className="flex justify-between text-blue-100 mb-2">
                                            <span className="text-sm">Tax (0%)</span>
                                            <span className="text-sm">৳0.00</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-blue-500/30">
                                            <span className="text-white">TOTAL</span>
                                            <span className="text-white">৳{payment.amount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="mt-8 pt-6 border-t border-gray-300">
                            <div className="text-center text-gray-600 text-sm">
                                <p className="mb-2">
                                    This receipt serves as an official record of your payment. Please keep it for your records.
                                </p>
                                <p>
                                    For any questions regarding this payment, contact our support team at
                                    <span className="font-medium text-blue-600"> support@cityfix.com</span> or call
                                    <span className="font-medium text-blue-600"> +8801712349876</span>.
                                </p>
                                <p className="mt-4 text-xs text-gray-500 italic">
                                    This is an official digital receipt. No physical copy will be mailed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm">
                            Need help? Contact support: support@cityfix.com | +8801712349876
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={!instance.url || instance.loading}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                                {instance.loading ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReceiptModal;