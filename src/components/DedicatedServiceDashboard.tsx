import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  Layers,
  HeartHandshake,
  UserCheck,
  HeartPulse,
  Activity,
  Sparkles,
  Phone,
  FileText,
  Download,
  QrCode,
  User,
  ArrowRight,
  Eye,
  Check,
  AlertCircle,
  Truck,
  Send,
  Plus,
  Wallet,
  Building2,
  Droplet,
  Car,
  Headphones,
  RefreshCw,
  Navigation,
  Heart
} from 'lucide-react';
import { ServiceItem } from '../types/serviceBooking';
import { EXTRACTED_SERVICES, TIME_SLOTS } from '../data/servicesData';
import { createOneTimeSecureToken } from '../utils/secureQrToken';
import { SecureQrTokenCard } from './SecureQrTokenCard';
import { SecureHealthToken, TokenDepartment } from '../types/secureToken';

export type DedicatedServiceKey =
  | 'doctor-home-visits'
  | 'home-diagnostics'
  | 'xray-portable-diagnostics'
  | 'bedside-assistance'
  | 'eldercare-senior-assistance'
  | 'specialized-nursing-care'
  | 'physiotherapy-at-home'
  | 'dental-care-oral-health'
  | 'prepaid-premium-opd'
  | 'diagnostics-advance-imaging'
  | 'blood-bank-support'
  | 'ambulance-24-7'
  | 'nhealth-careride'
  | 'nhealth-careassist';

interface DedicatedServiceDashboardProps {
  serviceKey: DedicatedServiceKey;
  onBackToHome: () => void;
  onOpenBookingModal: (service: ServiceItem, prefillNote?: string) => void;
  isLoggedIn?: boolean;
  onPromptLogin?: () => void;
  patientName?: string;
  patientPhone?: string;
}

export const DedicatedServiceDashboard: React.FC<DedicatedServiceDashboardProps> = ({
  serviceKey,
  onBackToHome,
  onOpenBookingModal,
  isLoggedIn = false,
  onPromptLogin,
  patientName = 'Valued Patient',
  patientPhone = '9876543210',
}) => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'integration' | 'logs' | 'pass'>('scheduler');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [activeToken, setActiveToken] = useState<SecureHealthToken | null>(null);

  // Match the service item
  const currentService: ServiceItem =
    EXTRACTED_SERVICES.find((s) => s.id === serviceKey) || {
      id: serviceKey,
      name: serviceKey.replace(/-/g, ' ').toUpperCase(),
      category: 'Home Healthcare',
      tagline: 'Specialized healthcare brought directly to your home',
      description: 'Comprehensive clinical services delivered safely by certified experts.',
      cardImage: '/services/card_2.png',
      iconImage: '/services/icon_2.png',
      iconName: 'Activity',
      badge: 'Certified Clinicians',
      turnaroundTime: 'Prompt Doorstep Dispatch',
    };

  // 1. DOCTOR HOME VISITS State
  const [doctorGpsStatus, setDoctorGpsStatus] = useState<'en_route' | 'arrived'>('en_route');

  // 2. HOME DIAGNOSTICS & LAB State
  const [selectedLabReport, setSelectedLabReport] = useState<string | null>(null);

  // 3. X-RAY & PORTABLE DIAGNOSTICS State
  const [selectedEquipment, setSelectedEquipment] = useState('Digital Portable X-Ray (High-Frequency)');

  // 4. BEDSIDE ASSISTANCE State
  const [selectedShift, setSelectedShift] = useState<'8h' | '12h' | '24h'>('12h');

  // 5. ELDERCARE State: Daily Vitals & Family Notification Sync
  const [vitalsList, setVitalsList] = useState([
    { date: 'Today, 08:30 AM', bp: '120/78 mmHg', pulse: '72 bpm', spo2: '99%', sugar: '108 mg/dL', status: 'Optimal' },
    { date: 'Yesterday, 06:15 PM', bp: '124/80 mmHg', pulse: '76 bpm', spo2: '98%', sugar: '122 mg/dL', status: 'Normal' },
  ]);
  const [newVitalsInput, setNewVitalsInput] = useState({ bp: '120/80', pulse: '74', spo2: '98', sugar: '110' });
  const [familySyncEnabled, setFamilySyncEnabled] = useState(true);
  const [familySyncMessage, setFamilySyncMessage] = useState<string | null>(null);

  // 6. SPECIALIZED NURSING CARE State
  const [procedureList] = useState([
    { name: 'Surgical Wound Dressing & Aseptic Care', verifiedNurse: 'Sister Deepa Nair (RN-8821)', date: 'Today, 10:00 AM', status: 'Completed' },
    { name: 'IV Infusion & Catheter Flushing', verifiedNurse: 'Nurse John Thomas (RN-9014)', date: 'Yesterday, 04:00 PM', status: 'Completed' },
  ]);

  // 7. PHYSIOTHERAPY AT HOME State
  const [exercisesList, setExercisesList] = useState([
    { name: 'Passive Knee Flexion & Extension', target: '3 sets x 12 reps', rom: '0° to 115°', completed: true },
    { name: 'Isometric Quadriceps Strengthening', target: '3 sets x 10 holds', rom: 'Static hold 5s', completed: true },
    { name: 'Ankle Pumps & Dynamic Gait Training', target: '15 mins supervised', rom: 'Full Active', completed: false },
  ]);

  // 8. DENTALCARE & ORAL HEALTH State
  const [dentalHistory] = useState([
    { procedure: 'Comprehensive Bedside Oral Examination', date: '18 Oct 2026', dentist: 'Dr. Priya Varma (BDS, MDS)', verdict: 'Mild supragingival plaque detected. Recommended ultrasonic scaling.' },
    { procedure: 'Geriatric Full Denture Re-alignment', date: '04 Sep 2026', dentist: 'Dr. A. Srinivas (MDS Prosthodontics)', verdict: 'Lower ridge fit adjusted with soft silicone liner. Occlusion stable.' },
  ]);

  // 9. PREPAID PREMIUM OPD State
  const [opdWalletBalance, setOpdWalletBalance] = useState(5000);
  const [selectedHospital, setSelectedHospital] = useState('Apollo Hospitals Jubilee Hills');
  const [deskCoordinator] = useState('Executive Anand Kumar (VIP Desk Counter #4)');
  const [cashlessPreAuthStatus] = useState('Cashless Pre-Auth Active • Star Health & HDFC ERGO');

  // 10. DIAGNOSTICS & ADVANCE IMAGING State
  const [selectedModality, setSelectedModality] = useState('3.0 Tesla Silent MRI (Wide Bore)');
  const [selectedScanRegion, setSelectedScanRegion] = useState('Brain & Cervical Spine');
  const [isDicomPreviewOpen, setIsDicomPreviewOpen] = useState(false);

  // 11. BLOOD BANK & SUPPORT State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [selectedBloodComponent, setSelectedBloodComponent] = useState<'PRBC' | 'SDP' | 'FFP'>('PRBC');
  const [bloodRequestSent, setBloodRequestSent] = useState(false);
  const [bloodUnitsStock] = useState<Record<string, number>>({
    'A+': 16, 'B+': 24, 'O+': 28, 'AB+': 11,
    'A-': 5, 'B-': 4, 'O-': 6, 'AB-': 3,
  });

  // 12. 24/7 AMBULANCE & SOS State
  const [sosTriggered, setSosTriggered] = useState(false);
  const [ambulanceType, setAmbulanceType] = useState('Advanced Cardiac Life Support (ACLS)');
  const [ambulanceEta, setAmbulanceEta] = useState(6);
  const [emergencyAlertSynced, setEmergencyAlertSynced] = useState(true);

  // 13. NHEALTH CARERIDE State
  const [rideVehicleType, setRideVehicleType] = useState('Wheelchair Accessible Van with Hydraulic Ramp');
  const [rideTripType, setRideTripType] = useState('Hospital Dialysis Roundtrip');
  const [rideDriverVerified] = useState({
    name: 'Suresh Gowda',
    badge: 'Police Verified · BLS Certified Escort',
    vehicleNo: 'TS-08-CR-9021',
    rating: '4.95 ★',
    trips: '1,420 Completed',
  });

  // 14. NHEALTH CAREASSIST State
  const [caseManager] = useState({
    name: 'Dr. Ananya Reddy',
    role: 'Lead Care Navigator & Family Case Manager',
    phone: '+91-9876543210',
    caseId: '#NH-CA-8821',
    activePlan: 'Comprehensive Elderly Wellness & Chronic Care Protocol',
  });
  const [caseManagerMessage, setCaseManagerMessage] = useState('');
  const [conciergeChatLogs, setConciergeChatLogs] = useState([
    { sender: 'Case Manager', text: 'Hello! I have confirmed your appointment slots and coordinated with the Apollo OPD desk.', time: '09:15 AM' },
  ]);

  // Fast secure pass generator
  const handleGenerateServicePass = () => {
    const refId = 'NH-' + Math.floor(100000 + Math.random() * 900000);
    
    let dept: TokenDepartment = 'general';
    if (serviceKey === 'ambulance-24-7' || serviceKey === 'nhealth-careride') {
      dept = 'ambulance';
    } else if (serviceKey === 'doctor-home-visits' || serviceKey === 'prepaid-premium-opd') {
      dept = 'doctor';
    } else if (
      serviceKey === 'home-diagnostics' ||
      serviceKey === 'xray-portable-diagnostics' ||
      serviceKey === 'diagnostics-advance-imaging' ||
      serviceKey === 'blood-bank-support'
    ) {
      dept = 'diagnostics';
    } else if (
      serviceKey === 'specialized-nursing-care' ||
      serviceKey === 'bedside-assistance' ||
      serviceKey === 'eldercare-senior-assistance' ||
      serviceKey === 'physiotherapy-at-home' ||
      serviceKey === 'dental-care-oral-health'
    ) {
      dept = 'nursing';
    }

    const token = createOneTimeSecureToken(
      refId,
      'general_service',
      currentService.name,
      {
        patientName,
        patientPhone,
        deliveryAddress: 'Nhealth Coordinated Clinical Services',
        totalAmount: 499,
        notes: `Service: ${currentService.name}. Slot: ${selectedSlot}. Department: ${dept}. Verified Partner Pass.`,
      },
      false,
      undefined,
      dept
    );
    setActiveToken(token);
    setActiveTab('pass');
  };

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setVitalsList([
      {
        date: 'Just Now',
        bp: `${newVitalsInput.bp} mmHg`,
        pulse: `${newVitalsInput.pulse} bpm`,
        spo2: `${newVitalsInput.spo2}%`,
        sugar: `${newVitalsInput.sugar} mg/dL`,
        status: 'Logged',
      },
      ...vitalsList,
    ]);
    if (familySyncEnabled) {
      setFamilySyncMessage(`Real-time vitals synced with registered family contacts (+91-98****3210) via SMS/WhatsApp.`);
      setTimeout(() => setFamilySyncMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation & Breadcrumb Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2 rounded-xl text-slate-600 hover:text-[#008080] hover:bg-teal-50 transition-colors cursor-pointer border border-slate-200"
              title="Back to Home / Services"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#008080]">
                Nhealth Specialized Services
              </div>
              <h1 className="text-base sm:text-lg font-black text-[#002b49] leading-tight truncate max-w-[220px] sm:max-w-md">
                {currentService.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenBookingModal(currentService, `Slot: ${selectedSlot}`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008080] to-[#006666] hover:from-[#006666] hover:to-[#004d4d] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-[#002b49] via-[#003d66] to-[#008080] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>{currentService.category} · {currentService.badge || 'Verified Clinical Care'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {currentService.name}
            </h2>
            <p className="text-sm sm:text-base text-teal-50/90 leading-relaxed font-normal">
              {currentService.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-900/60 border border-teal-400/30 text-xs font-semibold text-teal-200">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                <span>{currentService.turnaroundTime || 'Fastest Doorstep Service'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-900/60 border border-teal-400/30 text-xs font-semibold text-teal-200">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>100% Certified Practitioners</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleGenerateServicePass}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-[#002b49] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#008080]" />
              <span>Generate 72h Secure Token Pass</span>
            </button>
            <p className="text-[11px] text-teal-100/80 text-center sm:text-right">
              Encrypted QR Token with one-time redemption for partner staff
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <section className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none py-3">
          <button
            type="button"
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'scheduler'
                ? 'bg-[#008080] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#008080] hover:bg-slate-100'
            }`}
          >
            Doorstep Scheduler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('integration')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'integration'
                ? 'bg-[#008080] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#008080] hover:bg-slate-100'
            }`}
          >
            Live Tracking &amp; Specialized Workflows
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'logs'
                ? 'bg-[#008080] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#008080] hover:bg-slate-100'
            }`}
          >
            Clinical Records &amp; History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pass')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'pass'
                ? 'bg-[#008080] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#008080] hover:bg-slate-100'
            }`}
          >
            Secure Token QR Pass
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* TAB 1: SCHEDULER */}
        {activeTab === 'scheduler' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#008080]" />
                  <span>Choose Your Preferred Home Visit Slot</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Clinicians arrive equipped with sterilized clinical kits and digital diagnostic devices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      selectedSlot === slot
                        ? 'border-[#008080] bg-teal-50/70 ring-2 ring-[#008080]/30 shadow-xs'
                        : 'border-slate-200 hover:border-teal-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#002b49]">{slot.split('(')[0].trim()}</span>
                      {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-[#008080]" />}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {slot.includes('(') ? slot.substring(slot.indexOf('(')) : 'Standard Availability'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Service-Specific Feature Add-on */}
              {serviceKey === 'doctor-home-visits' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Stethoscope className="w-4 h-4 text-[#008080]" />
                    <span>Included in Doctor Home Visit:</span>
                  </div>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    <li>Comprehensive physical evaluation, vitals, heart &amp; chest auscultation</li>
                    <li>Digital e-prescription sent immediately via WhatsApp &amp; SMS</li>
                    <li>Doorstep medicine delivery &amp; lab tests arranged seamlessly</li>
                  </ul>
                </div>
              )}

              {serviceKey === 'home-diagnostics' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <TestTube2 className="w-4 h-4 text-[#008080]" />
                    <span>NABL / CAP Certified Sample Collection:</span>
                  </div>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    <li>Sterile single-use vacuum vials (Vacutainer®) with barcode tracking</li>
                    <li>Temperature-monitored cold-chain transport for sample integrity</li>
                    <li>Reports signed by MD Pathologists within 12 to 24 hours</li>
                  </ul>
                </div>
              )}

              {serviceKey === 'xray-portable-diagnostics' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Layers className="w-4 h-4 text-[#008080]" />
                    <span>Bedside Portable Equipment Selection:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      'Digital Portable X-Ray (High-Frequency)',
                      '12-Lead Portable ECG',
                      '24-Hour Bedside Holter Monitor',
                      'Portable Pulmonary Spirometry',
                    ].map((eq) => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setSelectedEquipment(eq)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          selectedEquipment === eq
                            ? 'bg-[#008080] text-white border-[#008080]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'bedside-assistance' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <HeartHandshake className="w-4 h-4 text-[#008080]" />
                    <span>Select Attendant Shift Duration:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { key: '8h', label: '8-Hour Day Shift' },
                      { key: '12h', label: '12-Hour Night Shift' },
                      { key: '24h', label: '24-Hour Live-In Care' },
                    ].map((shift) => (
                      <button
                        key={shift.key}
                        type="button"
                        onClick={() => setSelectedShift(shift.key as any)}
                        className={`p-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          selectedShift === shift.key
                            ? 'bg-[#008080] text-white border-[#008080] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {shift.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'prepaid-premium-opd' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Building2 className="w-4 h-4 text-[#008080]" />
                    <span>Select Partner Hospital for VIP OPD Fast-Track:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      'Apollo Hospitals Jubilee Hills',
                      'Max Super Speciality Hospital',
                      'Fortis Memorial Research Institute',
                      'Care Multispeciality Hospitals',
                    ].map((hosp) => (
                      <button
                        key={hosp}
                        type="button"
                        onClick={() => setSelectedHospital(hosp)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          selectedHospital === hosp
                            ? 'bg-[#008080] text-white border-[#008080]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {hosp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'diagnostics-advance-imaging' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Layers className="w-4 h-4 text-[#008080]" />
                    <span>Select Advance Imaging Modality:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      '3.0 Tesla Silent MRI (Wide Bore)',
                      '128-Slice Low-Dose CT Scan',
                      '4D Color Doppler Ultrasound',
                      'Digital 3D Mammography',
                    ].map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => setSelectedModality(mod)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          selectedModality === mod
                            ? 'bg-[#008080] text-white border-[#008080]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'blood-bank-support' && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <Droplet className="w-4 h-4 text-rose-600" />
                    <span>Blood Component Requisition Selection:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {(['PRBC', 'SDP', 'FFP'] as const).map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setSelectedBloodComponent(comp)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          selectedBloodComponent === comp
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {comp === 'PRBC' ? 'Packed Red Cells' : comp === 'SDP' ? 'Single Platelets' : 'Fresh Plasma'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'ambulance-24-7' && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <Car className="w-4 h-4 text-rose-600" />
                    <span>Select Critical Ambulance Category:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      'Advanced Cardiac Life Support (ACLS)',
                      'Basic Life Support (BLS)',
                      'Neonatal / Pediatric ICU Ambulance',
                      'Patient Inter-Hospital Transport',
                    ].map((amb) => (
                      <button
                        key={amb}
                        type="button"
                        onClick={() => setAmbulanceType(amb)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          ambulanceType === amb
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {amb}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'nhealth-careride' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Car className="w-4 h-4 text-[#008080]" />
                    <span>Assisted Medical Transit Vehicle:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      'Wheelchair Accessible Van with Hydraulic Ramp',
                      'Stretcher Accompanied Medical Cab',
                      'Sanitized Dialysis Commuter Sedan',
                      'Chemotherapy Non-Emergency Transit',
                    ].map((veh) => (
                      <button
                        key={veh}
                        type="button"
                        onClick={() => setRideVehicleType(veh)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          rideVehicleType === veh
                            ? 'bg-[#008080] text-white border-[#008080]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {veh}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {serviceKey === 'nhealth-careassist' && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Headphones className="w-4 h-4 text-[#008080]" />
                    <span>Dedicated Care Concierge Tier:</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Assigned Case Navigator: <strong>{caseManager.name}</strong> · Protocol: {caseManager.activePlan}
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onOpenBookingModal(currentService, `Slot: ${selectedSlot}`)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#008080] hover:bg-[#006666] text-white text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Confirm Slot &amp; Book Doorstep Care</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleGenerateServicePass}
                  className="py-3.5 px-5 rounded-2xl border border-slate-300 hover:border-[#008080] text-slate-700 hover:text-[#008080] text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR Pass</span>
                </button>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <h4 className="text-sm font-black text-[#002b49] uppercase tracking-wider">
                Appointment Summary
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-[#002b49] text-right">{currentService.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Selected Slot:</span>
                  <span className="font-bold text-[#008080] text-right">{selectedSlot.split('(')[0]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-[#002b49]">{patientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-bold text-[#002b49]">+91 {patientPhone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Standard Visit Fee:</span>
                  <span className="font-extrabold text-[#002b49]">₹499 (or Cashless Insurance)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-[#002b49] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Nhealth Doorstep Guarantee</span>
                </div>
                <p>All visits include OTP-verified arrival, sterilized kit sealing, and real-time partner dashboard sync.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE TRACKING & SPECIALIZED WORKFLOWS */}
        {activeTab === 'integration' && (
          <div className="space-y-6 text-left">
            {/* 1. DOCTOR HOME VISITS: Live GPS & Status */}
            {serviceKey === 'doctor-home-visits' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#008080] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                      Live Clinician Tracking
                    </span>
                    <h3 className="text-lg font-black text-[#002b49] mt-1">
                      Dr. Rajesh Sharma, MD (Internal Medicine)
                    </h3>
                    <p className="text-xs text-slate-500">Registration #MCI-29482 · Empaneled Nhealth Senior Physician</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-black uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{doctorGpsStatus === 'en_route' ? 'En Route (ETA: 18 Mins)' : 'Arrived at Patient Residence'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden min-h-[200px] flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-teal-400 animate-pulse" />
                        <span className="text-xs font-bold text-teal-300">Live GPS Telemetry</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Speed: 32 km/h</span>
                    </div>

                    <div className="my-4 space-y-2">
                      <div className="text-xs text-slate-300">Transit Route:</div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>Approaching Banjara Hills Road #12 &rarr; Destination</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-3">
                        <div className="bg-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: doctorGpsStatus === 'en_route' ? '70%' : '100%' }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                      <span>Vehicle: Nhealth CareRide Express</span>
                      <button
                        type="button"
                        onClick={() => setDoctorGpsStatus((prev) => (prev === 'en_route' ? 'arrived' : 'en_route'))}
                        className="text-teal-300 hover:text-white font-bold cursor-pointer text-xs"
                      >
                        Toggle Status Simulation
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">Direct Contact</h4>
                      <p className="text-xs text-slate-600 mt-1">Verified partner contact channel with end-to-end caller masking.</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => alert('Calling Dr. Rajesh Sharma via masked line: +91-9876543210')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Doctor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Emergency SOS escalated to Nhealth Rapid Response Command Center.')}
                        className="w-full py-2 px-3 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Emergency Assistance</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HOME DIAGNOSTICS & LAB: Report Viewer & Sample Collection */}
            {serviceKey === 'home-diagnostics' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <TestTube2 className="w-5 h-5 text-[#008080]" />
                    <span>NABL Accredited Digital Lab Report Viewer</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any test profile to view instant clinical values, reference ranges, and pathologist sign-offs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'CBC', name: 'Complete Blood Count (CBC - 24 Parameters)', date: '26 Oct 2026', status: 'Normal', sample: 'Whole Blood (EDTA)' },
                    { id: 'LIPID', name: 'Comprehensive Lipid Profile', date: '19 Oct 2026', status: 'Borderline', sample: 'Fasting Serum' },
                    { id: 'HBA1C', name: 'HbA1c & Average Blood Glucose', date: '05 Sep 2026', status: 'Optimal (5.6%)', sample: 'Whole Blood' },
                  ].map((rpt) => (
                    <div
                      key={rpt.id}
                      onClick={() => setSelectedLabReport(rpt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        selectedLabReport === rpt.id
                          ? 'border-[#008080] bg-teal-50/70 ring-2 ring-[#008080]/30 shadow-xs'
                          : 'border-slate-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#008080] bg-teal-100/60 px-2 py-0.5 rounded">
                          {rpt.sample}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{rpt.date}</span>
                      </div>
                      <h4 className="font-bold text-[#002b49] text-xs sm:text-sm">{rpt.name}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-emerald-700">{rpt.status}</span>
                        <span className="text-xs font-bold text-[#008080] flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Values</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedLabReport && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#002b49]">
                        Lab Breakdown: {selectedLabReport}
                      </h4>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading verified digital PDF report for ${selectedLabReport}...`)}
                        className="px-3 py-1 rounded-lg bg-[#008080] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-200/60 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2 rounded-l-lg">Investigation</th>
                            <th className="p-2">Observed Value</th>
                            <th className="p-2">Unit</th>
                            <th className="p-2">Biological Reference</th>
                            <th className="p-2 rounded-r-lg">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {selectedLabReport === 'CBC' && (
                            <>
                              <tr><td className="p-2 font-bold">Hemoglobin</td><td className="p-2 text-emerald-700 font-bold">14.2</td><td className="p-2">g/dL</td><td className="p-2">13.0 - 17.0</td><td className="p-2 text-emerald-600">Normal</td></tr>
                              <tr><td className="p-2 font-bold">Total WBC Count</td><td className="p-2 text-emerald-700 font-bold">6,800</td><td className="p-2">cells/cumm</td><td className="p-2">4,000 - 11,000</td><td className="p-2 text-emerald-600">Normal</td></tr>
                              <tr><td className="p-2 font-bold">Platelet Count</td><td className="p-2 text-emerald-700 font-bold">2.4</td><td className="p-2">Lakhs/cumm</td><td className="p-2">1.5 - 4.5</td><td className="p-2 text-emerald-600">Adequate</td></tr>
                            </>
                          )}
                          {selectedLabReport === 'LIPID' && (
                            <>
                              <tr><td className="p-2 font-bold">Total Cholesterol</td><td className="p-2 text-amber-600 font-bold">198</td><td className="p-2">mg/dL</td><td className="p-2">&lt; 200</td><td className="p-2 text-amber-600">Desirable</td></tr>
                              <tr><td className="p-2 font-bold">HDL (Good Cholesterol)</td><td className="p-2 text-emerald-700 font-bold">48</td><td className="p-2">mg/dL</td><td className="p-2">&gt; 40</td><td className="p-2 text-emerald-600">Optimal</td></tr>
                              <tr><td className="p-2 font-bold">Triglycerides</td><td className="p-2 text-amber-600 font-bold">142</td><td className="p-2">mg/dL</td><td className="p-2">&lt; 150</td><td className="p-2 text-emerald-600">Normal</td></tr>
                            </>
                          )}
                          {selectedLabReport === 'HBA1C' && (
                            <>
                              <tr><td className="p-2 font-bold">HbA1c (Glycated Hemoglobin)</td><td className="p-2 text-emerald-700 font-bold">5.6</td><td className="p-2">%</td><td className="p-2">&lt; 5.7 (Non-Diabetic)</td><td className="p-2 text-emerald-600">Excellent Control</td></tr>
                              <tr><td className="p-2 font-bold">Estimated Avg Glucose (eAG)</td><td className="p-2 text-emerald-700 font-bold">114</td><td className="p-2">mg/dL</td><td className="p-2">90 - 120</td><td className="p-2 text-emerald-600">Optimal</td></tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. X-RAY & PORTABLE DIAGNOSTICS: Equipment & Technician Assignment */}
            {serviceKey === 'xray-portable-diagnostics' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#008080]" />
                    <span>Bedside Equipment Scheduling &amp; Certified Technician Assignment</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AERB compliant radiation shielding with high-frequency digital flat panel detectors (DR).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-[#008080] bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                      Assigned Lead Radiographer
                    </span>
                    <h4 className="text-base font-bold text-[#002b49]">
                      Suresh V., Lead Radiologic Technologist (B.Sc MIT, AERB Certified)
                    </h4>
                    <p className="text-xs text-slate-600">
                      Equipped with: <strong>{selectedEquipment}</strong> + Lead Apron &amp; Thyroid Shield for patient safety.
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-xs text-[#008080] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready for Bedside Deployment</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#002b49]">Reporting Workflow</h4>
                    <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                      <li>Technician acquires bedside DICOM exposure at your residence</li>
                      <li>Encrypted upload directly to Nhealth Cloud PACS</li>
                      <li>MD Radiologist signs off digital report within 90 minutes</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* 4. BEDSIDE ASSISTANCE: Caregiver Profiles Dashboard */}
            {serviceKey === 'bedside-assistance' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#008080]" />
                    <span>Verified Attendants &amp; Caregiver Profiles</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Police-verified, certified attendants trained in geriatric support, vital recording, and bed mobility.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Kavitha R.', exp: '6 Years Experience', spec: 'Post-Stroke Mobilization & Elderly Care', badge: 'Police Verified · First Aid Certified', rating: '4.9 ★' },
                    { name: 'Ramesh Yadav', exp: '8 Years Experience', spec: 'Post-Surgical Bedside Care & Vitals', badge: 'Police Verified · CPR Trained', rating: '4.8 ★' },
                  ].map((cg, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 hover:border-teal-300 bg-white space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#008080]" />
                          <h4 className="text-sm font-bold text-[#002b49]">{cg.name}</h4>
                        </div>
                        <span className="text-xs font-extrabold text-amber-500">{cg.rating}</span>
                      </div>
                      <p className="text-xs text-slate-600">{cg.spec}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400">{cg.exp}</span>
                        <span className="text-teal-700 font-bold">{cg.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ELDERCARE: Vitals Logging & Family Notification Sync */}
            {serviceKey === 'eldercare-senior-assistance' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[#008080]" />
                      <span>Senior Vitals Tracker &amp; Family Notification Sync</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Log daily vitals; automatically sends updates to children and family members.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={familySyncEnabled}
                        onChange={(e) => setFamilySyncEnabled(e.target.checked)}
                        className="rounded text-[#008080] focus:ring-[#008080]"
                      />
                      <span>Family Notification Sync (Active)</span>
                    </label>
                  </div>
                </div>

                {familySyncMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{familySyncMessage}</span>
                  </div>
                )}

                {/* Log New Vitals Form */}
                <form onSubmit={handleAddVitals} className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-900">Log Fresh Reading</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Blood Pressure</label>
                      <input
                        type="text"
                        value={newVitalsInput.bp}
                        onChange={(e) => setNewVitalsInput({ ...newVitalsInput, bp: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        placeholder="120/80"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Pulse (bpm)</label>
                      <input
                        type="text"
                        value={newVitalsInput.pulse}
                        onChange={(e) => setNewVitalsInput({ ...newVitalsInput, pulse: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">SpO2 (%)</label>
                      <input
                        type="text"
                        value={newVitalsInput.spo2}
                        onChange={(e) => setNewVitalsInput({ ...newVitalsInput, spo2: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        placeholder="99"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Blood Sugar (mg/dL)</label>
                      <input
                        type="text"
                        value={newVitalsInput.sugar}
                        onChange={(e) => setNewVitalsInput({ ...newVitalsInput, sugar: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        placeholder="110"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#008080] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record &amp; Sync with Family</span>
                  </button>
                </form>

                {/* Vitals Log Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold">
                      <tr>
                        <th className="p-2.5">Date &amp; Time</th>
                        <th className="p-2.5">Blood Pressure</th>
                        <th className="p-2.5">Pulse</th>
                        <th className="p-2.5">SpO2</th>
                        <th className="p-2.5">Sugar</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vitalsList.map((v, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-slate-700">{v.date}</td>
                          <td className="p-2.5 font-bold text-[#002b49]">{v.bp}</td>
                          <td className="p-2.5">{v.pulse}</td>
                          <td className="p-2.5 font-bold text-teal-700">{v.spo2}</td>
                          <td className="p-2.5">{v.sugar}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. SPECIALIZED NURSING CARE: Medical Procedures Tracking */}
            {serviceKey === 'specialized-nursing-care' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#008080]" />
                    <span>Specialized Medical Procedures &amp; Nurse Verification Logs</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Administered by GNM &amp; B.Sc. licensed nurses adhering to hospital-grade sterility protocols.
                  </p>
                </div>

                <div className="space-y-3">
                  {procedureList.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-[#002b49] text-xs sm:text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Administering Nurse: <strong>{p.verifiedNurse}</strong> · {p.date}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. PHYSIOTHERAPY AT HOME: Session Planner & Exercise Logs */}
            {serviceKey === 'physiotherapy-at-home' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#008080]" />
                    <span>Rehabilitation Session Planner &amp; Exercise Routine Logs</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Guided by Certified Physiotherapists (BPT, MPT) with portable electrotherapy units.
                  </p>
                </div>

                <div className="space-y-3">
                  {exercisesList.map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <h4 className="font-bold text-[#002b49] text-xs sm:text-sm">{ex.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Target: {ex.target} · Range of Motion (ROM): <strong className="text-teal-700">{ex.rom}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...exercisesList];
                          updated[idx].completed = !updated[idx].completed;
                          setExercisesList(updated);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          ex.completed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-teal-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{ex.completed ? 'Completed' : 'Mark Done'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. DENTALCARE & ORAL HEALTH: Treatment Records */}
            {serviceKey === 'dental-care-oral-health' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#008080]" />
                    <span>At-Home Dental Assessment &amp; Treatment History</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Equipped with portable dental compressor, ultrasonic scaler, and painless diagnostic probes.
                  </p>
                </div>

                <div className="space-y-3">
                  {dentalHistory.map((dh, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#002b49] text-xs sm:text-sm">{dh.procedure}</h4>
                        <span className="text-[11px] text-slate-400 font-bold">{dh.date}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Attending Dental Specialist: <strong>{dh.dentist}</strong>
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                        <strong>Clinical Assessment:</strong> {dh.verdict}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PREPAID PREMIUM OPD & HOSPITAL ASSISTANCE */}
            {serviceKey === 'prepaid-premium-opd' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#008080]" />
                    <span>Prepaid OPD Credit Wallet &amp; VIP Hospital Desk Assistance</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Skip billing and registration lines at top hospital networks with verified priority desk coordinators.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Wallet Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#002b49] to-[#004d73] text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between text-xs text-teal-200">
                      <span className="font-bold uppercase tracking-wider">OPD Credit Wallet</span>
                      <Wallet className="w-4 h-4 text-teal-300" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black tabular-nums">₹{opdWalletBalance.toLocaleString()}</div>
                      <div className="text-[11px] text-teal-100/80 mt-0.5">100% Cashless Pre-Auth Enabled</div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOpdWalletBalance((b) => b + 2000);
                          alert('Added ₹2,000 OPD credits to your cashless balance!');
                        }}
                        className="py-1 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#002b49] text-xs font-black transition-all cursor-pointer"
                      >
                        + Add Credits
                      </button>
                      <span className="text-[10px] text-teal-200 font-mono">Zero Waiting Token</span>
                    </div>
                  </div>

                  {/* Hospital Coordinator Desk */}
                  <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-[#008080] bg-white px-2 py-0.5 rounded border border-teal-200">
                      Assigned Care Executive
                    </span>
                    <h4 className="text-sm font-bold text-[#002b49]">{deskCoordinator}</h4>
                    <p className="text-xs text-slate-600">
                      Partner Location: <strong>{selectedHospital}</strong>
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Skip-The-Line Fast Track Token Active</span>
                    </div>
                  </div>

                  {/* Cashless Insurance Assistance Tracker */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#008080]" />
                      <span>Cashless TPA Assistance</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-[#002b49]">{cashlessPreAuthStatus}</div>
                      <div className="text-[11px] text-slate-500">TPA Desk Direct E-Settlement with zero out-of-pocket delays.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(currentService, 'Prepaid OPD VIP Pass with Cashless TPA')}
                      className="w-full py-2 rounded-xl bg-[#008080] text-white text-xs font-bold cursor-pointer hover:bg-[#006666]"
                    >
                      Reserve OPD Desk Token
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. DIAGNOSTICS & ADVANCE IMAGING */}
            {serviceKey === 'diagnostics-advance-imaging' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#008080]" />
                    <span>Advanced Scan Center Booking (MRI / CT / Doppler / PET)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-end 3.0T MRI and multi-slice CT with pre-negotiated priority hospital network slots.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-[#008080] bg-white px-2 py-0.5 rounded border border-teal-200">
                      Scan Modality &amp; Region
                    </span>
                    <h4 className="text-sm font-bold text-[#002b49]">{selectedModality}</h4>
                    <p className="text-xs text-slate-600">
                      Target Protocol: <strong>{selectedScanRegion}</strong> · AERB &amp; NABL Accredited Center
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDicomPreviewOpen(!isDicomPreviewOpen)}
                        className="px-3 py-1.5 rounded-xl bg-[#008080] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#006666]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isDicomPreviewOpen ? 'Hide Film Archive' : 'Open Cloud DICOM Film Archive'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#002b49]">Patient Contrast Safety Protocol</h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>4-Hour Fasting required for abdominal or IV contrast scans</li>
                      <li>Serum Creatinine &lt; 1.4 mg/dL verified prior to gadolinium contrast</li>
                      <li>Zero metallic implants / pacemakers confirmation logged</li>
                    </ul>
                  </div>
                </div>

                {isDicomPreviewOpen && (
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300">Cloud DICOM Viewer Simulator</span>
                      <button
                        type="button"
                        onClick={() => alert('Downloading high-resolution DICOM archive and radiologist signed PDF...')}
                        className="px-3 py-1 rounded bg-teal-500 text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Signed Report</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-4">
                      {['Axial T2 TSE', 'Sagittal T1 SE', 'Coronal FLAIR'].map((slice, i) => (
                        <div key={i} className="aspect-square bg-slate-800 rounded-xl border border-slate-700 p-2 flex flex-col justify-between text-[10px] font-mono text-slate-400">
                          <span>{slice}</span>
                          <div className="text-center text-teal-400 font-bold">100% Clear Resolution</div>
                          <span>Slice #{i + 14} / 48</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-slate-300">Report Status: <strong>Signed by Senior Consultant Radiologist (MD)</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* 11. BLOOD BANK & SUPPORT */}
            {serviceKey === 'blood-bank-support' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-rose-600" />
                    <span>Real-Time Blood Unit Availability &amp; Emergency Dispatch</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live inventory synchronized with NACO licensed blood banks and emergency donor networks.
                  </p>
                </div>

                {/* Live Stock Grid */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Live Network Availability ({selectedBloodComponent}):
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {Object.entries(bloodUnitsStock).map(([group, units]) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedBloodGroup(group)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          selectedBloodGroup === group
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="text-sm font-black">{group}</div>
                        <div className={`text-[10px] font-bold ${selectedBloodGroup === group ? 'text-rose-100' : 'text-rose-600'}`}>
                          {units} Units
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Requisition Request */}
                  <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-rose-900">Urgent Blood Unit Requisition</h4>
                    <p className="text-xs text-slate-600">
                      Selected: <strong>{selectedBloodGroup} ({selectedBloodComponent})</strong> · Licensed Cross-Match Verification
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setBloodRequestSent(true);
                        alert(`Emergency requisition for ${selectedBloodGroup} (${selectedBloodComponent}) dispatched to the 3 nearest blood bank hubs!`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      {bloodRequestSent ? 'Requisition Active (Alerted)' : 'Submit Emergency Sourcing Request'}
                    </button>
                  </div>

                  {/* Cold-Chain Dispatch Telemetry */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#002b49]">Cold-Chain Temperature Box</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        3.8°C (Safe 2°C–6°C Zone)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Insulated vacuum cold carrier with live electronic temperature datalogger for PRBC/platelet viability.
                    </p>
                    <div className="pt-1 text-[11px] text-slate-500 font-mono">
                      Fast-Track Green Corridor Dispatch Available for Emergency Surgeries
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 12. 24/7 AMBULANCE & SOS */}
            {serviceKey === 'ambulance-24-7' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                      Critical Life Support Dispatch
                    </span>
                    <h3 className="text-lg font-black text-[#002b49] mt-1">
                      24/7 Smart Ambulance &amp; Rapid SOS Network
                    </h3>
                    <p className="text-xs text-slate-500">Live GPS tracking similar to ride-hailing with certified trauma paramedics.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSosTriggered(!sosTriggered);
                      alert(sosTriggered ? 'SOS Standby.' : 'EMERGENCY SOS BROADCASTED: Nearest ACLS Ambulance dispatched to your GPS location!');
                    }}
                    className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                      sosTriggered
                        ? 'bg-rose-700 text-white animate-pulse'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Car className="w-5 h-5 text-white" />
                    <span>{sosTriggered ? 'SOS Active (Dispatched)' : 'TRIGGER EMERGENCY SOS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ride-Hailing Style Map Tracking */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden min-h-[220px] flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-rose-400 animate-pulse" />
                        <span className="text-xs font-bold text-rose-300">Live Ambulance Transit Track</span>
                      </div>
                      <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                        ETA: ~{ambulanceEta} Mins
                      </span>
                    </div>

                    <div className="my-4 space-y-2">
                      <div className="text-xs text-slate-300">Vehicle: <strong>TS-09-AMB-4412 (ACLS Mobile ICU)</strong></div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>En route to patient coordinates · Speed: 58 km/h</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mt-3">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: '80%' }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                      <span>Lead Paramedic: Manoj Kumar (BLS/ACLS)</span>
                      <button
                        type="button"
                        onClick={() => alert('Direct call to Paramedic Line: +91-9876543210')}
                        className="text-rose-300 hover:text-white font-bold cursor-pointer text-xs"
                      >
                        Call Paramedic
                      </button>
                    </div>
                  </div>

                  {/* Hospital Emergency Alert Sync */}
                  <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs font-black uppercase text-rose-900">Hospital Trauma Sync</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Alerting receiving emergency department for immediate triage bed preparation.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-[#002b49]">Apollo Emergency Trauma Center</div>
                      <div className="text-[11px] text-emerald-700 font-bold">✓ ER Triage Bed &amp; Oxygen Pre-Assigned</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Emergency route cleared with regional traffic coordination hub.')}
                      className="w-full py-2 rounded-xl bg-[#002b49] text-white text-xs font-bold cursor-pointer hover:bg-[#003d66]"
                    >
                      Clear Route Protocol
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 13. NHEALTH CARERIDE */}
            {serviceKey === 'nhealth-careride' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Car className="w-5 h-5 text-[#008080]" />
                    <span>Assisted Non-Emergency Medical Transport</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comfortable, wheelchair-accessible transit for dialysis, chemotherapy, and routine hospital visits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#008080] bg-white px-2 py-0.5 rounded border border-teal-200">
                      Vehicle &amp; Trip
                    </span>
                    <h4 className="text-sm font-bold text-[#002b49]">{rideVehicleType}</h4>
                    <p className="text-xs text-slate-600">Trip Purpose: <strong>{rideTripType}</strong></p>
                    <div className="text-[11px] text-teal-700 font-semibold pt-1">Equipped with hydraulic wheelchair ramp &amp; seatbelt restraints.</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Verified Driver Partner
                    </span>
                    <h4 className="text-sm font-bold text-[#002b49]">{rideDriverVerified.name}</h4>
                    <p className="text-xs text-slate-600">{rideDriverVerified.badge}</p>
                    <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                      <span>Vehicle: {rideDriverVerified.vehicleNo}</span>
                      <span className="font-bold text-amber-600">{rideDriverVerified.rating}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-[#002b49]">Live Transit Telemetry</h4>
                      <div className="text-xs text-slate-500 mt-1">Vehicle sanitized prior to pickup.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(currentService, `Careride Transit: ${rideVehicleType}`)}
                      className="w-full py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Book Assisted Ride
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 14. NHEALTH CAREASSIST */}
            {serviceKey === 'nhealth-careassist' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-[#008080]" />
                    <span>Personal Healthcare Concierge &amp; Multi-Service Hub</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dedicated family case manager coordinating all doctor visits, medicines, and diagnostic appointments.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Case Manager Card */}
                  <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#008080] bg-white px-2 py-0.5 rounded border border-teal-200">
                        Assigned Care Navigator
                      </span>
                      <span className="text-xs font-bold text-slate-500">{caseManager.caseId}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#002b49]">{caseManager.name}</h4>
                    <p className="text-xs text-slate-600">{caseManager.role}</p>
                    <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-xs text-slate-700">
                      <strong>Active Care Plan:</strong> {caseManager.activePlan}
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Calling your dedicated case manager ${caseManager.name}: ${caseManager.phone}`)}
                      className="w-full py-2 rounded-xl bg-[#008080] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#006666]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Case Manager</span>
                    </button>
                  </div>

                  {/* Multi-Service Tracking Hub Timeline */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#002b49]">Integrated Multi-Service Hub</h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#002b49]">Doorstep Pharmacy Delivery</div>
                          <div className="text-[11px] text-slate-500">Chronic Refill Pack</div>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Dispatched</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#002b49]">Doctor Home Visit</div>
                          <div className="text-[11px] text-slate-500">Routine Geriatric Vitals</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Tomorrow 10 AM</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#002b49]">Home Diagnostics Lab Test</div>
                          <div className="text-[11px] text-slate-500">Lipid &amp; HbA1c Panel</div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Archived</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOGS & CLINICAL RECORDS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#002b49] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#008080]" />
                  <span>Clinical Records &amp; Consultation Logs</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure health records stored for <strong>{patientName}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#008080] bg-white px-2 py-0.5 rounded">
                Verified Electronic Medical Record (EMR)
              </span>
              <h4 className="text-sm font-bold text-[#002b49]">
                Previous Service Visit: {currentService.name}
              </h4>
              <p className="text-xs text-slate-600">
                Completed on 22 Oct 2026 · Verified clinical summary available for doctor consultation review.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Downloading clinical encounter summary...')}
                  className="px-3 py-1.5 rounded-lg bg-[#008080] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Visit Summary</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURE TOKEN QR PASS */}
        {activeTab === 'pass' && (
          <div className="flex flex-col items-center justify-center py-6">
            {activeToken ? (
              <div className="max-w-md w-full">
                <SecureQrTokenCard token={activeToken} />
              </div>
            ) : (
              <div className="text-center max-w-sm space-y-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                <QrCode className="w-12 h-12 text-[#008080] mx-auto animate-pulse" />
                <h4 className="text-base font-black text-[#002b49]">Generate 72-Hour Secure QR Pass</h4>
                <p className="text-xs text-slate-500">
                  Create a unique, encrypted one-time token for visiting clinicians or partner staff.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateServicePass}
                  className="w-full py-3 rounded-2xl bg-[#008080] text-white text-xs font-black shadow-sm cursor-pointer"
                >
                  Generate Pass Now
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
