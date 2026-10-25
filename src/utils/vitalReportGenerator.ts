import { jsPDF } from 'jspdf';
import { VitalLensUserData, VitalMetricsResult } from '../types/vitalLens';

const NHEALTH_LOGO_URL = 'https://i.ibb.co/6JR2bwmJ/whatsapp-profile-pic.jpg';

/**
 * Loads an image from URL and converts to base64 DataURL for jsPDF.
 */
async function getBase64ImageFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Unable to load external logo for PDF, using fallback vector branding:', err);
    return null;
  }
}

/**
 * Formats a given timestamp into exact standard ISO date-time (YYYY-MM-DD HH:mm:ss)
 * and localized date string.
 */
function formatExactTestTimestamp(isoOrDateStr?: string): {
  isoDateTime: string; // YYYY-MM-DD HH:mm:ss
  localizedDate: string;
  localizedTime: string;
  fullLocale: string;
} {
  const date = isoOrDateStr ? new Date(isoOrDateStr) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const day = String(validDate.getDate()).padStart(2, '0');
  const hours = String(validDate.getHours()).padStart(2, '0');
  const minutes = String(validDate.getMinutes()).padStart(2, '0');
  const seconds = String(validDate.getSeconds()).padStart(2, '0');

  const isoDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const localizedDate = validDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const localizedTime = validDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const fullLocale = validDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return { isoDateTime, localizedDate, localizedTime, fullLocale };
}

/**
 * Renders the subtle "NHealth" watermark on the BOTTOM canvas layer BEFORE rendering any cards,
 * tables, headers, or text, with low opacity (0.08 - 0.12).
 * All subsequent metric cards and tables are drawn on top with opaque solid fills,
 * guaranteeing the watermark NEVER overlaps or obscures any numbers or text.
 */
function drawBottomLayerWatermark(doc: jsPDF) {
  doc.saveGraphicsState();

  try {
    // Set subtle opacity to 0.08 so watermark remains readable without obscuring underlying text or data
    const GStateClass = (doc as any).GState;
    if (typeof GStateClass === 'function') {
      doc.setGState(new GStateClass({ opacity: 0.08 }));
    }
  } catch (err) {
    console.warn('GState opacity not available, using faint color tint:', err);
  }

  // Faint slate-blue color tint
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(54);

  // Diagonal watermark placement on bottom layer
  doc.text('Nhealth', 40, 105, { angle: 32 });
  doc.text('Nhealth', 80, 195, { angle: 32 });
  doc.text('Nhealth', 120, 275, { angle: 32 });

  doc.restoreGraphicsState();
}

/**
 * Generates and triggers the downloadable Nhealth Vital Lens PDF Report.
 * Strict specifications:
 * 1. Exact test timestamp (YYYY-MM-DD HH:mm:ss and Date.toLocaleString()).
 * 2. Bottom canvas layer watermark with low opacity (0.08 - 0.12) that never obscures result text or numbers.
 */
export async function generateVitalLensPDF(
  results: VitalMetricsResult,
  userData: VitalLensUserData,
  autoDownload: boolean = true
): Promise<jsPDF> {
  // Initialize standard A4 PDF (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Compute exact test timestamp
  const { isoDateTime, localizedDate, localizedTime, fullLocale } = formatExactTestTimestamp(results.scanTimestamp);

  // =========================================================================
  // REQUIREMENT 2: WATERMARK OVERLAP FIX
  // Render "NHealth" watermark on the BOTTOM canvas layer FIRST before any text/tables
  // with opacity ~0.09. All subsequent cards are drawn with solid fills on top.
  // =========================================================================
  drawBottomLayerWatermark(doc);

  // Fetch logo base64
  const logoBase64 = await getBase64ImageFromUrl(NHEALTH_LOGO_URL);

  // 1. Top Decorative Brand Accent Bar
  doc.setFillColor(0, 128, 128); // Teal #008080
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(0, 43, 73); // Deep Navy #002b49
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // 2. Header Section
  let curY = 13.5;
  const logoSize = 18;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', margin, curY, logoSize, logoSize);
    } catch {
      // Fallback vector logo badge if addImage fails
      doc.setFillColor(0, 43, 73);
      doc.roundedRect(margin, curY, logoSize, logoSize, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('NHealth', margin + 2, curY + 11);
    }
  } else {
    doc.setFillColor(0, 43, 73);
    doc.roundedRect(margin, curY, logoSize, logoSize, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NHealth', margin + 2, curY + 11);
  }

  // Brand Name & Document Title
  const titleX = margin + logoSize + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 43, 73); // Deep navy
  doc.text('Nhealth Vital Lens™', titleX, curY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 128, 128); // Teal
  doc.text('AI Contactless Biometric & Preventive Vitals Report', titleX, curY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Test Timestamp: ${isoDateTime} (${localizedTime})`, titleX, curY + 15);

  // Header Contact Information Box (Top-Right)
  const contactBoxWidth = 64;
  const contactBoxX = pageWidth - margin - contactBoxWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(contactBoxX, curY - 1, contactBoxWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 43, 73);
  doc.text('NHEALTH SUPPORT & HELPLINE', contactBoxX + 3, curY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Phone: 9393934621', contactBoxX + 3, curY + 9);
  doc.text('Email: support@nhealth.in', contactBoxX + 3, curY + 13.5);
  doc.text('Web: https://nhealth.in', contactBoxX + 3, curY + 17.5);

  curY += 23.5;

  // 3. Patient Details & EXACT Test Timestamp Bar
  // Fully opaque solid fill so background watermark never shows behind critical patient text
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, curY, contentWidth, 23, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 50;
  const col3X = margin + 98;
  const col4X = margin + 138;

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT NAME', col1X, curY + 5);
  doc.text('CONTACT NO.', col2X, curY + 5);
  doc.text('DEMOGRAPHICS', col3X, curY + 5);
  doc.text('EXACT TEST TIMESTAMP', col4X, curY + 5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(userData.fullName || 'Guest Patient', col1X, curY + 10.5);
  doc.text(userData.mobileNumber || 'Not Provided', col2X, curY + 10.5);
  doc.text(`${userData.age} Yrs / ${userData.gender}`, col3X, curY + 10.5);
  
  // EXACT TEST TIMESTAMP (YYYY-MM-DD HH:mm:ss)
  doc.setFontSize(8.5);
  doc.setTextColor(0, 43, 73);
  doc.text(isoDateTime, col4X, curY + 10.5);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`PIN: ${userData.pincode || 'N/A'}`, col1X, curY + 16.5);
  doc.text(`Height: ${userData.heightCm} cm • Weight: ${userData.weightKg} kg`, col2X, curY + 16.5);
  doc.text(`BMI: ${results.bmi} (${results.bmiStatus})`, col3X, curY + 16.5);
  doc.text(`Local: ${localizedDate} ${localizedTime}`, col4X, curY + 16.5);

  curY += 27.5;

  // Helper for Section Titles
  const drawSectionHeader = (title: string, yPos: number, accentColor: [number, number, number] = [0, 128, 128]) => {
    doc.setFillColor(...accentColor);
    doc.rect(margin, yPos, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 43, 73);
    doc.text(title, margin + 5, yPos + 4.8);

    // Thin horizontal rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin + 5 + doc.getTextWidth(title) + 4, yPos + 3.5, pageWidth - margin, yPos + 3.5);
  };

  // Helper for rendering 4-column metric cards with solid opaque fill
  // Solid fill guarantees all numbers and text remain 100% visible and readable
  const renderMetricCards = (
    yStart: number,
    cards: Array<{ label: string; value: string; subtext: string; highlight?: boolean }>
  ) => {
    const cardGap = 3;
    const cardWidth = (contentWidth - cardGap * (cards.length - 1)) / cards.length;
    const cardHeight = 19;

    cards.forEach((card, index) => {
      const cardX = margin + index * (cardWidth + cardGap);

      // Card background: Solid opaque fill
      if (card.highlight) {
        doc.setFillColor(240, 253, 250); // Light teal solid fill
        doc.setDrawColor(153, 246, 228);
      } else {
        doc.setFillColor(248, 250, 252); // Off-white solid fill
        doc.setDrawColor(226, 232, 240);
      }
      doc.roundedRect(cardX, yStart, cardWidth, cardHeight, 1.8, 1.8, 'FD');

      // Metric label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label.toUpperCase(), cardX + 3, yStart + 4.5);

      // Metric value (100% crisp & unobstructed)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(card.highlight ? 13 : 15, card.highlight ? 148 : 23, card.highlight ? 136 : 42);
      doc.text(card.value, cardX + 3, yStart + 11.5);

      // Subtext
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(card.subtext, cardX + 3, yStart + 16);
    });

    return yStart + cardHeight + 4;
  };

  // SECTION 1: KEY BIOMETRIC VITALS
  drawSectionHeader('1. KEY BIOMETRIC VITALS (FACIAL vPPG EXTRACTION)', curY);
  curY += 8;

  curY = renderMetricCards(curY, [
    {
      label: 'Heart Rate',
      value: `${results.heartRate} BPM`,
      subtext: 'Normal: 60 - 100 BPM',
      highlight: true,
    },
    {
      label: 'Blood Oxygen (SpO2)',
      value: `${results.oxygenSaturation}%`,
      subtext: 'Optimal: 95% - 100%',
      highlight: true,
    },
    {
      label: 'Blood Pressure',
      value: `${results.bloodPressureSystolic}/${results.bloodPressureDiastolic}`,
      subtext: 'Target: <120/<80 mmHg',
      highlight: true,
    },
    {
      label: 'Respiration Rate',
      value: `${results.respirationRate} RPM`,
      subtext: 'Normal: 12 - 20 RPM',
      highlight: true,
    },
  ]);

  // SECTION 2: HEART HEALTH & HEMODYNAMICS
  drawSectionHeader('2. CARDIAC AUTONOMIC & HEMODYNAMIC INDICATORS', curY);
  curY += 8;

  curY = renderMetricCards(curY, [
    {
      label: 'HRV (SDNN)',
      value: `${results.sdnn} ms`,
      subtext: 'Autonomic Flexibility',
    },
    {
      label: 'HRV (RMSSD)',
      value: `${results.rmssd} ms`,
      subtext: 'Vagal Tone Index',
    },
    {
      label: 'Cardiac Output',
      value: `${results.cardiacOutput} L/min`,
      subtext: 'Resting Blood Flow',
    },
    {
      label: 'Mean Arterial (MAP)',
      value: `${results.meanArterialPressure} mmHg`,
      subtext: 'Target: 70 - 100 mmHg',
    },
  ]);

  // SECTION 3: MENTAL WELLBEING & STRESS PROFILE
  drawSectionHeader('3. MENTAL WELLBEING & AUTONOMIC (ANS) BALANCE', curY);
  curY += 8;

  curY = renderMetricCards(curY, [
    {
      label: 'Wellbeing Score',
      value: `${results.mentalWellbeingScore} / 100`,
      subtext: 'Cumulative Wellness',
      highlight: true,
    },
    {
      label: 'Stress Classification',
      value: results.stressLevel,
      subtext: 'Baevsky Stress Formula',
    },
    {
      label: 'ANS Status',
      value: results.ansStatus,
      subtext: `Balance Ratio: ${results.ansBalanceRatio}`,
    },
    {
      label: 'Heart Utilized',
      value: `${results.heartUtilized}%`,
      subtext: 'Resting Cardiac Reserve',
    },
  ]);

  // SECTION 4: PHYSIOLOGICAL & BODY COMPOSITION
  drawSectionHeader('4. PHYSIOLOGICAL & BODY COMPOSITION METRICS', curY);
  curY += 8;

  curY = renderMetricCards(curY, [
    {
      label: 'Body Mass Index',
      value: `${results.bmi}`,
      subtext: `Status: ${results.bmiStatus}`,
    },
    {
      label: 'Total Blood Volume',
      value: `${results.bloodVolumeLiters} L`,
      subtext: 'Nadler Equation',
    },
    {
      label: 'Body Water %',
      value: `${results.bodyWaterPercentage}%`,
      subtext: `Total: ${results.totalBloodWaterLiters} L`,
    },
    {
      label: 'Body Fat %',
      value: `${results.totalBodyFatPercentage}%`,
      subtext: 'Deurenberg Formula',
    },
  ]);

  curY += 2;

  // 5. PATIENT INSTRUCTIONS BOX (Opaque solid fill)
  doc.setFillColor(240, 249, 255); // Light sky blue solid fill
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, curY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text('PATIENT INSTRUCTIONS', margin + 4, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const patientInstructions = 'Rest well, maintain hydration, and track your vital trends regularly.';
  doc.text(patientInstructions, margin + 4, curY + 11.5);

  curY += 21.5;

  // 6. IMPORTANT NOTE / DISCLAIMER BOX (Opaque solid fill)
  doc.setFillColor(254, 242, 242); // Light red/rose solid fill
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, curY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text('IMPORTANT NOTE & MEDICAL DISCLAIMER', margin + 4, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(69, 10, 10);
  const disclaimerText =
    'Disclaimer: This report is for general wellness reference only and does not replace professional medical advice. Consult a healthcare provider for clinical evaluation.';

  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  doc.text(splitDisclaimer, margin + 4, curY + 11);

  // 7. FOOTER BAR WITH EXACT TIMESTAMP & CONTACT DETAILS
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Test Date & Time: ${isoDateTime} (${fullLocale}) • Nhealth Unified Healthcare Network`,
    margin,
    footerY + 4.5
  );
  doc.text(
    'Phone: 9393934621  |  Email: support@nhealth.in  |  Website: www.nhealth.in',
    margin,
    footerY + 8.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 128, 128);
  doc.text('Page 1 of 1', pageWidth - margin - 16, footerY + 6);

  // 8. Auto-trigger download if enabled
  if (autoDownload) {
    const safeName = (userData.fullName || 'Patient').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTime = isoDateTime.replace(/[: -]/g, '_');
    const filename = `Nhealth_VitalLens_Report_${safeName}_${safeTime}.pdf`;
    doc.save(filename);
  }

  return doc;
}
