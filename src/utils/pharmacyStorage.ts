import { jsPDF } from 'jspdf';
import { PharmacyOrder } from '../types/pharmacy';
import { TRENDING_MEDICINES } from '../data/pharmacyData';

const PHARMACY_ORDERS_KEY = 'nhealth_pharmacy_orders';

export const INITIAL_PHARMACY_ORDERS: PharmacyOrder[] = [
  {
    id: 'ORD-782194',
    orderNumber: 'NH-PHARM-2026-8910',
    date: 'Today',
    time: '11:45 AM',
    items: [
      { product: TRENDING_MEDICINES[0], quantity: 2 }, // Dolo 650
      { product: TRENDING_MEDICINES[1], quantity: 1 }, // Pan-D
      { product: TRENDING_MEDICINES[6], quantity: 1 }, // Becosules Z
    ],
    subtotal: 281,
    deliveryFee: 49,
    discount: 0,
    grandTotal: 330,
    patientName: 'Ramesh Kumar',
    patientPhone: '+91 98765 43210',
    deliveryAddress: 'Flat 402, Sai Residency, Road No. 12, Banjara Hills, Hyderabad - 500034',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    deliveryStatus: 'Out for Delivery',
    deliveryPartnerName: 'Suresh Kumar (Rider ID: NH-982)',
    deliveryPartnerPhone: '+91 91234 56789',
    deliveryOtp: '4821',
    etaMinutes: 18,
    invoiceNumber: 'INV-NH-2026-7892',
    temperaturePreserved: true,
  },
  {
    id: 'ORD-654812',
    orderNumber: 'NH-PHARM-2026-6548',
    date: 'Yesterday',
    time: '04:15 PM',
    items: [
      { product: TRENDING_MEDICINES[2], quantity: 2 }, // Glycomet 500
      { product: TRENDING_MEDICINES[3], quantity: 1 }, // Telma 40
    ],
    subtotal: 331,
    deliveryFee: 49,
    discount: 30,
    grandTotal: 350,
    patientName: 'Ramesh Kumar',
    patientPhone: '+91 98765 43210',
    deliveryAddress: 'Flat 402, Sai Residency, Road No. 12, Banjara Hills, Hyderabad - 500034',
    paymentMethod: 'Cards',
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    deliveryPartnerName: 'Vikram Singh',
    deliveryPartnerPhone: '+91 98888 77777',
    deliveryOtp: '1904',
    etaMinutes: 0,
    invoiceNumber: 'INV-NH-2026-6548',
    temperaturePreserved: true,
  },
];

export function getStoredPharmacyOrders(): PharmacyOrder[] {
  try {
    const raw = localStorage.getItem(PHARMACY_ORDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading pharmacy orders', err);
  }
  return INITIAL_PHARMACY_ORDERS;
}

export function savePharmacyOrder(newOrder: PharmacyOrder): PharmacyOrder[] {
  try {
    const existing = getStoredPharmacyOrders();
    const updated = [newOrder, ...existing];
    localStorage.setItem(PHARMACY_ORDERS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed saving pharmacy order', err);
    return [newOrder];
  }
}

/**
 * Generates an official, printable itemized Nhealth Pharmacy Tax Invoice PDF.
 */
export function generatePharmacyInvoicePDF(order: PharmacyOrder): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let curY = 16;

  // 1. Watermark
  doc.saveGraphicsState();
  try {
    const GStateClass = (doc as any).GState;
    if (typeof GStateClass === 'function') {
      doc.setGState(new GStateClass({ opacity: 0.07 }));
    }
  } catch {}
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(48);
  doc.text('Nhealth Pharmacy', 30, 120, { angle: 30 });
  doc.text('Certified Genuine', 40, 210, { angle: 30 });
  doc.restoreGraphicsState();

  // 2. Header Bar
  doc.setFillColor(0, 43, 73);
  doc.roundedRect(margin, curY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Nhealth™ Pharmacy', margin + 6, curY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(153, 246, 228);
  doc.text('Official Retail Tax Invoice & Delivery Voucher · DL: TS-HYD-2026-PH88', margin + 6, curY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('PHARMACY TAX INVOICE', pageWidth - margin - 6, curY + 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Inv: ${order.invoiceNumber}`, pageWidth - margin - 6, curY + 16, { align: 'right' });

  curY += 30;

  // 3. Customer & Order Info
  const colW = (contentWidth - 6) / 2;

  // Left: Bill To
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, colW, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 43, 73);
  doc.text('DELIVERY TO / PATIENT', margin + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Patient: ${order.patientName}`, margin + 4, curY + 13);
  doc.text(`Contact: ${order.patientPhone}`, margin + 4, curY + 19);
  const splitAddr = doc.splitTextToSize(`Address: ${order.deliveryAddress}`, colW - 8);
  doc.text(splitAddr, margin + 4, curY + 25);

  // Right: Order Details
  const rightX = margin + colW + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, curY, colW, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 43, 73);
  doc.text('ORDER & PAYMENT SUMMARY', rightX + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Order ID: ${order.orderNumber}`, rightX + 4, curY + 13);
  doc.text(`Order Date: ${order.date} ${order.time}`, rightX + 4, curY + 19);
  doc.text(`Payment Mode: ${order.paymentMethod}`, rightX + 4, curY + 25);
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, rightX + 4, curY + 31);

  curY += 42;

  // 4. Items Table
  doc.setFillColor(0, 128, 128);
  doc.roundedRect(margin, curY, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('MEDICINE / PRODUCT (BRAND & PACK)', margin + 4, curY + 5.5);
  doc.text('QTY', margin + 110, curY + 5.5, { align: 'center' });
  doc.text('PRICE', margin + 138, curY + 5.5, { align: 'right' });
  doc.text('TOTAL (INR)', pageWidth - margin - 4, curY + 5.5, { align: 'right' });

  curY += 10;

  order.items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    if (isAlt) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, curY - 2, contentWidth, 9, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. ${item.product.name}`, margin + 4, curY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`(${item.product.packSize} - ${item.product.manufacturer})`, margin + 4, curY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${item.quantity}`, margin + 110, curY + 4, { align: 'center' });
    doc.text(`₹${item.product.price}`, margin + 138, curY + 4, { align: 'right' });
    doc.text(`₹${item.product.price * item.quantity}`, pageWidth - margin - 4, curY + 4, { align: 'right' });

    curY += 10;
  });

  // Table Totals
  curY += 2;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, curY, pageWidth - margin, curY);
  curY += 6;

  const totalBlockX = pageWidth - margin - 70;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalBlockX, curY);
  doc.text(`₹${order.subtotal}`, pageWidth - margin - 4, curY, { align: 'right' });

  curY += 5;
  doc.text('Express Doorstep Delivery:', totalBlockX, curY);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`, pageWidth - margin - 4, curY, { align: 'right' });

  if (order.discount > 0) {
    curY += 5;
    doc.text('Discount / Offer:', totalBlockX, curY);
    doc.text(`- ₹${order.discount}`, pageWidth - margin - 4, curY, { align: 'right' });
  }

  curY += 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(totalBlockX - 4, curY - 3, 74, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 43, 73);
  doc.text('Grand Total:', totalBlockX, curY + 3.5);
  doc.text(`₹${order.grandTotal}`, pageWidth - margin - 4, curY + 3.5, { align: 'right' });

  // Verification & Pharmacist Signature Box
  curY += 16;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, curY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 128, 128);
  doc.text('REGISTERED PHARMACIST VERIFICATION', margin + 4, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('All drugs dispensed are inspected for valid batch, expiry date, and intact tamper seals in temperature-safe packaging.', margin + 4, curY + 10);
  doc.text(`Dispatched by: Nhealth Central Hub · Temperature Maintained: 18°C–25°C`, margin + 4, curY + 15);
  doc.text('Authorized Signatory: Dr. K. Mohan, B.Pharm, Reg No. TS-49021', pageWidth - margin - 4, curY + 19, { align: 'right' });

  // Download trigger
  doc.save(`${order.orderNumber}-Invoice.pdf`);
  return doc;
}
