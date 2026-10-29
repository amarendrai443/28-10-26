export interface InsuranceClaimDetails {
  policyNumber: string;
  insuranceCompany: string;
  registeredMobile: string;
  claimId: string;
  preAuthAmount: number;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  approvalTimestamp: string;
  otpVerified: boolean;
}

export type InsurancePaymentOption = 'pay_now' | 'claim_insurance';

export const POPULAR_INSURANCE_COMPANIES = [
  'Star Health and Allied Insurance',
  'HDFC ERGO General Insurance',
  'ICICI Lombard Health Care',
  'Care Health Insurance (Religare)',
  'Niva Bupa Health Insurance (Max Bupa)',
  'Bajaj Allianz General Insurance',
  'Tata AIG General Insurance',
  'The New India Assurance Co.',
  'United India Insurance',
  'Other Empaneled TPA Provider',
] as const;
