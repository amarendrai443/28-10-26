export type TokenDepartment =
  | 'pharmacy'
  | 'diagnostics'
  | 'nursing'
  | 'doctor'
  | 'ambulance'
  | 'general';

export interface SecureHealthToken {
  tokenId: string;
  orderId: string;
  serviceType: 'pharmacy_order' | 'prescription_order' | 'doctor_consultation' | 'lab_diagnostics' | 'general_service';
  serviceTitle: string;
  department?: TokenDepartment;
  createdAt: string;
  expiresAt: string; // Strict 3-day (72-hour) validity
  status: 'active' | 'partial' | 'redeemed' | 'expired';
  remainingItems?: Array<{ name: string; quantity: number; price?: number }>;
  redeemedAt?: string;
  redeemedBy?: {
    pharmacyName?: string;
    facilityName?: string;
    department?: TokenDepartment;
    staffId: string;
    staffName: string;
  };
  dispenseHistory?: Array<{
    dispensedAt: string;
    dispensedItems: Array<{ name: string; quantity: number; price?: number }>;
    staffId: string;
    staffName: string;
    facilityName: string;
    isPartial: boolean;
  }>;
  isInsuranceCovered: boolean;
  insuranceClaimId?: string;
  encryptedPayload: string; // Base64 encoded payload
}

export interface DecryptedTokenPayload {
  patientName: string;
  patientPhone: string;
  deliveryAddress?: string;
  items?: Array<{ name: string; quantity: number; price?: number }>;
  prescriptionName?: string;
  prescriptionUrl?: string;
  totalAmount: number;
  insuranceClaimId?: string;
  insuranceCompany?: string;
  copayAmount?: number;
  notes?: string;
  dispenseRecord?: {
    dispensedAt: string;
    isPartial: boolean;
    patientOtpVerified: boolean;
    originalItems: Array<{ name: string; quantity: number; price?: number }>;
    dispensedItems: Array<{ name: string; quantity: number; price?: number }>;
    totalDispensedValue: number;
    staffId: string;
    staffName: string;
    facilityName: string;
  };
}

export interface AuthorizedPartnerStaff {
  staffId: string;
  staffName: string;
  department: TokenDepartment;
  facilityName: string;
  licenseNumber: string;
  pharmacyName?: string; // Backward compatibility
}

export type AuthorizedPharmacyStaff = AuthorizedPartnerStaff;
