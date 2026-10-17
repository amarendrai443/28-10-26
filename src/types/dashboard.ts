export type DashboardRole =
  | 'Patient'
  | 'Doctor'
  | 'Diagnostics'
  | 'Pharmacy'
  | 'Ambulance'
  | 'Caregiver'
  | 'Hospital';

export interface LinkedAccount {
  id: string;
  name: string;
  role: DashboardRole;
  roleTitle: string;
  entityName: string;
  phone: string;
  email: string;
  status: 'Live' | 'Pending' | 'Active';
  badge: string;
  registrationNumber?: string;
  specialty?: string;
  city?: string;
}

export interface PatientVitalsRecord {
  id: string;
  date: string;
  heartRate: number;
  bp: string;
  spO2: number;
  temperature: string;
  status: 'Normal' | 'Elevated' | 'Attention Needed';
}

export interface DoctorAppointmentItem {
  id: string;
  tokenNo: number;
  patientName: string;
  age: number;
  gender: string;
  type: 'Home Visit' | 'Video Consultation';
  symptoms: string;
  timeSlot: string;
  status: 'Scheduled' | 'In Consultation' | 'Completed';
  contact: string;
}

export interface DiagnosticSampleItem {
  barcode: string;
  patientName: string;
  testName: string;
  phlebotomist: string;
  collectedAt: string;
  status: 'Sample Collected' | 'In Transit (Rider)' | 'Processing' | 'Report Signed-Off';
  tatRemaining: string;
  fastingStatus: 'Fasting' | 'Post-Prandial' | 'Random';
}

export interface PharmacyOrderItem {
  orderId: string;
  patientName: string;
  doctorName: string;
  medicines: string[];
  totalAmount: number;
  deliveryStatus: 'Prescription Verified' | 'Packed' | 'Dispatched (Care Rider)' | 'Delivered';
  riderName: string;
  city: string;
}

export interface EmergencyTransitAlert {
  alertId: string;
  callerName: string;
  phone: string;
  location: string;
  eta: string;
  severity: 'Critical (Cardiac/ALS)' | 'Moderate (BLS Transit)' | 'Sample Cold-Chain';
  status: 'Dispatched' | 'En Route' | 'On Scene' | 'Hospital Handover';
  assignedVehicle: string;
}

export interface BedsideCareSchedule {
  patientId: string;
  patientName: string;
  age: number;
  careType: 'Geriatric Bedside' | 'Post-Op Mobility' | 'Palliative Support';
  shift: 'Morning (8AM - 2PM)' | 'Evening (2PM - 8PM)' | '24-Hour Stay';
  attendantName: string;
  mobilityStatus: string;
  lastBp: string;
  lastSugar: string;
}

export interface HospitalBedMatrix {
  wardType: string;
  totalBeds: number;
  occupied: number;
  available: number;
  criticalEquipped: boolean;
}
