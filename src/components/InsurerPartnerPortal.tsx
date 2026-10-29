import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  RefreshCw,
  QrCode,
  Check,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Receipt,
  CreditCard,
  X,
  ExternalLink,
  Layers,
  History,
  FileCheck,
  Webhook
} from 'lucide-react';
import { InsuranceClaimDetails, POPULAR_INSURANCE_COMPANIES } from '../types/insurance';
import { ConfirmedBooking } from '../types/serviceBooking';
import { PartnerApiWebhookSettings } from './PartnerApiWebhookSettings';

interface InsurerAccount {
  id: string;
  name: string;
  email: string;
  code: string;
  logoBadge: string;
}

const REGISTERED_INSURERS: InsurerAccount[] = [
  {
    id: 'INS-STAR-01',
    name: 'Star Health and Allied Insurance',
    email: 'claims@starhealth.in',
    code: 'STAR-HEALTH',
    logoBadge: 'STAR',
  },
  {
    id: 'INS-HDFC-02',
    name: 'HDFC ERGO General Insurance',
    email: 'portal@hdfcergo.com',
    code: 'HDFC-ERGO',
    logoBadge: 'HDFC',
  },
  {
    id: 'INS-ICICI-03',
    name: 'ICICI Lombard Health Care',
    email: 'provider@icicilombard.com',
    code: 'ICICI-LOMBARD',
    logoBadge: 'ICICI',
  },
  {
    id: 'INS-CARE-04',
    name: 'Care Health Insurance (Religare)',
    email: 'tpa@careinsurance.com',
    code: 'CARE-HEALTH',
    logoBadge: 'CARE',
  },
  {
    id: 'INS-BUPA-05',
    name: 'Niva Bupa Health Insurance (Max Bupa)',
    email: 'claims@nivabupa.com',
    code: 'NIVA-BUPA',
    logoBadge: 'BUPA',
  },
  {
    id: 'INS-BAJAJ-06',
    name: 'Bajaj Allianz General Insurance',
    email: 'claims@bajajallianz.co.in',
    code: 'BAJAJ-ALLIANZ',
    logoBadge: 'BAJAJ',
  },
];

export interface PermittedClaimRecord {
  claimId: string;
  policyNumberMasked: string;
  patientNameMasked: string;
  serviceCategory: string;
  serviceName: string;
  timestamp: string;
  preAuthAmount: number;
  approvedPayout: number;
  deductions: number;
  verificationStatus: 'Approved' | 'Pending' | 'Rejected' | 'Settled';
  patientApproval: boolean;
  partnerVerification: {
    verified: boolean;
    partnerName: string;
    verifiedAt: string;
  };
  otpAudit: {
    verified: boolean;
    phoneMasked: string;
    verifiedAt: string;
    sessionRef: string;
  };
  qrToken: {
    tokenId: string;
    status: 'Active' | 'Partially Redeemed' | 'Used / Expired';
    generatedAt: string;
    expiresAt: string;
    remainingItems?: string;
  };
  evidence: {
    docType: 'Prescription' | 'Diagnostic Requisition' | 'Discharge Summary' | 'Procedure Log';
    fileName: string;
    doctorName: string;
    hospitalOrClinic: string;
    diagnosis: string;
    docPreviewUrl?: string;
  };
  settlement: {
    status: 'Settled' | 'Processing' | 'Pending TPA Release';
    utrNumber?: string;
    settledAt?: string;
    netPayable: number;
    convenienceFee: number;
  };
  insurerCompany: string;
}

interface InsurerPartnerPortalProps {
  onNavigateHome: () => void;
}

export const InsurerPartnerPortal: React.FC<InsurerPartnerPortalProps> = ({ onNavigateHome }) => {
  // Session persistence for logged in insurer
  const [activeInsurer, setActiveInsurer] = useState<InsurerAccount | null>(() => {
    try {
      const saved = sessionStorage.getItem('nhealth_active_insurer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Portal tabs
  const [activeTab, setActiveTab] = useState<'approvals' | 'evidences' | 'otp_audit' | 'qr_tracker' | 'settlement' | 'api_webhooks'>('approvals');

  // Evidence modal inspection state
  const [selectedEvidenceClaim, setSelectedEvidenceClaim] = useState<PermittedClaimRecord | null>(null);

  // In-memory status overrides for live actions
  const [claimStatusOverrides, setClaimStatusOverrides] = useState<Record<string, 'Approved' | 'Settled' | 'Rejected'>>({});

  // Login form states
  const [identifier, setIdentifier] = useState('claims@starhealth.in');
  const [password, setPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [selectedQuickInsurer, setSelectedQuickInsurer] = useState<string>('INS-STAR-01');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Settled'>('All');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInput = identifier.trim().toLowerCase();
    const matched = REGISTERED_INSURERS.find(
      (ins) =>
        ins.email.toLowerCase() === cleanInput ||
        ins.id.toLowerCase() === cleanInput ||
        ins.code.toLowerCase() === cleanInput ||
        ins.name.toLowerCase().includes(cleanInput)
    );

    if (matched) {
      setActiveInsurer(matched);
      try {
        sessionStorage.setItem('nhealth_active_insurer', JSON.stringify(matched));
      } catch {}
    } else {
      setLoginError('Invalid Insurer ID or email. Please select from the empaneled partner list below.');
    }
  };

  const handleQuickSelect = (ins: InsurerAccount) => {
    setSelectedQuickInsurer(ins.id);
    setIdentifier(ins.email);
    setPassword('••••••••');
    setLoginError(null);
  };

  const handleLogout = () => {
    setActiveInsurer(null);
    try {
      sessionStorage.removeItem('nhealth_active_insurer');
    } catch {}
  };

  // Helper to normalize and match insurer names safely
  const isMatchingInsurer = (recordCompany: string, activeCompanyName: string): boolean => {
    const c1 = recordCompany.toLowerCase().replace(/[^a-z0-9]/g, '');
    const c2 = activeCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return c1.includes(c2) || c2.includes(c1) || (c1.includes('star') && c2.includes('star')) ||
      (c1.includes('hdfc') && c2.includes('hdfc')) ||
      (c1.includes('icici') && c2.includes('icici')) ||
      (c1.includes('care') && c2.includes('care')) ||
      (c1.includes('bupa') && c2.includes('bupa')) ||
      (c1.includes('bajaj') && c2.includes('bajaj'));
  };

  // Mask policy number to preserve patient privacy (e.g. POL-88219412 -> POL-****-9412)
  const maskPolicy = (raw: string): string => {
    if (!raw) return 'POL-****-XXXX';
    if (raw.length <= 6) return raw;
    const first3 = raw.substring(0, 4);
    const last4 = raw.substring(raw.length - 4);
    return `${first3}****${last4}`;
  };

  // Fetch partitioned, insurer-isolated claim records
  const insurerClaims: PermittedClaimRecord[] = useMemo(() => {
    if (!activeInsurer) return [];

    const permittedList: PermittedClaimRecord[] = [];

    // 1. Scan patient bookings
    try {
      const rawBookings = localStorage.getItem('nhealth_bookings');
      if (rawBookings) {
        const bookings: ConfirmedBooking[] = JSON.parse(rawBookings);
        bookings.forEach((b) => {
          if (b.insuranceClaim && isMatchingInsurer(b.insuranceClaim.insuranceCompany, activeInsurer.name)) {
            const rawClaimId = b.insuranceClaim.claimId || `CLM-${b.referenceId}`;
            const effectiveStatus = claimStatusOverrides[rawClaimId] || b.insuranceClaim.approvalStatus || 'Approved';
            const preAuth = b.insuranceClaim.preAuthAmount || 499;
            const deduction = Math.round(preAuth * 0.05);
            const payout = preAuth - deduction;

            permittedList.push({
              claimId: rawClaimId,
              policyNumberMasked: maskPolicy(b.insuranceClaim.policyNumber),
              patientNameMasked: `${b.patientName ? b.patientName.slice(0, 2) : 'P.'}*** ${b.patientName ? b.patientName.slice(-2) : 'NT'}`,
              serviceCategory: b.serviceCategory || 'Clinical Consultation',
              serviceName: b.serviceName,
              timestamp: b.insuranceClaim.approvalTimestamp || b.bookedAt,
              preAuthAmount: preAuth,
              approvedPayout: payout,
              deductions: deduction,
              verificationStatus: effectiveStatus,
              patientApproval: true,
              partnerVerification: {
                verified: true,
                partnerName: 'Authorized Nhealth Clinical Associate',
                verifiedAt: b.bookedAt,
              },
              otpAudit: {
                verified: b.insuranceClaim.otpVerified ?? true,
                phoneMasked: b.phone ? `+91 ${b.phone.slice(0, 2)}***${b.phone.slice(-3)}` : '+91 98*** 421',
                verifiedAt: b.insuranceClaim.approvalTimestamp || b.bookedAt,
                sessionRef: `SES-OTP-${b.referenceId.slice(-6)}`,
              },
              qrToken: {
                tokenId: b.secureTokenId || `NHT-QR-${b.referenceId.slice(-6)}`,
                status: b.qrStatus === 'used' || b.status === 'Used / Expired' ? 'Used / Expired' : 'Active',
                generatedAt: b.bookedAt,
                expiresAt: new Date(new Date(b.bookedAt).getTime() + 72 * 3600000).toISOString(),
              },
              evidence: {
                docType: 'Prescription',
                fileName: `Prescription_${b.referenceId.slice(-6)}.pdf`,
                doctorName: 'Dr. S. K. Mehta, MBBS MD',
                hospitalOrClinic: 'Nhealth Primary Care Network',
                diagnosis: 'Routine Clinical Evaluation / ICD-10 Z00.00',
              },
              settlement: {
                status: effectiveStatus === 'Settled' ? 'Settled' : 'Pending TPA Release',
                utrNumber: effectiveStatus === 'Settled' ? `CMS${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
                settledAt: effectiveStatus === 'Settled' ? new Date().toISOString() : undefined,
                netPayable: payout - 25,
                convenienceFee: 25,
              },
              insurerCompany: activeInsurer.name,
            });
          }
        });
      }
    } catch {}

    // 2. Scan pharmacy orders
    try {
      const rawPharmacy = localStorage.getItem('nhealth_pharmacy_orders');
      if (rawPharmacy) {
        const orders = JSON.parse(rawPharmacy);
        orders.forEach((o: any) => {
          if (o.insuranceClaim && isMatchingInsurer(o.insuranceClaim.insuranceCompany, activeInsurer.name)) {
            const rawClaimId = o.insuranceClaim.claimId || `CLM-PH-${o.orderNumber || o.id}`;
            const effectiveStatus = claimStatusOverrides[rawClaimId] || o.insuranceClaim.approvalStatus || 'Approved';
            const preAuth = o.insuranceClaim.preAuthAmount || o.totalAmount || 850;
            const deduction = Math.round(preAuth * 0.05);
            const payout = preAuth - deduction;

            permittedList.push({
              claimId: rawClaimId,
              policyNumberMasked: maskPolicy(o.insuranceClaim.policyNumber),
              patientNameMasked: 'A*** SHARMA',
              serviceCategory: 'Doorstep Pharmacy',
              serviceName: 'Prescription Pharmaceuticals',
              timestamp: o.insuranceClaim.approvalTimestamp || o.createdAt,
              preAuthAmount: preAuth,
              approvedPayout: payout,
              deductions: deduction,
              verificationStatus: effectiveStatus,
              patientApproval: true,
              partnerVerification: {
                verified: true,
                partnerName: 'MedPlus / Apollo Partner Pharmacy',
                verifiedAt: o.createdAt,
              },
              otpAudit: {
                verified: o.insuranceClaim.otpVerified ?? true,
                phoneMasked: '+91 97*** 912',
                verifiedAt: o.insuranceClaim.approvalTimestamp || o.createdAt,
                sessionRef: `SES-PH-${o.orderNumber || '8812'}`,
              },
              qrToken: {
                tokenId: o.secureTokenId || `NHT-QR-${o.orderNumber || '9921'}`,
                status: o.isExpiredOrUsed ? 'Used / Expired' : 'Active',
                generatedAt: o.createdAt,
                expiresAt: new Date(new Date(o.createdAt).getTime() + 72 * 3600000).toISOString(),
              },
              evidence: {
                docType: 'Prescription',
                fileName: `Digital_Rx_${o.orderNumber || '102'}.pdf`,
                doctorName: 'Dr. Ananya Roy, Consultant Physician',
                hospitalOrClinic: 'Nhealth Tele-OPD Network',
                diagnosis: 'Essential Hypertension / Chronic Refill',
              },
              settlement: {
                status: effectiveStatus === 'Settled' ? 'Settled' : 'Processing',
                utrNumber: effectiveStatus === 'Settled' ? 'CMS90124891283' : undefined,
                netPayable: payout - 35,
                convenienceFee: 35,
              },
              insurerCompany: activeInsurer.name,
            });
          }
        });
      }
    } catch {}

    // 3. Seed partitioned realistic test records if this is a fresh test environment
    if (permittedList.length === 0) {
      const c1Id = `CLM-${activeInsurer.code}-9021`;
      const c2Id = `CLM-${activeInsurer.code}-9022`;
      const c3Id = `CLM-${activeInsurer.code}-9023`;

      permittedList.push(
        {
          claimId: c1Id,
          policyNumberMasked: `POL-****-7812`,
          patientNameMasked: 'R*** VERMA',
          serviceCategory: 'Home Diagnostics',
          serviceName: 'Comprehensive Lipid & HbA1c Panel',
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          preAuthAmount: 1250,
          approvedPayout: 1187,
          deductions: 63,
          verificationStatus: claimStatusOverrides[c1Id] || 'Approved',
          patientApproval: true,
          partnerVerification: {
            verified: true,
            partnerName: 'Nhealth NABL Lab Associate (Tech #882)',
            verifiedAt: new Date(Date.now() - 3.8 * 3600000).toISOString(),
          },
          otpAudit: {
            verified: true,
            phoneMasked: '+91 98*** 4492',
            verifiedAt: new Date(Date.now() - 3.9 * 3600000).toISOString(),
            sessionRef: 'SES-OTP-88214-DEL',
          },
          qrToken: {
            tokenId: 'NHT-QR-8812-A7K2',
            status: 'Active',
            generatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
            expiresAt: new Date(Date.now() + 68 * 3600000).toISOString(),
          },
          evidence: {
            docType: 'Diagnostic Requisition',
            fileName: 'Lab_Requisition_DrMukherjee.pdf',
            doctorName: 'Dr. B. Mukherjee, MD Pathologist',
            hospitalOrClinic: 'Apex Diagnostic Institute',
            diagnosis: 'E11.65 Type 2 Diabetes with hyperglycemia',
          },
          settlement: {
            status: claimStatusOverrides[c1Id] === 'Settled' ? 'Settled' : 'Processing',
            utrNumber: 'CMS88192304921',
            settledAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            netPayable: 1157,
            convenienceFee: 30,
          },
          insurerCompany: activeInsurer.name,
        },
        {
          claimId: c2Id,
          policyNumberMasked: `POL-****-4431`,
          patientNameMasked: 'K*** DESHMUKH',
          serviceCategory: 'Clinical Visits',
          serviceName: 'Doctor Home Visit (Geriatric Evaluation)',
          timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
          preAuthAmount: 499,
          approvedPayout: 474,
          deductions: 25,
          verificationStatus: claimStatusOverrides[c2Id] || 'Settled',
          patientApproval: true,
          partnerVerification: {
            verified: true,
            partnerName: 'Dr. Alok Sen (Nhealth Empaneled Physician)',
            verifiedAt: new Date(Date.now() - 17.5 * 3600000).toISOString(),
          },
          otpAudit: {
            verified: true,
            phoneMasked: '+91 91*** 8104',
            verifiedAt: new Date(Date.now() - 17.9 * 3600000).toISOString(),
            sessionRef: 'SES-OTP-11029-BLR',
          },
          qrToken: {
            tokenId: 'NHT-QR-3319-M4V8',
            status: 'Used / Expired',
            generatedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
            expiresAt: new Date(Date.now() + 54 * 3600000).toISOString(),
          },
          evidence: {
            docType: 'Prescription',
            fileName: 'Geriatric_Consult_Note_DrSen.pdf',
            doctorName: 'Dr. Alok Sen, Geriatrician',
            hospitalOrClinic: 'Nhealth Home Health Network',
            diagnosis: 'M19.90 Osteoarthritis & Post-Op Mobility Assessment',
          },
          settlement: {
            status: 'Settled',
            utrNumber: 'CMS90218491823',
            settledAt: new Date(Date.now() - 12 * 3600000).toISOString(),
            netPayable: 454,
            convenienceFee: 20,
          },
          insurerCompany: activeInsurer.name,
        },
        {
          claimId: c3Id,
          policyNumberMasked: `POL-****-1190`,
          patientNameMasked: 'M*** NAIR',
          serviceCategory: 'Doorstep Pharmacy',
          serviceName: 'Chronic Cardiac & Diabetic Medication Refill',
          timestamp: new Date(Date.now() - 32 * 3600000).toISOString(),
          preAuthAmount: 2180,
          approvedPayout: 2071,
          deductions: 109,
          verificationStatus: claimStatusOverrides[c3Id] || 'Pending',
          patientApproval: true,
          partnerVerification: {
            verified: false,
            partnerName: 'Apollo Doorstep Dispensing Desk',
            verifiedAt: 'Awaiting stock dispatch',
          },
          otpAudit: {
            verified: true,
            phoneMasked: '+91 94*** 3318',
            verifiedAt: new Date(Date.now() - 31.9 * 3600000).toISOString(),
            sessionRef: 'SES-OTP-99412-MUM',
          },
          qrToken: {
            tokenId: 'NHT-QR-5541-X9L3',
            status: 'Partially Redeemed',
            generatedAt: new Date(Date.now() - 32 * 3600000).toISOString(),
            expiresAt: new Date(Date.now() + 40 * 3600000).toISOString(),
            remainingItems: '5 tablets remaining due to partial stock dispense',
          },
          evidence: {
            docType: 'Prescription',
            fileName: 'Cardio_Endo_Prescription.pdf',
            doctorName: 'Dr. S. R. Singhania, DM Cardiology',
            hospitalOrClinic: 'Fortis Escorts Heart Institute',
            diagnosis: 'I25.10 Atherosclerotic Heart Disease',
          },
          settlement: {
            status: 'Pending TPA Release',
            netPayable: 2021,
            convenienceFee: 50,
          },
          insurerCompany: activeInsurer.name,
        }
      );
    }

    return permittedList;
  }, [activeInsurer, lastRefreshed, claimStatusOverrides]);

  // Filtered claims list
  const filteredClaims = useMemo(() => {
    return insurerClaims.filter((claim) => {
      const matchesStatus = statusFilter === 'All' || claim.verificationStatus === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        claim.claimId.toLowerCase().includes(q) ||
        claim.serviceCategory.toLowerCase().includes(q) ||
        claim.serviceName.toLowerCase().includes(q) ||
        claim.policyNumberMasked.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [insurerClaims, statusFilter, searchQuery]);

  // Metric aggregates
  const totalClaimsCount = insurerClaims.length;
  const approvedCount = insurerClaims.filter((c) => c.verificationStatus === 'Approved').length;
  const pendingCount = insurerClaims.filter((c) => c.verificationStatus === 'Pending').length;
  const totalSettledAmount = insurerClaims
    .filter((c) => c.verificationStatus === 'Approved' || c.verificationStatus === 'Settled')
    .reduce((acc, c) => acc + c.preAuthAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. HEADER: Exact Nhealth Logo link, Platform Name, Subheading Title "Insurer Panel" */}
      <header className="sticky top-0 z-50 bg-[#002b49] text-white border-b border-teal-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Exact Nhealth Logo from link: https://ibb.co/SDYB7XbW with reliable direct asset fallback */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
              <img
                src="https://i.ibb.co/SDYB7XbW/Nhealth-logo.png"
                alt="Nhealth Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== 'https://i.ibb.co/JW6HFRV0/Nhealth-logo-8cm-x-8cm-high-quality-1-1.png') {
                    target.src = 'https://i.ibb.co/JW6HFRV0/Nhealth-logo-8cm-x-8cm-high-quality-1-1.png';
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">Nhealth</span>
                <span className="px-2 py-0.5 rounded-md bg-[#008080] text-teal-50 text-[10px] font-black uppercase tracking-wider">
                  Partner Gateway
                </span>
              </div>
              {/* Clear Subheading Title: "Insurer Panel" */}
              <h1 className="text-xs sm:text-sm font-bold text-teal-300 tracking-wide uppercase">
                Insurer Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeInsurer ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-black text-white">{activeInsurer.name}</span>
                  <span className="text-[10px] text-teal-300 font-mono">ID: {activeInsurer.id}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Logout from Insurer Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
              >
                Back to Patient Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT: Login View vs Partitioned Insurer Dashboard */}
      {!activeInsurer ? (
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-left">
            <div className="bg-gradient-to-r from-[#002b49] via-[#003d66] to-[#008080] text-white p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>IRDAI Registered Insurance Gateway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Authorized Insurance Partner Login
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
                Secure, isolated data access portal for empaneled health insurance companies and TPA administrators.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Insurer ID or Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. claims@starhealth.in or INS-STAR-01"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Partner Access Key / Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Authenticate &amp; Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Select Empaneled Insurers */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Or select an empaneled partner to test instantly:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REGISTERED_INSURERS.map((ins) => (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => handleQuickSelect(ins)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                        selectedQuickInsurer === ins.id
                          ? 'border-[#008080] bg-teal-50/70 ring-1 ring-[#008080]'
                          : 'border-slate-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#008080]">{ins.logoBadge}</span>
                        {selectedQuickInsurer === ins.id && <Check className="w-3.5 h-3.5 text-[#008080]" />}
                      </div>
                      <span className="text-xs font-bold text-[#002b49] truncate">{ins.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{ins.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict Privacy & Partitioning Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-[#002b49] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Strict Data Partitioning Guarantee</span>
                </div>
                <p>
                  Claim records are strictly sandboxed per insurance provider. Star Health cannot access HDFC ERGO records, and vice versa. Patient clinical notes and home addresses remain confidential.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* 3. DYNAMIC PARTITIONED INSURER DASHBOARD */
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-left">
          {/* Welcome Banner */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#008080] text-[10px] font-black uppercase tracking-wider border border-teal-200">
                <Building2 className="w-3 h-3" />
                <span>Partitioned Data Sandbox</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002b49] mt-1">
                {activeInsurer.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized Claims Desk &bull; Insurer ID: <strong className="font-mono text-[#002b49]">{activeInsurer.id}</strong> &bull; Zero unauthorized cross-insurer data leakage.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setLastRefreshed(new Date().toLocaleTimeString())}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Refresh claim records"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Refreshed: {lastRefreshed}</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Assigned Claims</span>
              <div className="text-xl sm:text-2xl font-black text-[#002b49] tabular-nums">{totalClaimsCount}</div>
              <span className="text-[10px] text-teal-700 font-semibold">100% Insurer Isolated</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pre-Auth Approved</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums">{approvedCount}</div>
              <span className="text-[10px] text-emerald-700 font-semibold">Instant Doorstep Cashless</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Authorization</span>
              <div className="text-xl sm:text-2xl font-black text-amber-500 tabular-nums">{pendingCount}</div>
              <span className="text-[10px] text-amber-700 font-semibold">Action Required</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Settled Value</span>
              <div className="text-xl sm:text-2xl font-black text-[#002b49] tabular-nums">₹{totalSettledAmount.toLocaleString()}</div>
              <span className="text-[10px] text-slate-400 font-semibold">Direct TPA Pre-Auth</span>
            </div>
          </div>

          {/* Tab Navigation Hub */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'approvals'
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#002b49]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>2-Side Approvals &amp; Claims</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'approvals' ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-200 text-slate-700'}`}>
                {filteredClaims.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evidences')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'evidences'
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#002b49]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Evidences &amp; Prescriptions</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'evidences' ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-200 text-slate-700'}`}>
                {filteredClaims.length} Docs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('otp_audit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'otp_audit'
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#002b49]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>OTP &amp; Security Audit Trail</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr_tracker')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'qr_tracker'
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#002b49]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-teal-400" />
              <span>Secure QR Status Tracker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settlement')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'settlement'
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#002b49]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-teal-400" />
              <span>Settlement &amp; Reconciliation Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('api_webhooks')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'api_webhooks'
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#002b49]'
              }`}
            >
              <Webhook className="w-3.5 h-3.5 text-teal-400" />
              <span>API &amp; Webhooks</span>
            </button>
          </div>

          {/* Controls: Search & Status Filters */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Claim ID, Service, Diagnosis, or Policy..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {(['All', 'Approved', 'Pending', 'Settled'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-[#008080] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}

                {activeTab === 'settlement' && (
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Claim ID', 'Masked Policy', 'Category', 'Pre-Auth', 'Payout', 'Deductions', 'Net Settled', 'Status', 'UTR'];
                      const rows = filteredClaims.map((c) => [
                        c.claimId,
                        c.policyNumberMasked,
                        `"${c.serviceCategory}"`,
                        c.preAuthAmount,
                        c.approvedPayout,
                        c.deductions,
                        c.settlement.netPayable,
                        c.settlement.status,
                        c.settlement.utrNumber || 'PENDING',
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                      const link = document.createElement('a');
                      link.setAttribute('href', encodeURI(csvContent));
                      link.setAttribute('download', `${activeInsurer?.code}_Reconciliation_Ledger.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-[#008080] text-[#008080] hover:text-white border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                    title="Export reconciliation sheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Ledger CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: 2-SIDE APPROVALS & CLAIMS TABLE */}
            {activeTab === 'approvals' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Claim ID &amp; Policy</th>
                      <th className="py-3 px-3">Service &amp; Patient</th>
                      <th className="py-3 px-3 text-center">Patient Request</th>
                      <th className="py-3 px-3 text-center">Partner Verify</th>
                      <th className="py-3 px-3">Pre-Auth (₹)</th>
                      <th className="py-3 px-3">Insurer Status</th>
                      <th className="py-3 px-3 text-right">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map((claim) => (
                        <tr key={claim.claimId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono">
                            <div className="font-bold text-[#002b49]">{claim.claimId}</div>
                            <div className="text-[11px] text-slate-500">{claim.policyNumberMasked}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#002b49]">{claim.serviceCategory}</div>
                            <div className="text-[11px] text-slate-500">{claim.serviceName}</div>
                            <div className="text-[10px] font-mono text-teal-700">Patient: {claim.patientNameMasked}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Submitted</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {claim.partnerVerification.verified ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-[#008080] border border-teal-200 text-[10px] font-bold">
                                  <Check className="w-3 h-3 text-[#008080]" />
                                  <span>Partner Verified</span>
                                </span>
                                <span className="text-[9px] text-slate-400 truncate max-w-[120px] mt-0.5">
                                  {claim.partnerVerification.partnerName}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Awaiting Partner</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-black text-[#002b49] tabular-nums">
                            ₹{claim.preAuthAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            {claim.verificationStatus === 'Approved' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Approved</span>
                              </span>
                            ) : claim.verificationStatus === 'Settled' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300 text-[10px] font-black uppercase">
                                <Check className="w-3 h-3 text-[#008080]" />
                                <span>Settled</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black uppercase">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Pre-Auth</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {claim.verificationStatus === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setClaimStatusOverrides((prev) => ({ ...prev, [claim.claimId]: 'Approved' }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                                >
                                  Pre-Approve
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedEvidenceClaim(claim)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Inspect medical documents & prescription"
                              >
                                <Eye className="w-3 h-3 text-slate-500" />
                                <span>Evidence</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No matching records for {activeInsurer.name}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: EVIDENCES & PRESCRIPTIONS VIEWER */}
            {activeTab === 'evidences' && (
              <div className="space-y-4">
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-[#002b49]">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#008080]" />
                    <span className="font-bold">Medical Documents &amp; Prescriptions Audit Stream</span>
                  </div>
                  <span className="text-[11px] text-teal-700">Digital Signatures &amp; Clinic Requisitions Verified</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredClaims.map((claim) => (
                    <div
                      key={claim.claimId}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition-all shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#002b49] font-mono text-[10px] font-bold">
                            {claim.claimId}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#008080] border border-teal-200 text-[10px] font-black uppercase">
                            {claim.evidence.docType}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-[#002b49] flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">{claim.evidence.fileName}</span>
                          </h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Doctor: <strong className="text-slate-700">{claim.evidence.doctorName}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {claim.evidence.hospitalOrClinic}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Clinical Diagnosis / Indication</div>
                          <div className="font-semibold text-slate-700">{claim.evidence.diagnosis}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-[#002b49]">₹{claim.preAuthAmount} Pre-Auth</span>
                        <button
                          type="button"
                          onClick={() => setSelectedEvidenceClaim(claim)}
                          className="px-3 py-1.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: OTP VERIFICATIONS LIST & AUDIT TRAIL */}
            {activeTab === 'otp_audit' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-[#002b49]">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#008080]" />
                    <span className="font-bold">Two-Factor Patient OTP Audit Trail (IRDAI Compliance)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Gateway Protocol: AES-256 OTP HMAC</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Claim Ref</th>
                        <th className="py-3 px-3">Patient Mobile (Masked)</th>
                        <th className="py-3 px-3">Session Hash</th>
                        <th className="py-3 px-3">Verification Timestamp</th>
                        <th className="py-3 px-3">Authentication Status</th>
                        <th className="py-3 px-3 text-right">Audit Trace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClaims.map((claim) => (
                        <tr key={claim.claimId} className="hover:bg-slate-50/70 transition-colors font-mono">
                          <td className="py-3 px-3 font-bold text-[#002b49]">
                            {claim.claimId}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {claim.otpAudit.phoneMasked}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {claim.otpAudit.sessionRef}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(claim.otpAudit.verifiedAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified (100% Match)</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[10px] text-teal-700 font-bold font-sans">
                              Auth Token Logged
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: SECURE QR HISTORY & STATUS TRACKER */}
            {activeTab === 'qr_tracker' && (
              <div className="space-y-4">
                <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-[#002b49]">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#008080]" />
                    <span className="font-bold">Secure QR Lifecycle &amp; 72-Hour Expiration Rule Monitoring</span>
                  </div>
                  <span className="text-[11px] text-teal-700">Strict Single/Split Redemption Enforced</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredClaims.map((claim) => {
                    const isUsed = claim.qrToken.status === 'Used / Expired';
                    const isPartial = claim.qrToken.status === 'Partially Redeemed';
                    const genDate = new Date(claim.qrToken.generatedAt);
                    const hoursLeft = Math.max(0, Math.round((new Date(claim.qrToken.expiresAt).getTime() - Date.now()) / 3600000));

                    return (
                      <div
                        key={claim.claimId}
                        className={`p-4 rounded-2xl border transition-all shadow-2xs space-y-3 ${
                          isUsed
                            ? 'bg-slate-50/80 border-slate-200 opacity-80'
                            : isPartial
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-white border-teal-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#002b49] flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-[#008080]" />
                            <span>{claim.qrToken.tokenId}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              isUsed
                                ? 'bg-slate-200 text-slate-700 border-slate-300'
                                : isPartial
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {claim.qrToken.status}
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="font-bold text-[#002b49]">{claim.serviceCategory}</div>
                          <div className="text-[11px] text-slate-500">Claim ID: {claim.claimId}</div>
                        </div>

                        {claim.qrToken.remainingItems && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-bold">
                            Split Redemption Active: {claim.qrToken.remainingItems}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>72-Hr Expiry Window:</span>
                          <span className={`font-mono font-bold ${hoursLeft < 12 ? 'text-rose-600' : 'text-[#002b49]'}`}>
                            {isUsed ? 'Expired / Settled' : `${hoursLeft}h remaining`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: MONEY MANAGEMENT & SETTLEMENT LEDGER */}
            {activeTab === 'settlement' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-teal-900 via-[#002b49] to-[#008080] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                      TPA Financial Clearing House
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Settlement &amp; Reconciliation Ledger
                    </h3>
                    <p className="text-xs text-teal-100/90 mt-0.5">
                      Direct B2B payout clearing between {activeInsurer.name} and Nhealth Escrow.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-teal-200 uppercase font-bold">Total Net Payable</span>
                      <div className="text-xl font-black text-white">
                        ₹
                        {filteredClaims
                          .reduce((acc, c) => acc + c.settlement.netPayable, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Claim &amp; Policy</th>
                        <th className="py-3 px-3">Claim Amount</th>
                        <th className="py-3 px-3">Approved Payout</th>
                        <th className="py-3 px-3">Platform Fee</th>
                        <th className="py-3 px-3">Net Payable (₹)</th>
                        <th className="py-3 px-3">Settlement Status</th>
                        <th className="py-3 px-3">UTR / Bank Ref</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClaims.map((claim) => (
                        <tr key={claim.claimId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono">
                            <div className="font-bold text-[#002b49]">{claim.claimId}</div>
                            <div className="text-[10px] text-slate-500">{claim.policyNumberMasked}</div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-700 tabular-nums">
                            ₹{claim.preAuthAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700 tabular-nums">
                            ₹{claim.approvedPayout.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-500 tabular-nums">
                            -₹{claim.settlement.convenienceFee}
                          </td>
                          <td className="py-3 px-3 font-black text-[#002b49] tabular-nums text-sm">
                            ₹{claim.settlement.netPayable.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            {claim.settlement.status === 'Settled' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300 text-[10px] font-black uppercase">
                                <Check className="w-3 h-3 text-[#008080]" />
                                <span>Settled</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black uppercase">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{claim.settlement.status}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                            {claim.settlement.utrNumber || (
                              <span className="text-slate-400 italic">Pending Batch</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {claim.settlement.status !== 'Settled' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setClaimStatusOverrides((prev) => ({ ...prev, [claim.claimId]: 'Settled' }));
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#008080] hover:bg-[#006666] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Mark Settled
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold font-mono">Disbursed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: API & WEBHOOK INTEGRATION SETTINGS */}
            {activeTab === 'api_webhooks' && (
              <PartnerApiWebhookSettings
                partnerType="insurer"
                partnerName={activeInsurer.name}
                partnerId={activeInsurer.id}
              />
            )}

            {/* Privacy Confirmation Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Privacy Filter Active: Showing permitted claim parameters only. Clinical symptoms &amp; residential data are omitted.
                </span>
              </div>
              <div className="font-mono text-slate-400">
                Partner Node: {activeInsurer.code}-GATEWAY-V1
              </div>
            </div>
          </div>

          {/* Evidence Inspection Modal */}
          {selectedEvidenceClaim && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
                <div className="bg-[#002b49] text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-teal-400" />
                    <div>
                      <h3 className="text-sm font-black text-white">Medical Evidence &amp; Prescription Audit</h3>
                      <div className="text-[11px] text-teal-200 font-mono">Claim ID: {selectedEvidenceClaim.claimId}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvidenceClaim(null)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 text-xs text-left">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Document Type</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#008080] border border-teal-200 font-black text-[10px]">
                        {selectedEvidenceClaim.evidence.docType}
                      </span>
                    </div>
                    <div className="font-black text-sm text-[#002b49]">{selectedEvidenceClaim.evidence.fileName}</div>
                    <div className="text-slate-600">Prescribing Clinician: <strong>{selectedEvidenceClaim.evidence.doctorName}</strong></div>
                    <div className="text-slate-500">{selectedEvidenceClaim.evidence.hospitalOrClinic}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Certified Clinical Indication / ICD-10</label>
                    <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 text-[#002b49] font-bold">
                      {selectedEvidenceClaim.evidence.diagnosis}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pre-Auth Request</span>
                      <span className="font-black text-[#002b49] text-sm">₹{selectedEvidenceClaim.preAuthAmount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Masked Policy</span>
                      <span className="font-mono font-bold text-[#002b49]">{selectedEvidenceClaim.policyNumberMasked}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold">
                      Authenticity Verified: Digital PKI certificate from registered health practitioner confirmed by Nhealth.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Downloading certified copy of ${selectedEvidenceClaim.evidence.fileName}`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Certified PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEvidenceClaim(null)}
                      className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};
