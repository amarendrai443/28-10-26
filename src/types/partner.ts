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

export type PartnerStatus = 'Pending' | 'Live' | 'Rejected';

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
  },
];
