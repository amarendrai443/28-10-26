import { EmpaneledDoctor } from './doctorFinder';

export interface VitalsPayload {
  heartRate: number; // e.g., 74 bpm
  oxygenSaturation: number; // e.g., 98 %
  bloodPressure: string; // e.g., "120/80 mmHg"
  respiratoryRate: number; // e.g., 16 rpm
  stressLevel?: 'Normal' | 'Mild' | 'Elevated';
  scannedAt: string;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "1-0-1 (After Food)"
  duration: string; // e.g. "5 Days"
  instructions?: string;
}

export interface ConsultationSession {
  sessionId: string;
  referenceId: string;
  doctor: EmpaneledDoctor;
  mode: 'Immediate Connect' | 'Scheduled Slot';
  scheduledDate?: string;
  scheduledSlot?: string;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  patientGender: string;
  symptoms: string;
  consultationFee: number;
  couponCode?: string;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: 'pending' | 'paid';
  paymentTxnId?: string;
  paymentMethod?: string;
  vitals?: VitalsPayload;
  doctorNotified: boolean;
  status: 'checkout' | 'vitals_prompt' | 'vitals_scan' | 'waiting_room' | 'in_call' | 'completed';
  createdAt: string;
  whatsappDispatched?: boolean;
  deepLinkUrl?: string;
  webVideoUrl?: string;
  prescription?: {
    medicines: PrescriptionItem[];
    labTests: string[];
    clinicalNotes: string;
    issuedAt: string;
  };
}
