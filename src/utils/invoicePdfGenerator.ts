import { jsPDF } from 'jspdf';

export interface InvoiceData {
  id: string;
  orderNumber?: string;
  serviceName: string;
  date: string;
  time?: string;
  amount: string;
  numericAmount?: number;
  status: 'Paid' | 'Completed' | 'Pending';
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAddress?: string;
  doctorOrSpecialist?: string;
  paymentMethod?: string;
  gstNumber?: string;
}

/**
 * Generates an official, lightweight Nhealth tax invoice / booking receipt PDF
 * directly on the client browser using jsPDF.
 */
export function generateInvoicePDF(invoice: InvoiceData, autoDownload = true): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let curY = 16;

  // 1. SUBTLE OFFICIAL "Nhealth" WATERMARK (Bottom Canvas Layer)
  doc.saveGraphicsState();
  try {
    const GStateClass = (doc as any).GState;
    if (typeof GStateClass === 'function') {
      doc.setGState(new GStateClass({ opacity: 0.08 }));
    }
  } catch (err) {
    console.warn('Watermark GState unavailable, fallback opacity:', err);
  }
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(56);
  doc.text('Nhealth', 42, 115, { angle: 32 });
  doc.text('Nhealth', 78, 205, { angle: 32 });
  doc.restoreGraphicsState();

  // 2. TOP HEADER BRANDING BAR (Dark Blue Nhealth theme: #002b49)
  doc.setFillColor(0, 43, 73);
  doc.roundedRect(margin, curY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Nhealth', margin + 6, curY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(153, 246, 228); // Teal accent
  doc.text('Unified & At-Home Healthcare Network · Official Tax Invoice', margin + 6, curY + 18);

  // Right Side Header Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE / RECEIPT', pageWidth - margin - 6, curY + 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Ref: ${invoice.id}`, pageWidth - margin - 6, curY + 16, { align: 'right' });

  curY += 30;

  // 2. INVOICE META & PATIENT DETAILS (2-Column Grid)
  const colWidth = (contentWidth - 6) / 2;

  // Left Column: Bill To / Patient
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, colWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 43, 73);
  doc.text('PATIENT / RECIPIENT DETAILS', margin + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${invoice.patientName}`, margin + 4, curY + 13);
  doc.text(`Phone: ${invoice.patientPhone}`, margin + 4, curY + 19);
  if (invoice.patientEmail) {
    doc.text(`Email: ${invoice.patientEmail}`, margin + 4, curY + 25);
  }
  const addr = invoice.patientAddress || 'Doorstep Service, Hyderabad, Telangana';
  const splitAddr = doc.splitTextToSize(`Address: ${addr}`, colWidth - 8);
  doc.text(splitAddr, margin + 4, curY + 31);

  // Right Column: Invoice & Service Meta
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightColX, curY, colWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 43, 73);
  doc.text('INVOICE & ORDER SUMMARY', rightColX + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Invoice No: ${invoice.id}`, rightColX + 4, curY + 13);
  doc.text(`Service Date: ${invoice.date}`, rightColX + 4, curY + 19);
  doc.text(`Payment Status: ${invoice.status.toUpperCase()}`, rightColX + 4, curY + 25);
  doc.text(`Payment Mode: ${invoice.paymentMethod || 'Online Prepaid (UPI/Card)'}`, rightColX + 4, curY + 31);

  curY += 44;

  // 3. TABLE OF CHARGES / SERVICES
  doc.setFillColor(0, 128, 128); // Nhealth Teal header
  doc.roundedRect(margin, curY, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM DESCRIPTION', margin + 4, curY + 5.5);
  doc.text('QTY', margin + 110, curY + 5.5, { align: 'center' });
  doc.text('RATE', margin + 135, curY + 5.5, { align: 'right' });
  doc.text('AMOUNT (INR)', pageWidth - margin - 4, curY + 5.5, { align: 'right' });

  curY += 9;

  // Row 1: Primary Service
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, curY, contentWidth, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.serviceName, margin + 4, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    invoice.doctorOrSpecialist
      ? `Provider: ${invoice.doctorOrSpecialist} · Certified Doorstep Healthcare`
      : 'Doorstep Healthcare Service · Barcoded sterile kit & certified clinician visit',
    margin + 4,
    curY + 10.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1', margin + 110, curY + 7, { align: 'center' });
  doc.text(invoice.amount, margin + 135, curY + 7, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.amount, pageWidth - margin - 4, curY + 7, { align: 'right' });

  curY += 16;

  // Row 2: Doorstep Convenience & Safety Kit
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, curY, contentWidth, 10, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Doorstep Convenience, Sterilization & Medical Disposal', margin + 4, curY + 6);
  doc.text('1', margin + 110, curY + 6, { align: 'center' });
  doc.text('₹0', margin + 135, curY + 6, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('FREE', pageWidth - margin - 4, curY + 6, { align: 'right' });

  curY += 13;

  // 4. TOTALS CALCULATION BOX
  const totalBoxWidth = 75;
  const totalBoxX = pageWidth - margin - totalBoxWidth;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalBoxX, curY, totalBoxWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalBoxX + 4, curY + 6);
  doc.text(invoice.amount, totalBoxX + totalBoxWidth - 4, curY + 6, { align: 'right' });

  doc.text('Applicable GST (0% Health):', totalBoxX + 4, curY + 12);
  doc.text('₹0.00', totalBoxX + totalBoxWidth - 4, curY + 12, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(totalBoxX + 4, curY + 16, totalBoxX + totalBoxWidth - 4, curY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 43, 73);
  doc.text('Total Paid:', totalBoxX + 4, curY + 23);
  doc.text(invoice.amount, totalBoxX + totalBoxWidth - 4, curY + 23, { align: 'right' });

  // Left Note Box: Digital Verified Seal
  const noteBoxWidth = contentWidth - totalBoxWidth - 6;
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(153, 246, 228);
  doc.roundedRect(margin, curY, noteBoxWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('✓ DIGITAL VERIFIED TRANSACTION', margin + 4, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('This is an authenticated electronic tax receipt generated by', margin + 4, curY + 14);
  doc.text('Nhealth Unified Healthcare At-Home Network Platform.', margin + 4, curY + 19);
  doc.text('For queries or insurance claims, mention Invoice Ref ID.', margin + 4, curY + 24);

  curY += 34;

  // 5. OFFICIAL MEDICAL & LEGAL TERMS
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, curY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(133, 77, 14);
  doc.text('NHEALTH CARE ASSURANCE & EMERGENCY POLICIES', margin + 4, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 63, 18);
  doc.text(
    'All home visits are conducted by background-verified clinicians following sterile ICMR protocols.',
    margin + 4,
    curY + 10.5
  );
  doc.text(
    'In case of emergency clinical escalation, call our 24/7 Rapid Ambulance Care line: +91 9581582220.',
    margin + 4,
    curY + 14.5
  );

  // 6. FOOTER
  const footerY = 278;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Nhealth Technologies Private Limited · Hyderabad & Secunderabad, Telangana',
    margin,
    footerY + 5
  );
  doc.text(
    '24/7 Helpline: 9393934621  |  Email: support@nhealth.in  |  Web: www.nhealth.in',
    margin,
    footerY + 9.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 128, 128);
  doc.text('Page 1 of 1', pageWidth - margin - 18, footerY + 7);

  if (autoDownload) {
    const safeRef = invoice.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Nhealth_Invoice_${safeRef}.pdf`);
  }

  return doc;
}
