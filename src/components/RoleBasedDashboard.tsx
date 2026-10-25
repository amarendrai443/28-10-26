import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Stethoscope,
  Building2,
  TestTube2,
  Pill,
  Car,
  HeartHandshake,
  HeartPulse,
  Activity,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Download,
  Upload,
  Plus,
  RefreshCw,
  LogOut,
  ChevronDown,
  Sparkles,
  Users,
  Compass,
  FileCheck2,
  Send,
  Eye,
  Check,
  X,
  Droplet,
  Smartphone
} from 'lucide-react';
import { UserAccount, ConfirmedBooking } from '../types/serviceBooking';
import { DashboardRole, LinkedAccount } from '../types/dashboard';
import { PartnerApplication, INITIAL_PARTNERS } from '../types/partner';

interface RoleBasedDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateBooking?: (serviceName?: string) => void;
  onSwitchRole?: (role: DashboardRole) => void;
  allPartners?: PartnerApplication[];
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateHome,
  onNavigateBooking,
  onSwitchRole,
  allPartners = INITIAL_PARTNERS,
}) => {
  // Normalize current role - Dynamically directs approved partners to their specific service portal
  const determineInitialRole = (): DashboardRole => {
    const rawRole = currentUser.role || currentUser.accountType || '';
    const lower = rawRole.toLowerCase();
    if (lower.includes('doctor')) return 'Doctor';
    if (lower.includes('diagnostic') || lower.includes('lab') || lower.includes('blood')) return 'Diagnostics';
    if (lower.includes('pharmacy')) return 'Pharmacy';
    if (lower.includes('rider') || lower.includes('transit') || lower.includes('ambulance')) return 'Ambulance';
    if (lower.includes('caregiver') || lower.includes('care assist') || lower.includes('elder') || lower.includes('assist')) return 'Caregiver';
    if (lower.includes('hospital')) return 'Hospital';
    return 'Patient';
  };

  const [activeRole, setActiveRole] = useState<DashboardRole>(determineInitialRole());

  useEffect(() => {
    setActiveRole(determineInitialRole());
  }, [currentUser.id, currentUser.role, currentUser.accountType]);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate linked accounts for this phone/email under Single Identity, dynamically injecting approved partner
  const linkedAccounts: LinkedAccount[] = [
    ...(currentUser.accountType === 'Partner' || currentUser.role !== 'Patient'
      ? [
          {
            id: currentUser.id || 'PARTNER-LIVE-001',
            name: currentUser.name || 'Empaneled Partner',
            role: determineInitialRole(),
            roleTitle: `${currentUser.role || 'Partner'} Portal`,
            entityName: currentUser.entityName || currentUser.name || 'Nhealth Empaneled Unit',
            phone: currentUser.phone || '9393934621',
            email: currentUser.email || 'partner@nhealth.in',
            status: 'Live' as const,
            badge: 'Verified Partner',
          },
        ]
      : []),
    {
      id: currentUser.id || 'USR-88210',
      name: currentUser.name || 'Valued User',
      role: 'Patient',
      roleTitle: 'Patient & Family Health Account',
      entityName: 'Personal & Dependents Care Portal',
      phone: currentUser.phone || '9876543210',
      email: currentUser.email || 'patient@nhealth.in',
      status: 'Active',
      badge: 'Primary Account',
    },
    {
      id: 'PARTNER-DOC-001',
      name: 'Dr. Meera Nambiar',
      role: 'Doctor',
      roleTitle: 'Doctor Specialist Portal',
      entityName: 'Internal Medicine & Geriatrics Clinic',
      phone: currentUser.phone || '9845012345',
      email: 'dr.meera@nambiarclinic.com',
      status: 'Live',
      badge: 'MCI Verified',
      specialty: 'Internal Medicine & Geriatrics',
      registrationNumber: 'MCI-84729-KA',
    },
    {
      id: 'PARTNER-DIAG-003',
      name: 'Dr. C. Sharma',
      role: 'Diagnostics',
      roleTitle: 'Laboratory & Pathology Panel',
      entityName: 'Thyrocare Regional Diagnostic Hub',
      phone: currentUser.phone || '9393932969',
      email: 'partner.labs@thyrocare.com',
      status: 'Live',
      badge: 'NABL ISO 15189',
      specialty: 'Automated Clinical Biochemistry',
      registrationNumber: 'NABL-MC-2418',
    },
    {
      id: 'PARTNER-PHARM-008',
      name: 'MedPlus Fulfillment Hub',
      role: 'Pharmacy',
      roleTitle: 'Pharmacy Management Dashboard',
      entityName: 'Nhealth Licensed Pharmacy Network',
      phone: currentUser.phone || '9393934621',
      email: 'pharmacy@nhealth.in',
      status: 'Live',
      badge: 'Licensed Pharmacy',
      specialty: 'Prescription Dispensing & Cold Chain',
      registrationNumber: 'TS-DRUG-LIC-8812',
    },
    {
      id: 'PARTNER-AMB-002',
      name: 'K. Venkatesh',
      role: 'Ambulance',
      roleTitle: 'Ambulance & Care Rider Fleet',
      entityName: 'LifeLine Critical Care & Care Rider Fleet',
      phone: currentUser.phone || '9581582220',
      email: 'dispatch@lifelineambulancenet.in',
      status: 'Live',
      badge: 'ALS / BLS GPS Fleet',
      specialty: 'Advanced Cardiac Life Support & Sample Transit',
      registrationNumber: 'RTO-TS-AMB-2024-912',
    },
    {
      id: 'PARTNER-ASSIST-006',
      name: 'S. Preethi',
      role: 'Caregiver',
      roleTitle: 'Eldercare & Care Assist Portal',
      entityName: 'Nhealth Bedside Care Assist Services',
      phone: currentUser.phone || '9440112233',
      email: 'careassist@nhealth.in',
      status: 'Live',
      badge: 'Verified Caregivers',
      specialty: 'Geriatric Bedside Attendants & Rehab',
      registrationNumber: 'NURSE-COUNCIL-TS-4412',
    },
    {
      id: 'PARTNER-HOSP-004',
      name: 'S. Rajagopal',
      role: 'Hospital',
      roleTitle: 'Hospital / Institution Console',
      entityName: 'Apollo Reach Multispecialty Hospital',
      phone: currentUser.phone || '9885544332',
      email: 'admin.outreach@apolloreach.com',
      status: 'Live',
      badge: 'NABH Accredited',
      specialty: 'Multi-Specialty & ICU Inpatient Bed Network',
      registrationNumber: 'NABH-HOSP-2023-4180',
    },
  ];

  // Role Switching Handler
  const handleSelectRole = (newRole: DashboardRole) => {
    setActiveRole(newRole);
    setRoleSwitcherOpen(false);
    showToast(`Switched active view to ${newRole} Dashboard.`);
    if (onSwitchRole) onSwitchRole(newRole);
  };

  // State for interactive modals in role views
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: 'Ramesh Kumar',
    age: '54',
    diagnosis: 'Type 2 Diabetes Mellitus & Mild Hypertension',
    medicines: 'Tab Metformin 500mg (1-0-1), Tab Telmisartan 40mg (1-0-0)',
    instructions: 'Monitor fasting blood glucose every Tuesday. Hydrate well.',
  });

  const [sampleProcessingState, setSampleProcessingState] = useState<{ [barcode: string]: string }>({
    'NH-SAMP-8821': 'Sample Collected',
    'NH-SAMP-8822': 'In Transit (Care Rider)',
    'NH-SAMP-8823': 'Processing (Biochemistry)',
  });

  const [pharmacyOrdersState, setPharmacyOrdersState] = useState<{ [orderId: string]: string }>({
    'RX-99120': 'Prescription Verified',
    'RX-99121': 'Packed',
  });

  const [bedAvailability, setBedAvailability] = useState({
    icuOccupied: 14,
    icuTotal: 18,
    ventilatorOccupied: 6,
    ventilatorTotal: 8,
    generalOccupied: 62,
    generalTotal: 80,
  });

  const [doctorOnline, setDoctorOnline] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-[#008080]/15 selection:text-[#002b49] text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-[10000] bg-[#002b49] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-400/40 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Console Navigation Bar */}
      <nav className="bg-[#00172b] text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Brand & Home */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2 group cursor-pointer"
              title="Return to Public Healthcare Portal"
            >
              <img
                src="https://i.ibb.co/JW6HFRV0/Nhealth-logo-8cm-x-8cm-high-quality-1-1.png"
                alt="Nhealth Logo"
                className="h-9 w-auto object-contain rounded-lg border border-teal-500/30"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.ibb.co/wZG4rNV3/Nhealth-logo-8cm-x-8cm-high-quality-1-1.png';
                }}
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors leading-tight">
                  Nhealth™
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline leading-none">
                  Unified &amp; At-Home Healthcare Network
                </span>
              </div>
            </button>
            <span className="text-slate-600 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Console:
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40">
                {activeRole}
              </span>
            </div>
          </div>

          {/* Center: Multi-Account / Role Switcher Dropdown (Requirement 2) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-xs"
              title="Switch between your linked single-identity service roles"
            >
              <Users className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden md:inline">Account Role:</span>
              <span className="text-teal-300">{activeRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Dropdown Menu */}
            {roleSwitcherOpen && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Single Identity Linked Accounts
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate block">
                    Phone: {currentUser.phone || '+91 93939 34621'}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto py-1 space-y-1">
                  {linkedAccounts.map((account) => {
                    const isCurrent = activeRole === account.role;
                    return (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => handleSelectRole(account.role)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? 'bg-teal-50 border border-teal-200 text-[#002b49]'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#002b49] truncate">
                              {account.roleTitle}
                            </span>
                            {isCurrent && (
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {account.entityName}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 border border-slate-200">
                          {account.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Portal Return & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Public Site</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all cursor-pointer"
              title="Sign Out of Nhealth Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Role Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner with Greeting & Entity Details */}
        <div className="bg-gradient-to-r from-[#002b49] via-[#003859] to-[#002b49] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Single Identity Active: {activeRole} Portal
              </span>
              <span className="text-xs font-mono text-slate-300">
                User ID: {currentUser.id || 'NH-USR-9912'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name || 'Healthcare Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Integrated Nhealth Unified Healthcare Operating System • Pan-India Doorstep Network
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            {activeRole === 'Patient' ? (
              <button
                type="button"
                onClick={() => onNavigateBooking ? onNavigateBooking('Home Diagnostics') : onNavigateHome()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Book Home Service</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin Verified &amp; Live</span>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ROLE 1: PATIENT / GENERAL USER DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Patient' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Bookings
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  2 Services
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Phlebotomy &amp; Doctor Visit
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Encrypted Health Records
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#008080] mt-1 block">
                  8 Files
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  NABL Authenticated
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Vital Lens™ AI Check
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-700 mt-1 block">
                  Normal
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  SpO2: 98% • HR: 72 bpm
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Dedicated Care Coord.
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
                  24/7 Live
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Line: 9393934621
                </span>
              </div>
            </div>

            {/* Active Bookings Tracker & Medical Vault */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Bookings Timeline (7 cols) */}
              <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#008080]" />
                    <h3 className="font-extrabold text-base text-[#002b49]">
                      My Active Home Healthcare Orders
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Live Status
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#002b49]">
                        Comprehensive Full Body Health Audit (64 Parameters)
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Clinician Dispatched
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Reference:</span>
                        <span className="font-mono font-bold">NH-684210</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Phlebotomist:</span>
                        <span className="font-semibold">M. Suresh (Vaccinated)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Slot:</span>
                        <span className="font-semibold">Today, 08:30 AM</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Thyrocare NABL Certified Hub</span>
                      <button
                        type="button"
                        onClick={() => showToast('Opening Phlebotomist Live Tracking Map...')}
                        className="text-[#008080] font-bold hover:underline cursor-pointer"
                      >
                        Track Phlebotomist GPS →
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#002b49]">
                        Senior Geriatric Physician Consultation at Home
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        Doctor Scheduled
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Doctor:</span>
                        <span className="font-bold">Dr. Meera Nambiar (MD)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Patient:</span>
                        <span className="font-semibold">{currentUser.name || 'Ramesh Kumar'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Time:</span>
                        <span className="font-semibold">Tomorrow, 11:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Digital Health Records Vault (5 cols) */}
              <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-[#008080]" />
                    <h3 className="font-extrabold text-base text-[#002b49]">
                      Lifetime Reports Vault
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: 'Thyroid & Fasting Sugar Report', date: '14 Oct 2026', lab: 'Thyrocare NABL', size: '1.2 MB' },
                    { title: 'Lipid Profile & Liver Function', date: '02 Sep 2026', lab: 'Lupin Diagnostics', size: '1.8 MB' },
                    { title: 'Dr. Meera Prescription & Advice', date: '12 Aug 2026', lab: 'Digital Rx Pad', size: '420 KB' },
                  ].map((report, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-[#002b49] block">
                          {report.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {report.date} • {report.lab} ({report.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading authenticated copy of ${report.title}...`)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-[#008080] transition-colors cursor-pointer"
                        title="Download Encrypted PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('Opening Secure File Upload Portal for old prescriptions...')}
                    className="w-full py-2.5 rounded-xl border border-dashed border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload External Hospital File / Prescription</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE 2: DOCTOR SPECIALIST DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Doctor' && (
          <div className="space-y-6">
            {/* Status & Availability Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#002b49]">
                    Dr. Meera Nambiar (MD, Internal Medicine)
                  </h3>
                  <p className="text-xs text-slate-500">
                    MCI Registration: MCI-84729-KA • Nhealth Accredited Primary Consultant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setDoctorOnline(true);
                      showToast('Status updated: Accepting Tele-OPD & Home Visits.');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      doctorOnline ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    ● Available for Calls
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDoctorOnline(false);
                      showToast('Status updated: In Clinic / Offline for today.');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      !doctorOnline ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Offline
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal('prescription')}
                  className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create e-Prescription</span>
                </button>
              </div>
            </div>

            {/* Doctor Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Today's Queue
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  8 Patients
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  4 Home Visits • 4 Video OPD
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Completed Consults
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
                  184 Consults
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Rating: 4.9 ★ (Verified)
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Consultation Fee
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#008080] mt-1 block">
                  ₹750 / visit
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Direct Bank Remittance
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Lab Tests Referred
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
                  42 Patients
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Automated Results Sync
                </span>
              </div>
            </div>

            {/* Active Patient Consultation Queue */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#008080]" />
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Scheduled Consultations Roster (Today)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Auto-synced with Nhealth Care Coordinator
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    token: 1,
                    patient: 'Ramesh Kumar (54 yrs, Male)',
                    type: 'Home Visit',
                    time: '11:00 AM',
                    symptoms: 'Post-prandial glucose spike, leg swelling, hypertension review',
                    phone: '9876543210',
                    address: 'Plot 42, Jubilee Hills, Hyderabad',
                  },
                  {
                    token: 2,
                    patient: 'Ananya Sharma (Senior Citizen, 72 yrs)',
                    type: 'Tele-Consultation (Video)',
                    time: '12:30 PM',
                    symptoms: 'Osteoarthritis knee stiffness, chronic cough follow-up',
                    phone: '9845012345',
                    address: 'Koramangala 4th Block, Bengaluru',
                  },
                  {
                    token: 3,
                    patient: 'K. Sunita (42 yrs, Female)',
                    type: 'Home Visit',
                    time: '04:00 PM',
                    symptoms: 'Severe fever with chills, suspected dengue/malaria phlebotomy check',
                    phone: '9440112233',
                    address: 'Banjara Hills Rd 12, Hyderabad',
                  },
                ].map((item) => (
                  <div
                    key={item.token}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#002b49] text-white">
                          Token #{item.token}
                        </span>
                        <span className="font-bold text-sm text-[#002b49]">{item.patient}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#008080] border border-teal-200">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Symptoms:</strong> {item.symptoms}
                      </p>
                      <span className="text-[11px] text-slate-400 block">
                        📍 {item.address} • Contact: {item.phone} • Time: {item.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPrescriptionForm((prev) => ({ ...prev, patientName: item.patient }));
                          setActiveModal('prescription');
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Prescribe</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Connecting secure encrypted tele-video call with ${item.patient}...`)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        Call Patient
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE 3: LABORATORY / DIAGNOSTICS PANEL */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Diagnostics' && (
          <div className="space-y-6">
            {/* Lab Hub Overview */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                  <TestTube2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#002b49]">
                    Thyrocare Diagnostic Technologies Hub
                  </h3>
                  <p className="text-xs text-slate-500">
                    NABL Certificate ISO 15189: NABL-MC-2418 • Automated Barcoding &amp; Centrifugation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Simulating barcoded accessioning batch import...')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Accessioning</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('uploadReport')}
                  className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload NABL Report</span>
                </button>
              </div>
            </div>

            {/* Diagnostics Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Samples In-Transit
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
                  12 Samples
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Via Nhealth Care Riders
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  In-Processing
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  28 Batches
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Biochemistry, Hematology
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Avg. Turnaround (TAT)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#008080] mt-1 block">
                  4.8 Hours
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Exceeding 6h Benchmark
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Reports Released
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
                  146 Today
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Electronic MD Sign-Off
                </span>
              </div>
            </div>

            {/* Phlebotomy Sample Accessioning Queue */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#008080]" />
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Phlebotomy Barcode Tracking &amp; Batch Release
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Live Cold-Chain Log: +4.2°C Validated</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Barcode</th>
                      <th className="py-2.5 px-3">Patient Name</th>
                      <th className="py-2.5 px-3">Test Package</th>
                      <th className="py-2.5 px-3">Collected By</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { barcode: 'NH-SAMP-8821', patient: 'Ramesh Kumar', test: 'Lipid Profile + HbA1c', phleb: 'M. Suresh', status: sampleProcessingState['NH-SAMP-8821'] },
                      { barcode: 'NH-SAMP-8822', patient: 'Ananya Sharma', test: 'Liver Function & Vitamin D3', phleb: 'T. Vani', status: sampleProcessingState['NH-SAMP-8822'] },
                      { barcode: 'NH-SAMP-8823', patient: 'Sunil Rao', test: 'CBC & Dengue Serology', phleb: 'P. Anand', status: sampleProcessingState['NH-SAMP-8823'] },
                    ].map((sample) => (
                      <tr key={sample.barcode} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-[#008080]">{sample.barcode}</td>
                        <td className="py-3 px-3 font-semibold text-[#002b49]">{sample.patient}</td>
                        <td className="py-3 px-3 text-slate-600">{sample.test}</td>
                        <td className="py-3 px-3 text-slate-500">{sample.phleb}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-teal-50 text-teal-800 border border-teal-200">
                            {sample.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSampleProcessingState((prev) => ({
                                ...prev,
                                [sample.barcode]: 'Report Signed-Off',
                              }));
                              showToast(`Barcode ${sample.barcode} processed: Report authenticated and dispatched via WhatsApp.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#008080] hover:bg-[#006666] text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Sign-Off Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE 4: PHARMACY MANAGEMENT DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Pharmacy' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#002b49]">
                    Nhealth Licensed Pharmacy Fulfillment Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    Retail Drug License: TS-DRUG-LIC-8812 • Verified Prescription Dispatch &amp; Cold-Chain
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Care Rider allocated for packed medicine orders.')}
                className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Dispatch Express Care Rider</span>
              </button>
            </div>

            {/* Pharmacy Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Prescriptions Received
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  34 Orders
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Doctor Signed-Off
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Packed &amp; Sealed
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
                  12 Packages
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Tamper-Evident Seals
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Cold-Chain Insulins
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#008080] mt-1 block">
                  100% Stocked
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Insulin, Vaccines, IV
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Avg Delivery Time
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
                  38 Mins
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Pan-City Rider Fleet
                </span>
              </div>
            </div>

            {/* Prescriptions Inflow & Rider Allocation */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#008080]" />
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Doctor e-Prescriptions Fulfillment Queue
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Live order router connected</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'RX-99120',
                    patient: 'Ramesh Kumar',
                    doctor: 'Dr. Meera Nambiar (MD)',
                    medicines: 'Metformin 500mg, Telmisartan 40mg, Atorvastatin 10mg',
                    total: '₹640',
                    status: pharmacyOrdersState['RX-99120'] || 'Prescription Verified',
                  },
                  {
                    id: 'RX-99121',
                    patient: 'Ananya Sharma',
                    doctor: 'Dr. S. K. Roy (Orthopedic)',
                    medicines: 'Calcium Carbonate + D3, Paracetamol 650mg, Pain Gel',
                    total: '₹420',
                    status: pharmacyOrdersState['RX-99121'] || 'Packed',
                  },
                ].map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#008080]">{order.id}</span>
                        <span className="font-bold text-sm text-[#002b49]">{order.patient}</span>
                        <span className="text-xs text-slate-500">({order.doctor})</span>
                      </div>
                      <p className="text-xs text-slate-600">{order.medicines}</p>
                      <span className="text-[11px] font-bold text-emerald-700">Amount: {order.total} • Status: {order.status}</span>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPharmacyOrdersState((prev) => ({ ...prev, [order.id]: 'Dispatched (Care Rider Assigned)' }));
                          showToast(`Order ${order.id} packed and handed to Nhealth Care Rider.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Pack &amp; Assign Rider
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE 5: AMBULANCE & CARE RIDER DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Ambulance' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-600 flex items-center justify-center font-bold">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#002b49]">
                    LifeLine Critical Ambulance &amp; Care Rider Fleet
                  </h3>
                  <p className="text-xs text-slate-500">
                    RTO Fleet Code: RTO-TS-AMB-2024-912 • GPS Live Dispatch &amp; Cold-Chain Transfer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>GPS Radar Active</span>
                </span>
              </div>
            </div>

            {/* Ambulance / Rider Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Ambulances
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 mt-1 block">
                  8 ICU Units
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Ventilator Ready
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Care Riders On-Duty
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  24 Riders
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Cold-Boxes Monitored
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Avg Emergency Response
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#008080] mt-1 block">
                  11.5 Mins
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Hyderabad &amp; BLR Urban
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Hospital Tie-Ups
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
                  14 Hospitals
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Priority Green Corridor
                </span>
              </div>
            </div>

            {/* Live Dispatch Radar */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-red-600" />
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Live Emergency Distress Calls &amp; Sample Transit Trips
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Live Telemetry Connected</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-red-300 bg-red-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-red-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                      CRITICAL SOS: Suspected Cardiac Emergency
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-200 text-red-900 border border-red-300">
                      ETA: 6 Mins
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Patient:</span>
                      <span className="font-bold">K. Venkat Rao (68 yrs)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location:</span>
                      <span className="font-semibold">Banjara Hills Rd 10, Hyd</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assigned Unit:</span>
                      <span className="font-semibold">ALS-Cardiac Unit #4</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hospital Target:</span>
                      <span className="font-semibold text-[#008080]">Apollo Reach ICU</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">EMT on-board: V. Anand (ALS Paramedic)</span>
                    <button
                      type="button"
                      onClick={() => showToast('Connecting emergency radio with Driver & EMT...')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Connect Radio &amp; Nav
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#002b49]">
                      Care Rider Dispatch: Cold-Chain Phlebotomy Vacuum Samples
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      In Transit (+4.1°C)
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Rider: R. Satish (Care Rider #12) • 8 Blood Samples collected from Jubilee Hills • En route to Thyrocare Hub
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE 6: ELDERCARE & CARE ASSIST PORTAL */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Caregiver' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#002b49]">
                    Nhealth Eldercare &amp; Bedside Care Assist Services
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certified Attendants, Geriatric Mobility Aides, Palliative &amp; Bedside Nursing Care
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('vitals')}
                className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Log Patient Vitals</span>
              </button>
            </div>

            {/* Care Assist Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Seniors
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  14 Patients
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Daily Care Attendants
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Shifts
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
                  8 Attendants
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Geo-fenced Check-In
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Vital Logs Today
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#008080] mt-1 block">
                  36 Entries
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  BP, Sugar, SpO2 Sync
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Family Trust Rating
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
                  4.95 ★
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Compassionate Care
                </span>
              </div>
            </div>

            {/* Seniors Care Schedule */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#008080]" />
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Bedside Assistance &amp; Mobility Roster
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Live shift tracking</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    senior: 'Ananya Sharma (72 yrs)',
                    attendant: 'S. Preethi (Caregiver Lead)',
                    type: 'Geriatric Bedside & Physiotherapy Support',
                    shift: 'Morning Shift (8:00 AM - 2:00 PM)',
                    vitals: 'BP: 124/82 • SpO2: 98% • Blood Sugar: 114 mg/dL',
                    address: 'Koramangala, Bengaluru',
                  },
                  {
                    senior: 'G. Narayana Murthy (84 yrs)',
                    attendant: 'P. Raju (Bedside Aide)',
                    type: 'Post-Stroke Mobility & Medication Administration',
                    shift: '24-Hour Residential Stay',
                    vitals: 'BP: 130/85 • SpO2: 97% • Pulse: 74 bpm',
                    address: 'Madhapur, Hyderabad',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#002b49]">{item.senior}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#008080] border border-teal-200">
                          {item.shift}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Attendant:</strong> {item.attendant} • <strong>Care:</strong> {item.type}
                      </p>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 block">
                        Recent Vitals: {item.vitals}
                      </span>
                      <span className="text-[11px] text-slate-400 block">📍 {item.address}</span>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveModal('vitals')}
                        className="px-3.5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Update Vitals
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE 7: HOSPITAL / INSTITUTION DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeRole === 'Hospital' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#002b49]">
                    Apollo Reach Multispecialty Hospital Console
                  </h3>
                  <p className="text-xs text-slate-500">
                    NABH Hospital Code: NABH-HOSP-2023-4180 • 200 Bed Facility &amp; Level 1 Trauma Center
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBedAvailability((prev) => ({
                    ...prev,
                    icuOccupied: Math.max(0, prev.icuOccupied - 1),
                  }));
                  showToast('Live Bed Availability updated across Nhealth network.');
                }}
                className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Discharge &amp; Free 1 ICU Bed</span>
              </button>
            </div>

            {/* Bed Matrix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Critical ICU Beds
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 mt-1 block">
                  {bedAvailability.icuTotal - bedAvailability.icuOccupied} Available
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  {bedAvailability.icuOccupied} / {bedAvailability.icuTotal} Occupied
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ventilator Units
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
                  {bedAvailability.ventilatorTotal - bedAvailability.ventilatorOccupied} Available
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  {bedAvailability.ventilatorOccupied} / {bedAvailability.ventilatorTotal} Occupied
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  General &amp; HDU Wards
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1 block">
                  {bedAvailability.generalTotal - bedAvailability.generalOccupied} Available
                </span>
                <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                  Daycare Surgery Ready
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Inbound Nhealth Referrals
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
                  18 Admissions
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Ambulance &amp; Doctor Route
                </span>
              </div>
            </div>

            {/* Inbound Referrals Stream */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-red-600" />
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Inbound Emergency Transfers &amp; Surgery Referrals
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Live Hospital Gateway</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-red-100 text-red-800">
                        Ambulance Inbound
                      </span>
                      <span className="font-bold text-sm text-[#002b49]">
                        K. Venkat Rao (Cardiac Alert)
                      </span>
                      <span className="text-xs text-slate-500">Via LifeLine ALS Unit #4</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Emergency ICU Bed reserved • Cath lab alerted for primary angioplasty
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('ICU Team ready at Emergency Bay.')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Confirm Bed Readiness
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: DOCTOR E-PRESCRIPTION PAD */}
      {/* ------------------------------------------------------------- */}
      {activeModal === 'prescription' && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#002b49]">
                    Nhealth Digital e-Prescription Pad
                  </h3>
                  <span className="text-[10px] text-slate-400">Dr. Meera Nambiar (MCI-84729-KA)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveModal(null);
                showToast(`e-Prescription signed and automatically routed to Pharmacy & Patient WhatsApp.`);
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={prescriptionForm.patientName}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age / Gender</label>
                  <input
                    type="text"
                    value={prescriptionForm.age + ' Yrs / Male'}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prescribed Medicines &amp; Dosages (Rx)</label>
                <textarea
                  rows={3}
                  required
                  value={prescriptionForm.medicines}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicines: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dietary &amp; Clinical Instructions</label>
                <input
                  type="text"
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 flex items-center justify-between">
                <span>🔒 Clinician Digital Authentication Active</span>
                <span className="font-mono font-bold">MCI Verified</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold shadow-md"
                >
                  Sign &amp; Dispatch e-Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: LOG PATIENT VITALS (CARE ASSIST) */}
      {/* ------------------------------------------------------------- */}
      {activeModal === 'vitals' && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-base text-[#002b49]">
                  Log Senior Patient Vitals
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveModal(null);
                showToast('Senior vitals recorded and synced with Nhealth Medical Director.');
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Senior Patient</label>
                <input
                  type="text"
                  readOnly
                  value="Ananya Sharma (Senior Citizen)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    defaultValue="124/82"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    defaultValue={98}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pulse / Heart Rate (BPM)</label>
                  <input
                    type="number"
                    defaultValue={72}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    defaultValue={112}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold shadow-md"
                >
                  Save &amp; Sync Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: UPLOAD NABL REPORT (DIAGNOSTICS) */}
      {/* ------------------------------------------------------------- */}
      {activeModal === 'uploadReport' && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#008080]" />
                <h3 className="font-extrabold text-base text-[#002b49]">
                  Upload Authenticated NABL Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveModal(null);
                showToast('Diagnostic Report uploaded and dispatched directly to patient WhatsApp and Nhealth Vault.');
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sample Barcode ID</label>
                <input
                  type="text"
                  required
                  defaultValue="NH-SAMP-8821"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-[#008080]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  defaultValue="Ramesh Kumar (54 yrs)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="p-6 border-2 border-dashed border-teal-400 rounded-2xl bg-teal-50/50 text-center space-y-2">
                <FileCheck2 className="w-8 h-8 text-[#008080] mx-auto" />
                <span className="font-bold text-xs text-[#002b49] block">
                  Click to select NABL Signed PDF Report
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Simulated File: Thyrocare_FullBodyAudit_8821.pdf (1.4 MB)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold shadow-md"
                >
                  Authenticate &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Footer Strip */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        &copy; 2026 Nhealth Unified Healthcare Technologies Private Limited. All clinical operations secured by 256-bit HIPAA and NABH encryption standards.
      </footer>
    </div>
  );
};
