import { ConsultationSession } from '../types/consultationBooking';

export interface WhatsAppReceiptPayload {
  recipientPhone: string;
  formattedMessage: string;
  whatsappUrl: string;
  deepLinkAppUrl: string;
  webFallbackUrl: string;
}

export const generateConsultationDeepLinks = (sessionId: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nhealth.in';
  return {
    deepLinkAppUrl: `nhealth://consultation/${sessionId}`,
    webFallbackUrl: `${origin}/?session=${sessionId}&mode=video`,
  };
};

export const buildWhatsAppConfirmation = (
  session: ConsultationSession
): WhatsAppReceiptPayload => {
  const { deepLinkAppUrl, webFallbackUrl } = generateConsultationDeepLinks(session.sessionId);
  const cleanPhone = session.patientPhone.replace(/\D/g, '');
  const recipientPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const msg = [
    `*NHEALTH HEALTHCARE - CONSULTATION CONFIRMATION & RECEIPT* 🏥`,
    `----------------------------------------`,
    `Dear *${session.patientName}*, your tele-consultation is confirmed!`,
    ``,
    `📋 *Booking Reference:* ${session.referenceId}`,
    `💳 *Payment Receipt:* ${session.paymentTxnId || 'PAID'} (₹${session.finalAmount})`,
    `👨‍⚕️ *Doctor:* Dr. ${session.doctor.name} (${session.doctor.specialization})`,
    `🏥 *Hospital:* ${session.doctor.hospitalAffiliation || 'Nhealth Clinical Network'}`,
    `⏰ *Schedule:* ${session.mode === 'Immediate Connect' ? '⚡ Immediate Connect (Active Now)' : `${session.scheduledDate} @ ${session.scheduledSlot}`}`,
    session.symptoms ? `🩺 *Reported Symptoms:* ${session.symptoms}` : '',
    session.vitals ? `💓 *Attached Vitals:* HR: ${session.vitals.heartRate} BPM | SpO2: ${session.vitals.oxygenSaturation}% | BP: ${session.vitals.bloodPressure}` : '',
    ``,
    `🔐 *End-to-End Encrypted Video Call Link:*`,
    `📱 *Open in Nhealth App:* ${deepLinkAppUrl}`,
    `🌐 *Open in Browser:* ${webFallbackUrl}`,
    ``,
    `----------------------------------------`,
    `_Note: Clicking the link opens Nhealth Mobile App directly if installed, otherwise opens your web browser portal._`,
    `Need emergency help? Call Nhealth SOS: 1800-419-8800.`,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(msg)}`;

  return {
    recipientPhone,
    formattedMessage: msg,
    whatsappUrl,
    deepLinkAppUrl,
    webFallbackUrl,
  };
};

export const triggerDeepLinkRedirection = (sessionId: string) => {
  const { deepLinkAppUrl, webFallbackUrl } = generateConsultationDeepLinks(sessionId);

  // Attempt custom protocol scheme (opens native app if registered)
  const now = Date.now();
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = deepLinkAppUrl;
  document.body.appendChild(iframe);

  // Fallback to web portal if native app doesn't take focus within 1.5s
  setTimeout(() => {
    document.body.removeChild(iframe);
    if (Date.now() - now < 2000) {
      window.location.href = webFallbackUrl;
    }
  }, 1200);
};
