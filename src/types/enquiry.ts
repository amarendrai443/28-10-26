export type EnquiryType =
  | 'Corporate Enquiry'
  | 'Healthcare Service Inquiry'
  | 'Corporate & Institutional Collaboration'
  | 'Talent & Team Application'
  | 'General Enquiry';

export type EnquiryStatus = 'Pending' | 'Reviewed' | 'Contacted' | 'Resolved';

export interface EnquiryRecord {
  id: string; // Unique Reference ID (e.g., NH-CORP-849201, NH-782910)
  type: EnquiryType;
  name: string; // Contact Person or Individual Name
  companyName?: string; // Company / Institution Name
  designation?: string; // Contact Person Designation
  email: string;
  phone: string;
  employeeCount?: string; // Workforce range (e.g. 500-2000)
  location?: string; // City / Location / Address
  categoryOrService?: string; // Primary category or service interest
  selectedOfferings?: string[]; // Specific offerings requested
  requirements: string; // Full requirements or notes
  submittedAt: string; // ISO 8601 timestamp
  status: EnquiryStatus;
  reviewedAt?: string;
  contactedAt?: string;
  resolvedAt?: string;
  adminNotes?: string;
  rawPayload?: Record<string, any>;
}

export const INITIAL_ENQUIRIES: EnquiryRecord[] = [
  {
    id: 'NH-CORP-928104',
    type: 'Corporate Enquiry',
    name: 'Vikramaditya Singhania',
    companyName: 'Apex Global Tech Solutions Pvt Ltd',
    designation: 'VP - People Operations & Human Resources',
    email: 'v.singhania@apextech.in',
    phone: '9845012345',
    employeeCount: '500-2000',
    location: 'Electronic City, Bengaluru',
    categoryOrService: 'Corporate Health & Wellness',
    selectedOfferings: [
      'Annual Corporate Health Audits & Executive Health Checks',
      'Onsite Occupational Health Centers & Emergency Ambulance Protocols',
    ],
    requirements:
      'We seek an annual on-campus comprehensive preventive screening camp for 1,200 software engineers and their families, including cardiac risk assessment, HbA1c, Vitamin D/B12, and 24/7 emergency response protocols for our campus.',
    submittedAt: '2026-10-18T09:30:00.000Z',
    status: 'Pending',
    rawPayload: {
      source: 'CorporateEnquiriesPage',
      budget: 'Annual Contract',
      priority: 'High',
    },
  },
  {
    id: 'NH-CORP-817290',
    type: 'Corporate Enquiry',
    name: 'Ananya Deshmukh',
    companyName: 'Lumina Financial Services',
    designation: 'Head of Administration & Employee Wellbeing',
    email: 'ananya.d@luminafin.com',
    phone: '9820098765',
    employeeCount: '100-500',
    location: 'Bandra Kurla Complex (BKC), Mumbai',
    categoryOrService: 'Executive Health & Emergency SOS',
    selectedOfferings: [
      'Priority Hospital Admission Concierge & Cashless Bed Desks',
      'Corporate Telehealth Access & 24/7 Digital Doctor Subscriptions',
    ],
    requirements:
      'Looking for VIP priority OPD escalations and executive health check vouchers for our senior leadership team (85 executives) across Mumbai and Pune hospitals.',
    submittedAt: '2026-10-17T14:15:00.000Z',
    status: 'Reviewed',
    reviewedAt: '2026-10-17T16:30:00.000Z',
    adminNotes: 'Reviewed by Enterprise Desk. Follow-up meeting scheduled with HR director.',
    rawPayload: {
      source: 'CorporateEnquiriesPage',
      priority: 'Medium',
    },
  },
  {
    id: 'NH-492018',
    type: 'Healthcare Service Inquiry',
    name: 'Rajeev Malhotra',
    companyName: 'Malhotra Family Care',
    email: 'rajeev.malhotra@gmail.com',
    phone: '9811234567',
    location: 'Vasant Vihar, New Delhi',
    categoryOrService: 'Bedside Assistance & Geriatric Care',
    requirements:
      'Need full-time 12-hour daytime bedside nursing attendant and weekly physiotherapist visits for elderly post-stroke patient (age 78) recovering at home.',
    submittedAt: '2026-10-16T11:45:00.000Z',
    status: 'Contacted',
    contactedAt: '2026-10-16T13:10:00.000Z',
    adminNotes: 'Care coordinator spoke with Mr. Malhotra. Nursing attendant assigned from south Delhi cluster.',
    rawPayload: {
      source: 'LetsCollaborate_ContactForm',
    },
  },
  {
    id: 'NH-PARTNER-7392',
    type: 'Corporate & Institutional Collaboration',
    name: 'Dr. Suresh Nambiar (MedSphere Diagnostic Hub)',
    companyName: 'MedSphere Diagnostics',
    email: 'suresh@medspheredx.com',
    phone: '9448123456',
    location: 'Kochi, Kerala',
    categoryOrService: 'Diagnostic Laboratory',
    requirements:
      'NABL-accredited regional diagnostic chain with 12 collection centers. Seeking partnership for automated sample dispatch and digital test report integration with Nhealth Unified Network.',
    submittedAt: '2026-10-15T16:20:00.000Z',
    status: 'Resolved',
    reviewedAt: '2026-10-15T17:00:00.000Z',
    contactedAt: '2026-10-16T10:00:00.000Z',
    resolvedAt: '2026-10-17T11:00:00.000Z',
    adminNotes: 'Partnership MoU signed. Onboarded to Nhealth Kerala network.',
    rawPayload: {
      source: 'PartnerCollaborationModal',
    },
  },
];

const STORAGE_KEY = 'nhealth_enquiries';

export function getStoredEnquiries(): EnquiryRecord[] {
  if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENQUIRIES));
      return INITIAL_ENQUIRIES;
    }
    const parsed: EnquiryRecord[] = JSON.parse(raw);
    // Ensure all initial seeds exist
    const existingIds = new Set(parsed.map((e) => e.id));
    const merged = [...parsed];
    for (const item of INITIAL_ENQUIRIES) {
      if (!existingIds.has(item.id)) {
        merged.push(item);
      }
    }
    return merged;
  } catch (err) {
    console.error('Failed to parse stored enquiries:', err);
    return INITIAL_ENQUIRIES;
  }
}

export function saveStoredEnquiries(enquiries: EnquiryRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
    window.dispatchEvent(new CustomEvent('nhealth_enquiries_updated', { detail: enquiries }));
  } catch (err) {
    console.error('Failed to save stored enquiries:', err);
  }
}

export function addEnquiry(
  payload: Omit<EnquiryRecord, 'id' | 'submittedAt' | 'status'> & {
    id?: string;
    submittedAt?: string;
    status?: EnquiryStatus;
  }
): EnquiryRecord {
  const current = getStoredEnquiries();
  const newRecord: EnquiryRecord = {
    id: payload.id || `NH-${Math.floor(100000 + Math.random() * 900000)}`,
    type: payload.type,
    name: payload.name,
    companyName: payload.companyName || '',
    designation: payload.designation || '',
    email: payload.email,
    phone: payload.phone,
    employeeCount: payload.employeeCount || '',
    location: payload.location || '',
    categoryOrService: payload.categoryOrService || '',
    selectedOfferings: payload.selectedOfferings || [],
    requirements: payload.requirements || 'No additional requirements provided.',
    submittedAt: payload.submittedAt || new Date().toISOString(),
    status: payload.status || 'Pending',
    adminNotes: '',
    rawPayload: payload.rawPayload || {},
  };

  const updated = [newRecord, ...current];
  saveStoredEnquiries(updated);
  return newRecord;
}

export function updateEnquiryStatus(
  id: string,
  newStatus: EnquiryStatus,
  adminNotes?: string
): EnquiryRecord[] {
  const current = getStoredEnquiries();
  const now = new Date().toISOString();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        reviewedAt:
          newStatus === 'Reviewed' || newStatus === 'Contacted' || newStatus === 'Resolved'
            ? item.reviewedAt || now
            : item.reviewedAt,
        contactedAt:
          newStatus === 'Contacted' || newStatus === 'Resolved'
            ? item.contactedAt || now
            : item.contactedAt,
        resolvedAt: newStatus === 'Resolved' ? now : undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
      };
    }
    return item;
  });

  saveStoredEnquiries(updated);
  return updated;
}
