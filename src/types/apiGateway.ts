/**
 * Standardized Data Payloads & Partner Integration Schemas for Nhealth
 * Supports Third-Party Hospital (HIS), Diagnostic Lab (LIS), and Pharmacy (PMS) Integrations.
 */

export type PartnerType = 'hospital' | 'lab' | 'pharmacy' | 'tpa' | 'imaging';

export type PartnerScope =
  | 'prescriptions:read'
  | 'prescriptions:write'
  | 'lab:orders:create'
  | 'lab:reports:publish'
  | 'diagnostics:schedule'
  | 'slots:read'
  | 'slots:sync'
  | 'webhooks:listen'
  | 'all';

export interface PartnerCredentials {
  partnerId: string;
  partnerName: string;
  partnerType: PartnerType;
  apiKey: string;
  apiSecret: string;
  clientId: string;
  clientSecret: string;
  allowedScopes: PartnerScope[];
  webhookUrl?: string;
  webhookSecret?: string;
  status: 'active' | 'suspended' | 'sandbox';
  createdAt: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
  partner_id: string;
  partner_name: string;
  issued_at: string;
}

// 1. Standardized Prescription Payload (FHIR aligned)
export interface PartnerPrescriptionPayload {
  prescriptionId: string;
  externalRefId: string;
  patient: {
    mrn: string;
    fullName: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    phone: string;
    address?: string;
  };
  doctor: {
    registrationNumber: string;
    fullName: string;
    specialty: string;
    clinicOrHospital: string;
  };
  diagnosis: {
    icd10Code: string;
    clinicalDescription: string;
  };
  medications: Array<{
    itemCode: string;
    name: string;
    form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment';
    dosage: string;
    frequency: string;
    durationDays: number;
    dispenseQuantity: number;
    instructions: string;
  }>;
  urgency: 'routine' | 'urgent' | 'emergency';
  dispensingStatus?: 'pending' | 'partially_dispensed' | 'fully_dispensed';
  secureTokenId?: string;
  issuedAt: string;
}

// 2. Standardized Lab Test Booking Payload (LIS/NABL aligned)
export interface PartnerLabBookingPayload {
  orderId: string;
  externalLabRef: string;
  patient: {
    mrn: string;
    fullName: string;
    phone: string;
    address: string;
  };
  tests: Array<{
    testCode: string;
    testName: string;
    sampleType: 'Whole Blood' | 'Serum' | 'Plasma' | 'Urine' | 'Swab';
    fastingRequired: boolean;
    turnaroundHours: number;
    price: number;
  }>;
  collectionSchedule: {
    date: string;
    timeSlot: string;
    homeCollection: boolean;
  };
  phlebotomistStatus: 'unassigned' | 'assigned' | 'en_route' | 'sample_collected' | 'processing';
  barcodes?: string[];
  reportUrl?: string;
  createdAt: string;
}

// 3. Standardized Diagnostic & Portable Imaging Order Payload (PACS/DICOM aligned)
export interface PartnerDiagnosticOrderPayload {
  requisitionId: string;
  modality: 'Portable X-Ray' | 'Portable ECG' | 'Ultrasound' | 'CT Scan' | 'MRI';
  anatomicalRegion: string;
  clinicalIndication: string;
  patient: {
    mrn: string;
    fullName: string;
    phone: string;
    homeAddress: string;
  };
  portableUnitRequired: boolean;
  technicianAssigned?: {
    name: string;
    phone: string;
    equipmentId: string;
  };
  priority: 'routine' | 'stat' | 'asap';
  reportStatus: 'pending_scan' | 'scan_completed' | 'radiologist_review' | 'certified';
  createdAt: string;
}

// 4. Standardized Appointment Slot Payload (HIS/EMR scheduling sync)
export interface PartnerAppointmentSlotPayload {
  slotId: string;
  facilityId: string;
  facilityName: string;
  clinicianId: string;
  clinicianName: string;
  specialty: string;
  serviceType: 'home_doctor_visit' | 'online_consultation' | 'nursing_care' | 'physiotherapy';
  startDateTime: string;
  endDateTime: string;
  slotDurationMinutes: number;
  status: 'available' | 'reserved' | 'booked';
  fee: number;
  synchronizedAt: string;
}

// 5. Standardized Webhook Event Payload
export interface PartnerWebhookEvent<T = any> {
  eventId: string;
  eventType:
    | 'prescription.created'
    | 'prescription.dispensed'
    | 'lab.sample_collected'
    | 'lab.report_ready'
    | 'diagnostic.scan_completed'
    | 'slot.reserved'
    | 'qr_token.redeemed';
  timestamp: string;
  partnerId: string;
  data: T;
  signature: string;
}
