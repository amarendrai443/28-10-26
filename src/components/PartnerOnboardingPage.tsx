import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  TestTube2,
  Pill,
  Car,
  HeartHandshake,
  CheckCircle2,
  UploadCloud,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Clock,
  ExternalLink,
  Bike,
  HeartPulse,
  Droplet,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { PartnerCategory, PartnerApplication } from '../types/partner';

interface PartnerOnboardingPageProps {
  onAddPartner: (newPartner: PartnerApplication) => void;
  onNavigateHome: () => void;
  onNavigateAdmin?: () => void;
}

const CATEGORIES: {
  id: PartnerCategory;
  name: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'Doctor',
    name: 'Doctors & Specialists',
    badge: 'Clinical Empanelment',
    desc: 'General Physicians, Cardiologists, Pediatricians, Orthopedics & Surgeons',
    icon: Stethoscope,
  },
  {
    id: 'Hospital',
    name: 'Hospitals & Clinics',
    badge: 'Institutional Network',
    desc: 'NABH Hospitals, Daycare Surgery Centers, Emergency OPD Chains',
    icon: Building2,
  },
  {
    id: 'Diagnostics',
    name: 'Diagnostics & Pathology Labs',
    badge: 'NABL Certified',
    desc: 'Clinical Labs, Biochemistry Hubs, Imaging Centers & Home Phlebotomy',
    icon: TestTube2,
  },
  {
    id: 'Pharmacy',
    name: 'Pharmacies & Distributors',
    badge: 'Licensed Pharmacy',
    desc: 'Retail Pharmacies, Prescription Fulfillment & Home Delivery Chains',
    icon: Pill,
  },
  {
    id: 'Ambulance',
    name: 'Ambulance & Transit Fleets',
    badge: 'Emergency Transit',
    desc: 'BLS, Advanced Cardiac ICU Ambulances, Air Medical Transport',
    icon: Car,
  },
  {
    id: 'Caregiver',
    name: 'Caregivers & Home Nursing',
    badge: 'Bedside Care',
    desc: 'Senior Geriatric Attendants, ICU Nurses, Physiotherapists & Rehab',
    icon: HeartHandshake,
  },
  {
    id: 'Care Rider',
    name: 'Nhealth Care Rider',
    badge: 'Rapid Medical Transit',
    desc: 'Cold-chain diagnostic sample couriers, rapid prescription delivery riders & phlebotomy fleet',
    icon: Bike,
  },
  {
    id: 'Care Assist',
    name: 'Nhealth Care Assist',
    badge: 'Paramedic & Bedside',
    desc: 'Certified general duty attendants, elderly mobility aides, patient companions & post-op rehab',
    icon: HeartPulse,
  },
  {
    id: 'Blood Bank',
    name: 'Blood Bank / Blood Availability Network',
    badge: 'Emergency Blood Network',
    desc: 'NABH/FDA blood banks, whole blood centers, PRBC, FFP & single donor platelet availability networks',
    icon: Droplet,
  },
];

export const PartnerOnboardingPage: React.FC<PartnerOnboardingPageProps> = ({
  onAddPartner,
  onNavigateHome,
  onNavigateAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory>('Doctor');

  const [form, setForm] = useState({
    entityName: '',
    registrationNumber: '',
    specialty: '',
    contactPerson: '',
    phone: '',
    email: '',
    loginIdOrEmail: '',
    password: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    bioOrExperience: '',
    consultationFee: 750,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState<PartnerApplication | null>(null);

  // Simulated Document Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setUploadedFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        });
        setIsUploading(false);
      }, 400);
    }
  };

  const handleSimulateDefaultDoc = () => {
    setUploadedFile({
      name: `${form.entityName ? form.entityName.replace(/\s+/g, '_') : 'Partner'}_Medical_License_2026.pdf`,
      size: '2.4 MB',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = 'PARTNER-' + Math.floor(10000 + Math.random() * 90000);
    const newPartner: PartnerApplication = {
      id: generatedId,
      category: selectedCategory,
      entityName: form.entityName,
      registrationNumber: form.registrationNumber,
      specialty: form.specialty || `${selectedCategory} Healthcare Services`,
      contactPerson: form.contactPerson || form.entityName,
      phone: form.phone,
      email: form.email,
      loginIdOrEmail: form.loginIdOrEmail.trim() || form.email.trim(),
      password: form.password,
      city: form.city,
      district: form.district,
      state: form.state,
      pincode: form.pincode,
      documentName: uploadedFile?.name || 'Verified_License_Document.pdf',
      documentSize: uploadedFile?.size || '1.8 MB',
      submittedAt: new Date().toISOString(),
      status: 'Pending', // Strictly initial state is 'Pending'
      bioOrExperience: form.bioOrExperience || 'Accredited healthcare professional/facility partnering with Nhealth.',
      consultationFee: Number(form.consultationFee) || 700,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onAddPartner(newPartner);
      setSubmittedPartner(newPartner);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#008080]/15 selection:text-[#002b49]">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-40">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#008080] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Healthcare Portal</span>
            </button>
          </div>

          <div
            onClick={onNavigateHome}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img
              src="https://i.ibb.co/6JR2bwmJ/whatsapp-profile-pic.jpg"
              alt="Nhealth Logo"
              className="h-9 sm:h-10 w-auto object-contain rounded-lg border border-teal-500/30"
              onError={(e) => {
                e.currentTarget.src = '/splash-logo.png';
              }}
            />
            <span
              style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif", fontWeight: 600 }}
              className="text-xl sm:text-2xl tracking-tight text-[#002b49] group-hover:text-[#008080] transition-colors"
            >
              Nhealth™
            </span>
            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#008080] border border-teal-200 hidden sm:inline">
              Partner Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008080] border border-teal-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {submittedPartner ? (
          /* Submission Confirmation Card with EXACT prompt message */
          <div className="bg-white rounded-3xl shadow-xl border border-teal-500/30 p-6 sm:p-12 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-[#008080] border-2 border-teal-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-4">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Initial Status: PENDING REVIEW</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b49] tracking-tight mb-4">
              Thank You for Registering as an Nhealth Partner!
            </h2>

            {/* Exact Required Prompt Statement */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-6 text-left">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Thank You for Registering as an Nhealth Partner! Your profile is currently under review by our medical verification team. Once approved by our Admin, your services will go Live on the Nhealth network.
              </p>
            </div>

            {/* Application Overview Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-teal-50/50 border border-teal-200/60 rounded-2xl text-left text-xs mb-8">
              <div>
                <span className="text-slate-500 block">Application ID:</span>
                <span className="font-mono font-bold text-[#008080]">{submittedPartner.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="font-bold text-[#002b49]">{submittedPartner.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Entity Name:</span>
                <span className="font-bold text-[#002b49] truncate block">{submittedPartner.entityName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registration / License:</span>
                <span className="font-mono font-semibold text-slate-800">{submittedPartner.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location:</span>
                <span className="font-semibold text-slate-800">{submittedPartner.city}, {submittedPartner.state}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Document Status:</span>
                <span className="text-teal-700 font-bold flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Uploaded ({submittedPartner.documentSize})</span>
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-teal-200/50">
                <span className="text-slate-500 block text-[11px]">Partner Login ID:</span>
                <span className="font-mono font-bold text-[#008080]">
                  {submittedPartner.loginIdOrEmail || submittedPartner.email}
                </span>
              </div>
            </div>

            {/* State Note Requirement */}
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-950 flex items-start gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-900 mb-0.5">Activation Note:</strong>
                <span>These credentials will become active once your application is approved by the Nhealth Admin.</span>
              </div>
            </div>

            {/* Direct Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#002b49] hover:bg-[#003d66] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Patient Homepage</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedPartner(null);
                  setForm({
                    entityName: '',
                    registrationNumber: '',
                    specialty: '',
                    contactPerson: '',
                    phone: '',
                    email: '',
                    loginIdOrEmail: '',
                    password: '',
                    city: 'Hyderabad',
                    district: 'Hyderabad',
                    state: 'Telangana',
                    pincode: '',
                    bioOrExperience: '',
                    consultationFee: 750,
                  });
                  setUploadedFile(null);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Register Another Partner
              </button>
            </div>
          </div>
        ) : (
          /* Partner Registration Form */
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#008080] text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#008080]" />
                <span>Nhealth Institutional &amp; Clinician Onboarding</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#002b49] tracking-tight">
                Partner With Bharat's Largest Home Healthcare Network
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Connect your medical practice, hospital, diagnostic lab, ambulance fleet, care rider, care assist, or blood bank network to thousands of verified patients needing coordinated at-home care.
              </p>
            </div>

            {/* Step 1: Category Selector Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Step 1: Choose Your Partner Category <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500">Select one that matches your primary medical service</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#008080] bg-teal-50/70 shadow-md ring-2 ring-[#008080]/30 -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
                            isSelected ? 'bg-[#008080] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-[#002b49] leading-snug">{cat.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                          {cat.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/60">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isSelected ? 'text-[#008080]' : 'text-slate-400'}`}>
                          {cat.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Comprehensive Onboarding Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#002b49]">
                    Step 2: Partner Profile &amp; Verification Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide official clinical details for medical council and verification review.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#008080] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Category: {selectedCategory}
                </span>
              </div>

              {/* Row 1: Full Name / Entity Name & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {selectedCategory === 'Doctor' ? 'Doctor Full Name & Qualifications' : 'Hospital / Entity / Fleet Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedCategory === 'Doctor'
                        ? 'e.g. Dr. Rajeshwar Rao, MBBS, MD'
                        : selectedCategory === 'Hospital'
                        ? 'e.g. Apollo Reach Multispecialty'
                        : selectedCategory === 'Diagnostics'
                        ? 'e.g. Thyrocare Diagnostic Hub'
                        : selectedCategory === 'Ambulance'
                        ? 'e.g. LifeLine Rapid Transit Ambulance'
                        : 'e.g. MedPlus Pharmacy Hub / Caregiver Agency'
                    }
                    value={form.entityName}
                    onChange={(e) => setForm({ ...form, entityName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registration Number / License / NABL Accreditation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCI-48921 / NABL-MC-2024 / RTO-AMB-991"
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Row 2: Specialty & Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Specialty / Department / Fleet Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedCategory === 'Doctor'
                        ? 'e.g. Cardiology & Preventive Medicine'
                        : selectedCategory === 'Hospital'
                        ? 'e.g. Multi-Specialty & ICU Care'
                        : selectedCategory === 'Diagnostics'
                        ? 'e.g. Clinical Pathology, Biochemistry & PCR'
                        : 'e.g. Advanced Cardiac Life Support (ALS)'
                    }
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Person &amp; Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. C. Sharma (Medical Director)"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Row 3: Contact Details (Phone & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official Mobile / Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@hospital.com or doctor@clinic.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Row 4: Location (City, District, State, Pincode) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Operating Location (City, District, State) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="City (e.g. Hyderabad)"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="District"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="State (e.g. Telangana)"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Pincode"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Portal Credentials Section (Requirement 4) */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 rounded-3xl border border-teal-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#008080] flex items-center justify-center font-bold">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#002b49] uppercase tracking-wide">
                        Create Partner Portal Login Credentials <span className="text-red-500">*</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        These credentials will enable secure access to your verified partner portal
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Required for /auth Login
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Create Login ID / Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={form.email || 'e.g. partner.drsharma@nhealth.in'}
                      value={form.loginIdOrEmail}
                      onChange={(e) => setForm({ ...form, loginIdOrEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Choose an official ID or email for accessing the Partner Login portal.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create a secure partner password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Minimum 6 characters.
                    </p>
                  </div>
                </div>

                {/* State Note Requirement */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">
                    Note: These credentials will become active once your application is approved by the Nhealth Admin.
                  </span>
                </div>
              </div>

              {/* Row 5: Document Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Document Upload (Medical License / NABH / NABL Accreditation Certificate) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-teal-400/50 hover:border-[#008080] rounded-2xl p-6 bg-teal-50/30 text-center transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <UploadCloud className="w-10 h-10 text-[#008080]" />
                    <div className="text-xs font-bold text-slate-700">
                      {uploadedFile ? (
                        <span className="text-emerald-700 font-extrabold">✓ Attached: {uploadedFile.name} ({uploadedFile.size})</span>
                      ) : (
                        <span>Drag &amp; drop your certificate here, or <strong className="text-[#008080] underline">browse files</strong></span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Supports PDF, PNG, JPG (Max 15MB)
                    </span>
                  </div>
                </div>

                {!uploadedFile && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Testing without a real file?</span>
                    <button
                      type="button"
                      onClick={handleSimulateDefaultDoc}
                      className="text-[#008080] font-bold hover:underline cursor-pointer"
                    >
                      + Attach Simulated Verified Certificate (Demo)
                    </button>
                  </div>
                )}
              </div>

              {/* Row 6: Overview Bio / Infrastructure */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinical Experience &amp; Infrastructure Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your facilities, team experience, turnaround time, equipment capabilities..."
                  value={form.bioOrExperience}
                  onChange={(e) => setForm({ ...form, bioOrExperience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0" />
                  <span>All partner profiles undergo strict credentialing before going Live.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#002b49] via-[#003859] to-[#002b49] hover:from-[#00172b] hover:to-[#00172b] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Submitting Credentials...' : 'Submit Partner Onboarding Application'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; 2026 Nhealth Unified Healthcare Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
};
