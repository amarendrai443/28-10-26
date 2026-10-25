export type PartnerCategory =
  | 'Doctor'
  | 'Hospital'
  | 'Diagnostics'
  | 'Pharmacy'
  | 'Ambulance'
  | 'Caregiver'
  | 'Care Rider'
  | 'Care Assist'
  | 'Blood Bank';

export type PartnerStatus = 'Pending' | 'Live' | 'Suspended' | 'Rejected';

export interface PartnerApplication {
  id: string;
  category: PartnerCategory;
  entityName: string;
  registrationNumber: string;
  specialty: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  state: string;
  pincode?: string;
  documentName?: string;
  documentSize?: string;
  submittedAt: string;
  status: PartnerStatus;
  bioOrExperience?: string;
  verifiedAt?: string;
  profileImage?: string;
  consultationFee?: number;
  loginIdOrEmail?: string;
  password?: string;

  // Standard Profile & Verification Fields (All Departments)
  whatsappNumber?: string;
  fullAddress?: string;
  govtIdProofName?: string;
  profilePhotoName?: string;
  agreedToTerms?: boolean;

  // Care Rider Specific Fields & Uploads
  vehicleType?: '2-Wheeler' | '4-Wheeler';
  vehicleRegNumber?: string;
  drivingLicenseNumber?: string;
  alternateContactDetails?: string;
  drivingLicenseDocName?: string;
  individualPhotoName?: string;
  familyPhotoName?: string;
  policeNocDocName?: string;

  // Phase 3: Inactivity & Automatic Suspension Rules
  lastActiveAt?: string; // ISO date string of last login or operational activity
  isSuspendedDueToInactivity?: boolean;
  suspensionReason?: string;
  suspensionDate?: string;

  // Phase 3: Revocation / Re-activation Requests
  revocationRequested?: boolean;
  revocationRequestedAt?: string;
  revocationReason?: string;
  revocationStatus?: 'Pending Review' | 'Approved' | 'Rejected';

  // Phase 3: High-Risk Multi-Registration & Fraud Controls
  isRestrictedByAdmin?: boolean;
  adminRestrictedReason?: string;
  whitelistedByAdmin?: boolean;
}

export const INACTIVITY_THRESHOLD_DAYS = 90;

/**
 * Calculates number of days since last operational activity or login
 */
export function calculateDaysInactive(partner: PartnerApplication): number {
  const referenceDateStr = partner.lastActiveAt || partner.verifiedAt || partner.submittedAt;
  if (!referenceDateStr) return 0;
  const refTime = new Date(referenceDateStr).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - refTime) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Checks if a partner account is suspended (either explicitly or automatically via the >90 days inactivity rule)
 */
export function isPartnerSuspended(partner: PartnerApplication): boolean {
  if (partner.status === 'Suspended') return true;
  if (partner.isSuspendedDueToInactivity) return true;
  if (partner.isRestrictedByAdmin) return true;
  // If partner was previously live but has no activity for > 90 days:
  if (partner.status === 'Live' && calculateDaysInactive(partner) > INACTIVITY_THRESHOLD_DAYS) {
    return true;
  }
  return false;
}

/**
 * Checks if a phone number is registered across 4 or more different service categories
 */
export function checkIsHighRiskMultiRegistration(
  phone: string,
  partnersList: PartnerApplication[]
): {
  isHighRisk: boolean;
  categoryCount: number;
  categories: PartnerCategory[];
  matchingPartners: PartnerApplication[];
} {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { isHighRisk: false, categoryCount: 0, categories: [], matchingPartners: [] };
  }
  const matching = partnersList.filter(
    (p) => p.phone.replace(/\D/g, '').slice(-10) === cleanPhone
  );
  const categories = Array.from(new Set(matching.map((p) => p.category)));
  return {
    isHighRisk: categories.length >= 4,
    categoryCount: categories.length,
    categories,
    matchingPartners: matching,
  };
}

export const INITIAL_PARTNERS: PartnerApplication[] = [
  {
    id: 'PARTNER-DOC-001',
    category: 'Doctor',
    entityName: 'Dr. Meera Nambiar',
    registrationNumber: 'MCI-84729-KA',
    specialty: 'Internal Medicine & Geriatrics',
    contactPerson: 'Dr. Meera Nambiar',
    phone: '9845012345',
    email: 'dr.meera@nambiarclinic.com',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560034',
    documentName: 'Medical_Council_License_MCI84729.pdf',
    documentSize: '1.4 MB',
    submittedAt: '2026-10-15T18:30:00.000Z',
    status: 'Pending',
    bioOrExperience: '14+ years providing comprehensive adult primary care and at-home chronic disease management.',
    consultationFee: 700,
    loginIdOrEmail: 'dr.meera@nambiarclinic.com',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-AMB-002',
    category: 'Ambulance',
    entityName: 'LifeLine Critical Care Ambulance Fleet',
    registrationNumber: 'RTO-TS-AMB-2024-912',
    specialty: 'Advanced Life Support (ALS) & Ventilator Transit',
    contactPerson: 'K. Venkatesh (Operations Lead)',
    phone: '9581582220',
    email: 'dispatch@lifelineambulancenet.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    documentName: 'Emergency_Fleet_Permit_ISO9001.pdf',
    documentSize: '2.8 MB',
    submittedAt: '2026-10-15T19:15:00.000Z',
    status: 'Pending',
    bioOrExperience: 'Fleet of 8 fully-equipped ICU-on-wheels with automated GPS dispatch and certified EMTs.',
    loginIdOrEmail: 'dispatch@lifelineambulancenet.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-DIAG-003',
    category: 'Diagnostics',
    entityName: 'Thyrocare Technologies Regional Hub',
    registrationNumber: 'NABL-MC-2418',
    specialty: 'Automated Clinical Biochemistry & Pathology',
    contactPerson: 'Dr. C. Sharma (Quality Director)',
    phone: '9393932969',
    email: 'partner.labs@thyrocare.com',
    city: 'Hyderabad',
    district: 'Rangareddy',
    state: 'Telangana',
    pincode: '500081',
    documentName: 'NABL_Accreditation_Certificate_ISO15189.pdf',
    documentSize: '3.1 MB',
    submittedAt: '2026-10-14T10:00:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-14T12:00:00.000Z',
    bioOrExperience: 'NABL ISO 15189 accredited hub providing door-step barcoded vacuum sample collection with 6-hour turnaround.',
    loginIdOrEmail: 'partner.labs@thyrocare.com',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-HOSP-004',
    category: 'Hospital',
    entityName: 'Apollo Reach Superspecialty Hospital',
    registrationNumber: 'NABH-HOSP-2023-4180',
    specialty: 'Multi-Specialty Emergency & Daycare Surgery',
    contactPerson: 'S. Rajagopal (Hospital Administrator)',
    phone: '9885544332',
    email: 'admin.outreach@apolloreach.com',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    documentName: 'NABH_Hospital_Accreditation.pdf',
    documentSize: '4.2 MB',
    submittedAt: '2026-10-14T11:20:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-14T14:30:00.000Z',
    bioOrExperience: 'Premier 200-bed hospital network partnering for direct clinical referral escalation and ICU care.',
    loginIdOrEmail: 'admin.outreach@apolloreach.com',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-RIDER-005',
    category: 'Care Rider',
    entityName: 'Nhealth Express Care Rider Fleet',
    registrationNumber: 'TS-TRANS-RIDER-2026-88',
    specialty: 'Cold-Chain Diagnostic Sample Transit & Medicine Delivery',
    contactPerson: 'M. Ramesh (Logistics Manager)',
    phone: '9393934621',
    email: 'rider.dispatch@nhealth.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500082',
    documentName: 'Commercial_Medical_Fleet_Permit.pdf',
    documentSize: '1.9 MB',
    submittedAt: '2026-10-16T08:00:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-16T10:00:00.000Z',
    bioOrExperience: 'Certified temperature-controlled cold boxes for phlebotomy sample transfer and 45-min medicine drop-off.',
    loginIdOrEmail: 'rider.dispatch@nhealth.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-ASSIST-006',
    category: 'Care Assist',
    entityName: 'Nhealth Bedside Care Assist Services',
    registrationNumber: 'NURSE-COUNCIL-TS-4412',
    specialty: 'General Duty Attendants & Elderly Bedside Assistance',
    contactPerson: 'S. Preethi (Care Coordinator)',
    phone: '9440112233',
    email: 'careassist@nhealth.in',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560001',
    documentName: 'Nursing_Superintendence_Certificate.pdf',
    documentSize: '2.3 MB',
    submittedAt: '2026-10-16T09:30:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-16T11:15:00.000Z',
    bioOrExperience: 'Trained and background-verified geriatric attendants, palliative care aides, and post-surgery mobility coaches.',
    loginIdOrEmail: 'careassist@nhealth.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-BLOOD-007',
    category: 'Blood Bank',
    entityName: 'Red Cross & Regional Blood Bank Network',
    registrationNumber: 'FDA-BLOOD-LIC-2024-902',
    specialty: 'Emergency Rare Blood Group Availability & Component Separation',
    contactPerson: 'Dr. V. Prasad (Blood Transfusion Officer)',
    phone: '9581582220',
    email: 'bloodbank.network@nhealth.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500029',
    documentName: 'Drug_Control_Blood_Bank_License.pdf',
    documentSize: '3.4 MB',
    submittedAt: '2026-10-16T10:00:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-16T12:00:00.000Z',
    bioOrExperience: 'Integrated real-time live blood stock tracker with PRBC, Platelet Concentrates, and FFP emergency reserves.',
    loginIdOrEmail: 'bloodbank.network@nhealth.in',
    password: 'partner@2026',
    lastActiveAt: '2026-10-17T12:00:00.000Z',
  },
  // Phase 3: Inactive Accounts Suspended (>90 Days Rule)
  {
    id: 'PARTNER-PHARM-008',
    category: 'Pharmacy',
    entityName: 'MedPlus Express Hub (Secunderabad)',
    registrationNumber: 'TS-DRUG-RET-2023-8819',
    specialty: 'Prescription Drugs, Cold-Chain Insulin & Chronic Care Refills',
    contactPerson: 'R. K. Verma (Chief Pharmacist)',
    phone: '9440889911',
    email: 'medplus.secunderabad@nhealth.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500003',
    documentName: 'Pharmacy_Drug_Retail_License.pdf',
    documentSize: '2.1 MB',
    submittedAt: '2026-05-10T10:00:00.000Z',
    status: 'Suspended',
    verifiedAt: '2026-05-12T14:00:00.000Z',
    lastActiveAt: '2026-06-01T09:00:00.000Z',
    isSuspendedDueToInactivity: true,
    suspensionReason: 'Suspended due to Inactivity (>90 days without operational activity or login)',
    suspensionDate: '2026-09-01T00:00:00.000Z',
    revocationRequested: true,
    revocationRequestedAt: '2026-10-17T11:20:00.000Z',
    revocationReason: 'Cold-chain refrigeration equipment and full-time certified pharmacist restored. Requesting account restoration to resume home deliveries.',
    revocationStatus: 'Pending Review',
    bioOrExperience: 'Licensed 24/7 retail pharmacy with temperature-monitored drug vaults and home dispatch.',
    loginIdOrEmail: 'medplus.secunderabad@nhealth.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-DOC-009',
    category: 'Doctor',
    entityName: 'Dr. Anand Rao (Consultant Pediatrician)',
    registrationNumber: 'MCI-63910-TS',
    specialty: 'Pediatrics & Adolescent Medicine OPD',
    contactPerson: 'Dr. Anand Rao',
    phone: '9848123499',
    email: 'dr.anandrao@clinicnet.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500028',
    documentName: 'Medical_Council_License_TS.pdf',
    documentSize: '1.7 MB',
    submittedAt: '2026-04-15T09:00:00.000Z',
    status: 'Suspended',
    verifiedAt: '2026-04-18T10:00:00.000Z',
    lastActiveAt: '2026-05-20T11:00:00.000Z',
    isSuspendedDueToInactivity: true,
    suspensionReason: 'Suspended due to Inactivity (>90 days without operational activity or login)',
    suspensionDate: '2026-08-20T00:00:00.000Z',
    revocationRequested: false,
    bioOrExperience: '18+ years pediatric specialist consultant practicing across Hyderabad outpatient clinics.',
    loginIdOrEmail: 'dr.anandrao@clinicnet.in',
    password: 'partner@2026',
  },
  // Phase 3: High-Risk Multi-Registered Accounts (Single Phone '9887766554' across 5 Service Categories)
  {
    id: 'PARTNER-APEX-010',
    category: 'Diagnostics',
    entityName: 'Apex Diagnostic & Molecular Genomics Hub',
    registrationNumber: 'NABL-APEX-9921',
    specialty: 'Rapid Molecular PCR, Biochemistry & Histopathology',
    contactPerson: 'Dr. Rajeshwar Rao (Medical Director)',
    phone: '9887766554',
    email: 'diagnostics@apexhealthgroup.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    documentName: 'NABL_Certificate_Apex.pdf',
    documentSize: '2.9 MB',
    submittedAt: '2026-10-12T10:00:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-13T11:00:00.000Z',
    lastActiveAt: '2026-10-17T16:00:00.000Z',
    bioOrExperience: 'Part of Apex Healthcare Network. Comprehensive lab testing with automated phlebotomist dispatch.',
    loginIdOrEmail: 'diagnostics@apexhealthgroup.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-APEX-011',
    category: 'Pharmacy',
    entityName: 'Apex 24/7 MedStore Pharmacy',
    registrationNumber: 'TS-DRUG-APEX-4412',
    specialty: 'Express Prescription Dispensing & Cold-Chain Storage',
    contactPerson: 'S. Naresh (Pharmacy Operations)',
    phone: '9887766554',
    email: 'pharmacy@apexhealthgroup.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    documentName: 'Apex_Pharmacy_License.pdf',
    documentSize: '2.2 MB',
    submittedAt: '2026-10-12T11:00:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-13T12:00:00.000Z',
    lastActiveAt: '2026-10-17T16:00:00.000Z',
    bioOrExperience: 'Apex Healthcare Network central pharmacy dispatch unit for critical prescriptions.',
    loginIdOrEmail: 'pharmacy@apexhealthgroup.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-APEX-012',
    category: 'Ambulance',
    entityName: 'Apex Critical Transport & ALS Fleet',
    registrationNumber: 'RTO-TS-AMB-APEX-01',
    specialty: 'Advanced Cardiac Life Support (ACLS) Rapid Response',
    contactPerson: 'Captain V. Roy (Fleet Dispatch)',
    phone: '9887766554',
    email: 'ambulance@apexhealthgroup.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    documentName: 'Apex_Fleet_Permit.pdf',
    documentSize: '3.1 MB',
    submittedAt: '2026-10-12T12:30:00.000Z',
    status: 'Pending',
    lastActiveAt: '2026-10-12T12:30:00.000Z',
    bioOrExperience: 'Fleet of 6 GPS-tracked ventilator ambulances operating under Apex umbrella.',
    loginIdOrEmail: 'ambulance@apexhealthgroup.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-APEX-013',
    category: 'Care Assist',
    entityName: 'Apex Home Care & Senior Assist',
    registrationNumber: 'TS-CARE-APEX-883',
    specialty: 'Geriatric Bedside Nursing & Post-Surgical Rehab',
    contactPerson: 'Sister Mary Joseph (Nursing Supdt)',
    phone: '9887766554',
    email: 'eldercare@apexhealthgroup.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    documentName: 'Nursing_Registration_Apex.pdf',
    documentSize: '1.8 MB',
    submittedAt: '2026-10-12T14:00:00.000Z',
    status: 'Live',
    verifiedAt: '2026-10-13T15:00:00.000Z',
    lastActiveAt: '2026-10-17T16:00:00.000Z',
    bioOrExperience: 'Bedside attendants and palliative home caregivers managed by Apex Healthcare.',
    loginIdOrEmail: 'eldercare@apexhealthgroup.in',
    password: 'partner@2026',
  },
  {
    id: 'PARTNER-APEX-014',
    category: 'Doctor',
    entityName: 'Apex Multi-Specialty Clinical Practice',
    registrationNumber: 'MCI-APEX-CLINIC-77',
    specialty: 'Cardiology, Pulmonology & Family Medicine Outpatient',
    contactPerson: 'Dr. Rajeshwar Rao',
    phone: '9887766554',
    email: 'clinical@apexhealthgroup.in',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    documentName: 'Apex_Clinic_Establishment_Act.pdf',
    documentSize: '2.5 MB',
    submittedAt: '2026-10-12T15:00:00.000Z',
    status: 'Pending',
    lastActiveAt: '2026-10-12T15:00:00.000Z',
    bioOrExperience: 'Consultant clinical suites providing in-clinic and home specialist visits.',
    loginIdOrEmail: 'clinical@apexhealthgroup.in',
    password: 'partner@2026',
  },
];
