import { ConfirmedBooking } from '../types/serviceBooking';
import { VitalMetricsResult, VitalLensUserData } from '../types/vitalLens';
import { InvoiceData } from './invoicePdfGenerator';

export interface CompactVitalScan {
  id: string;
  scanTimestamp: string;
  date: string;
  time: string;
  userId: string;
  mode: 'Logged-in' | 'Guest';
  status: string;
  heartRate: number;
  respirationRate: number;
  oxygenSaturation: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  sdnn: number;
  stressLevel: string;
  mentalWellbeingScore: number;
  bmi: number;
  fullName: string;
  mobileNumber: string;
  age: number;
  gender: string;
}

const STORAGE_KEY_VITALS = 'nhealth_compact_vital_scans';
const STORAGE_KEY_INVOICES = 'nhealth_patient_invoices';
const STORAGE_KEY_BOOKINGS = 'nhealth_bookings';
const STORAGE_KEY_GUEST_BOOKINGS = 'nhealth_guest_bookings';

const DEFAULT_VITALS: CompactVitalScan[] = [
  {
    id: 'VIT-2026-9812',
    scanTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    date: 'Today',
    time: '08:30 AM',
    userId: 'USR-9876543210',
    mode: 'Logged-in',
    status: 'Completed (Optimal - HR: 72 BPM, SpO2: 98%, HRV: 58 ms)',
    heartRate: 72,
    respirationRate: 16,
    oxygenSaturation: 98,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    sdnn: 58,
    stressLevel: 'Low / Relaxed',
    mentalWellbeingScore: 92,
    bmi: 22.4,
    fullName: 'Ramesh Kumar',
    mobileNumber: '9876543210',
    age: 38,
    gender: 'Male',
  },
  {
    id: 'VIT-2026-9654',
    scanTimestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    date: 'Yesterday',
    time: '07:15 PM',
    userId: 'GUEST-814902',
    mode: 'Guest',
    status: 'Completed (Normal - HR: 78 BPM, SpO2: 99%, HRV: 52 ms)',
    heartRate: 78,
    respirationRate: 18,
    oxygenSaturation: 99,
    bloodPressureSystolic: 122,
    bloodPressureDiastolic: 82,
    sdnn: 52,
    stressLevel: 'Moderate / Normal',
    mentalWellbeingScore: 86,
    bmi: 23.1,
    fullName: 'Pooja Deshmukh',
    mobileNumber: '9822334455',
    age: 29,
    gender: 'Female',
  },
  {
    id: 'VIT-2026-9430',
    scanTimestamp: new Date(Date.now() - 3600000 * 42).toISOString(),
    date: '19 Oct 2026',
    time: '09:00 AM',
    userId: 'USR-9876543210',
    mode: 'Logged-in',
    status: 'Completed (Optimal - HR: 74 BPM, SpO2: 97%, HRV: 55 ms)',
    heartRate: 74,
    respirationRate: 17,
    oxygenSaturation: 97,
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 78,
    sdnn: 55,
    stressLevel: 'Low / Relaxed',
    mentalWellbeingScore: 90,
    bmi: 22.4,
    fullName: 'Ramesh Kumar',
    mobileNumber: '9876543210',
    age: 38,
    gender: 'Male',
  },
  {
    id: 'VIT-2026-9210',
    scanTimestamp: new Date(Date.now() - 3600000 * 68).toISOString(),
    date: '18 Oct 2026',
    time: '02:45 PM',
    userId: 'GUEST-772390',
    mode: 'Guest',
    status: 'Completed (Mild Stress - HR: 84 BPM, SpO2: 98%, HRV: 44 ms)',
    heartRate: 84,
    respirationRate: 19,
    oxygenSaturation: 98,
    bloodPressureSystolic: 126,
    bloodPressureDiastolic: 84,
    sdnn: 44,
    stressLevel: 'Elevated / Active',
    mentalWellbeingScore: 78,
    bmi: 24.2,
    fullName: 'Aditya Varma',
    mobileNumber: '9988776655',
    age: 42,
    gender: 'Male',
  },
];

const DEFAULT_INVOICES: InvoiceData[] = [
  {
    id: 'INV-2026-9041',
    orderNumber: 'ORD-7712',
    serviceName: 'Comprehensive Full Body Diagnostic Screening (72 Tests)',
    date: '18 Oct 2026',
    time: '10:15 AM',
    amount: '₹999',
    numericAmount: 999,
    status: 'Paid',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    patientEmail: 'ramesh.kumar@gmail.com',
    patientAddress: 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad',
    doctorOrSpecialist: 'NABL Certified Diagnostic Partner',
    paymentMethod: 'UPI (Google Pay)',
  },
  {
    id: 'INV-2026-8812',
    orderNumber: 'ORD-6549',
    serviceName: 'Senior Physician Consultation Home Visit',
    date: '05 Oct 2026',
    time: '04:30 PM',
    amount: '₹750',
    numericAmount: 750,
    status: 'Paid',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    patientEmail: 'ramesh.kumar@gmail.com',
    patientAddress: 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad',
    doctorOrSpecialist: 'Dr. Srinivas Rao, MD (Internal Medicine)',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'INV-2026-7649',
    orderNumber: 'ORD-5231',
    serviceName: 'Doorstep Prescription Delivery & Vital Check',
    date: '22 Sep 2026',
    time: '11:00 AM',
    amount: '₹420',
    numericAmount: 420,
    status: 'Paid',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    patientEmail: 'ramesh.kumar@gmail.com',
    patientAddress: 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad',
    doctorOrSpecialist: 'Nhealth Pharmacy Express',
    paymentMethod: 'UPI (PhonePe)',
  },
];

/**
 * Loads stored vital scans (<2 KB per record compact JSON).
 */
export function getStoredVitalScans(): CompactVitalScan[] {
  if (typeof window === 'undefined') return DEFAULT_VITALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VITALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VITALS, JSON.stringify(DEFAULT_VITALS));
      return DEFAULT_VITALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored vital scans:', err);
    return DEFAULT_VITALS;
  }
}

/**
 * Saves a new compact Vital Lens scan record.
 * Contains only metrics and timestamps — zero images/PDFs stored.
 */
export function saveVitalScan(
  metrics: VitalMetricsResult,
  userData: VitalLensUserData,
  mode: 'Logged-in' | 'Guest' = 'Guest',
  userId?: string
): CompactVitalScan {
  const dateObj = new Date(metrics.scanTimestamp || Date.now());
  const effectiveUserId =
    userId ||
    (mode === 'Logged-in'
      ? `USR-${(userData.mobileNumber || 'PATIENT').slice(-6)}`
      : `GUEST-${Date.now().toString().slice(-6)}`);

  const hr = Math.round(metrics.heartRate || 72);
  const spo2 = Math.round(metrics.oxygenSaturation || 98);
  const hrv = Math.round(metrics.sdnn || 55);
  const statusSummary = `Completed (${metrics.stressLevel || 'Normal'} - HR: ${hr} BPM, SpO2: ${spo2}%, HRV: ${hrv} ms)`;

  const newRecord: CompactVitalScan = {
    id: `VIT-${Date.now().toString().slice(-6)}`,
    scanTimestamp: metrics.scanTimestamp || new Date().toISOString(),
    date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    userId: effectiveUserId,
    mode,
    status: statusSummary,
    heartRate: hr,
    respirationRate: Math.round(metrics.respirationRate || 16),
    oxygenSaturation: spo2,
    bloodPressureSystolic: Math.round(metrics.bloodPressureSystolic || 120),
    bloodPressureDiastolic: Math.round(metrics.bloodPressureDiastolic || 80),
    sdnn: hrv,
    stressLevel: metrics.stressLevel || 'Low / Relaxed',
    mentalWellbeingScore: Math.round(metrics.mentalWellbeingScore || 90),
    bmi: Number((metrics.bmi || 22.4).toFixed(1)),
    fullName: userData.fullName || 'Patient',
    mobileNumber: userData.mobileNumber || '9876543210',
    age: userData.age || 35,
    gender: userData.gender || 'Other',
  };

  try {
    const existing = getStoredVitalScans();
    const updated = [newRecord, ...existing];
    localStorage.setItem(STORAGE_KEY_VITALS, JSON.stringify(updated));
    window.dispatchEvent(new Event('nhealth_vital_scans_updated'));
  } catch (err) {
    console.warn('Error saving vital scan record:', err);
  }

  return newRecord;
}

/**
 * Loads stored invoices / order receipts.
 */
export function getStoredInvoices(): InvoiceData[] {
  if (typeof window === 'undefined') return DEFAULT_INVOICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(DEFAULT_INVOICES));
      return DEFAULT_INVOICES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored invoices:', err);
    return DEFAULT_INVOICES;
  }
}

/**
 * Saves an invoice / order receipt (<2 KB compact JSON).
 */
export function saveInvoice(invoice: InvoiceData): void {
  try {
    const existing = getStoredInvoices();
    const updated = [invoice, ...existing];
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(updated));
    window.dispatchEvent(new Event('nhealth_invoices_updated'));
  } catch (err) {
    console.warn('Error saving invoice:', err);
  }
}

/**
 * Converts a confirmed booking into an invoice record automatically.
 */
export function syncBookingToInvoice(booking: ConfirmedBooking): InvoiceData {
  const dateObj = new Date(booking.bookedAt || Date.now());
  const invoice: InvoiceData = {
    id: `INV-${booking.referenceId.replace(/[^a-zA-Z0-9]/g, '')}`,
    orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
    serviceName: booking.serviceName,
    date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    amount: '₹750', // Standard consultation fee
    numericAmount: 750,
    status: 'Paid',
    patientName: booking.patientName,
    patientPhone: booking.phone,
    patientAddress: booking.address,
    paymentMethod: 'Online Prepaid (Confirmed)',
  };

  saveInvoice(invoice);
  return invoice;
}

export const DEFAULT_GUEST_BOOKINGS: ConfirmedBooking[] = [
  {
    referenceId: 'GBK-2026-9912',
    serviceId: 'careride',
    serviceName: 'CareRide / At-Home Healthcare',
    patientName: 'Ananya Reddy',
    age: '29',
    gender: 'Female',
    phone: '9440123456',
    whatsapp: '9440123456',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'Flat 402, Banjara Hills Road No. 12, Hyderabad',
    symptoms: 'Post-op mobility transport to clinic appointment',
    preferredDate: '2026-10-21',
    preferredTimeSlot: '11:00 AM - 01:00 PM',
    bookedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isGuest: true,
    status: 'Confirmed',
  },
  {
    referenceId: 'GBK-2026-9844',
    serviceId: 'diagnostics',
    serviceName: 'Home diagnostics & lab tests',
    patientName: 'Vikram Sethi',
    age: '45',
    gender: 'Male',
    phone: '9849011223',
    whatsapp: '9849011223',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'Plot 18, Madhapur, HITEC City, Hyderabad',
    symptoms: 'Fasting blood glucose and lipid profile checkup',
    preferredDate: '2026-10-20',
    preferredTimeSlot: '07:00 AM - 09:00 AM',
    bookedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isGuest: true,
    status: 'Report Ready',
  },
  {
    referenceId: 'GBK-2026-9791',
    serviceId: 'doctor-visit',
    serviceName: 'Doctor home visits',
    patientName: 'Sunita Sharma',
    age: '62',
    gender: 'Female',
    phone: '9121234567',
    whatsapp: '9121234567',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'House 9, Kondapur, Near Botanical Garden, Hyderabad',
    symptoms: 'Hypertension checkup and mild seasonal chest congestion',
    preferredDate: '2026-10-19',
    preferredTimeSlot: '04:00 PM - 06:00 PM',
    bookedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isGuest: true,
    status: 'Clinician Dispatched',
  },
  {
    referenceId: 'GBK-2026-9650',
    serviceId: 'nurse-care',
    serviceName: 'Specialized nursing care at home',
    patientName: 'Karthik Rao',
    age: '38',
    gender: 'Male',
    phone: '9393938811',
    whatsapp: '9393938811',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'Tower B, Gachibowli, Hyderabad',
    symptoms: 'Post-surgery IV drip administration and sterile wound dressing',
    preferredDate: '2026-10-18',
    preferredTimeSlot: '09:00 AM - 11:00 AM',
    bookedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isGuest: true,
    status: 'Confirmed',
  },
];

export function getStoredGuestBookings(): ConfirmedBooking[] {
  if (typeof window === 'undefined') return DEFAULT_GUEST_BOOKINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST_BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_GUEST_BOOKINGS, JSON.stringify(DEFAULT_GUEST_BOOKINGS));
      return DEFAULT_GUEST_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse guest bookings:', err);
    return DEFAULT_GUEST_BOOKINGS;
  }
}

export function saveGuestBooking(booking: ConfirmedBooking): void {
  try {
    const existing = getStoredGuestBookings();
    const updated = [booking, ...existing];
    localStorage.setItem(STORAGE_KEY_GUEST_BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('nhealth_guest_bookings_updated'));
  } catch (err) {
    console.warn('Error saving guest booking:', err);
  }
}

export function updateGuestBookingStatus(refId: string, status: ConfirmedBooking['status']): ConfirmedBooking[] {
  try {
    const existing = getStoredGuestBookings();
    const updated = existing.map((b) => (b.referenceId === refId ? { ...b, status } : b));
    localStorage.setItem(STORAGE_KEY_GUEST_BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('nhealth_guest_bookings_updated'));
    return updated;
  } catch {
    return getStoredGuestBookings();
  }
}
