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
  EyeOff,
  Phone,
  Camera,
  FileText,
  UserCheck,
  Check,
  MapPin,
  AlertCircle
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
    name: 'Blood Bank / Availability Network',
    badge: 'Emergency Blood Network',
    desc: 'NABH/FDA blood banks, whole blood centers, PRBC, FFP & single donor platelet availability networks',
    icon: Droplet,
  },
];

interface UploadedDoc {
  name: string;
  size: string;
}

export const PartnerOnboardingPage: React.FC<PartnerOnboardingPageProps> = ({
  onAddPartner,
  onNavigateHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory>('Doctor');

  const [form, setForm] = useState({
    entityName: '',
    registrationNumber: '',
    specialty: '',
    contactPerson: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    loginIdOrEmail: '',
    password: '',
    fullAddress: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    bioOrExperience: '',
    consultationFee: 750,

    // Care Rider specifics
    vehicleType: '2-Wheeler' as '2-Wheeler' | '4-Wheeler',
    vehicleRegNumber: '',
    drivingLicenseNumber: '',
    alternateContactDetails: '',

    // Mandatory consent
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState<PartnerApplication | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // File Upload states (All Departments)
  const [certDoc, setCertDoc] = useState<UploadedDoc | null>(null);
  const [govtIdDoc, setGovtIdDoc] = useState<UploadedDoc | null>(null);
  const [profilePhotoDoc, setProfilePhotoDoc] = useState<UploadedDoc | null>(null);

  // File Upload states (Care Rider specifics)
  const [dlDoc, setDlDoc] = useState<UploadedDoc | null>(null);
  const [individualPhotoDoc, setIndividualPhotoDoc] = useState<UploadedDoc | null>(null);
  const [familyPhotoDoc, setFamilyPhotoDoc] = useState<UploadedDoc | null>(null);
  const [policeNocDoc, setPoliceNocDoc] = useState<UploadedDoc | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedDoc | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  const handleSimulateAllDocs = () => {
    const baseName = form.entityName ? form.entityName.replace(/\s+/g, '_') : 'Partner';
    setCertDoc({ name: `${baseName}_Medical_Cert_2026.pdf`, size: '2.1 MB' });
    setGovtIdDoc({ name: `${baseName}_Aadhaar_Govt_ID.pdf`, size: '1.4 MB' });
    setProfilePhotoDoc({ name: `${baseName}_Profile_Photo.jpg`, size: '1.2 MB' });

    if (selectedCategory === 'Care Rider') {
      setDlDoc({ name: `${baseName}_Driving_License.pdf`, size: '1.5 MB' });
      setIndividualPhotoDoc({ name: `${baseName}_Individual_Rider.jpg`, size: '1.1 MB' });
      setFamilyPhotoDoc({ name: `${baseName}_Family_Photo.jpg`, size: '1.8 MB' });
      setPoliceNocDoc({ name: `${baseName}_Police_NOC_Verification.pdf`, size: '1.9 MB' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.agreeTerms) {
      setFormError('Please accept the mandatory Terms & Conditions and Privacy Policy to submit your partner application.');
      return;
    }

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
      whatsappNumber: form.whatsappNumber || form.phone,
      email: form.email,
      loginIdOrEmail: form.loginIdOrEmail.trim() || form.email.trim(),
      password: form.password,
      fullAddress: form.fullAddress,
      city: form.city,
      district: form.district,
      state: form.state,
      pincode: form.pincode,
      documentName: certDoc?.name || 'Medical_Certificate.pdf',
      documentSize: certDoc?.size || '1.8 MB',
      govtIdProofName: govtIdDoc?.name || 'Govt_ID_Proof.pdf',
      profilePhotoName: profilePhotoDoc?.name || 'Active_Profile_Photo.jpg',
      profileImage: profilePhotoDoc?.name ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80' : undefined,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      bioOrExperience: form.bioOrExperience || 'Accredited healthcare partner providing verified services on Nhealth.',
      consultationFee: Number(form.consultationFee) || 700,
      agreedToTerms: form.agreeTerms,

      // Care Rider Specific Fields
      ...(selectedCategory === 'Care Rider'
        ? {
            vehicleType: form.vehicleType,
            vehicleRegNumber: form.vehicleRegNumber,
            drivingLicenseNumber: form.drivingLicenseNumber,
            alternateContactDetails: form.alternateContactDetails,
            drivingLicenseDocName: dlDoc?.name || 'Driving_License.pdf',
            individualPhotoName: individualPhotoDoc?.name || 'Individual_Photo.jpg',
            familyPhotoName: familyPhotoDoc?.name || 'Family_Photo.jpg',
            policeNocDocName: policeNocDoc?.name || 'Police_Dept_NOC.pdf',
          }
        : {}),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onAddPartner(newPartner);
      setSubmittedPartner(newPartner);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#008080]/15 selection:text-[#002b49]">
      {/* Top Navigation Bar - Frozen on mobile/tablet with zero overlap */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs sticky top-0 z-50">
        <div className="w-full px-3 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              aria-label="Back to home"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:text-[#008080] hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0 border border-slate-200/60 sm:border-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={onNavigateHome}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <img
              src="https://i.ibb.co/6JR2bwmJ/whatsapp-profile-pic.jpg"
              alt="Nhealth Logo"
              className="h-8 sm:h-10 w-auto object-contain rounded-lg border border-teal-500/30 shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/splash-logo.png';
              }}
            />
            <span
              style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif", fontWeight: 600 }}
              className="text-lg sm:text-2xl tracking-tight text-[#002b49] group-hover:text-[#008080] transition-colors whitespace-nowrap"
            >
              Nhealth™
            </span>
            <span className="hidden sm:inline-block ml-1 text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#008080] border border-teal-200 shrink-0">
              Partner Portal
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 text-xs text-slate-500 shrink-0">
            <span className="hidden md:inline text-slate-400">Need assistance?</span>
            <a
              href="tel:9393934621"
              className="inline-flex items-center gap-1 font-bold text-[#008080] hover:underline bg-teal-50 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-teal-100/80 sm:border-transparent text-[11px] sm:text-xs"
            >
              <Phone className="w-3 h-3 md:hidden text-[#008080]" />
              <span>9393934621</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        {submittedPartner ? (
          /* Submission Confirmation Card */
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

            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-6 text-left">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Thank You for Registering as an Nhealth Partner! Your profile is currently under review by our medical verification team. Once approved by our Admin, your services will go Live on the Nhealth network, and you will be dynamically redirected to your specialized {submittedPartner.category} portal upon login.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-teal-50/50 border border-teal-200/60 rounded-2xl text-left text-xs mb-8">
              <div>
                <span className="text-slate-500 block">Application ID:</span>
                <span className="font-mono font-bold text-[#008080]">{submittedPartner.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="font-bold text-slate-800">{submittedPartner.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-bold text-slate-800">{submittedPartner.phone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#002b49] hover:bg-[#003d66] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Healthcare Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedPartner(null);
                  setCertDoc(null);
                  setGovtIdDoc(null);
                  setProfilePhotoDoc(null);
                  setDlDoc(null);
                  setIndividualPhotoDoc(null);
                  setFamilyPhotoDoc(null);
                  setPoliceNocDoc(null);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Register Another Partner
              </button>
            </div>
          </div>
        ) : (
          /* Partner Registration Form */
          <div className="space-y-6 sm:space-y-8">
            {/* Header Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#008080] text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#008080]" />
                <span>Nhealth Institutional &amp; Clinician Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002b49] tracking-tight">
                Partner With Bharat's Largest Home Healthcare Network
              </h1>
              <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                Connect your medical practice, diagnostic lab, pharmacy, ambulance, care rider, care assist, or blood bank network to thousands of patients across India.
              </p>
            </div>

            {/* Step 1: Category Selector Cards - Responsive 3x3 Grid on Mobile & Tablet */}
            <div className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200/90 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5 pb-2.5 border-b border-slate-100">
                <label className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Step 1: Choose Your Partner Category <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#008080] font-semibold">9 Unified Medical Specialties</span>
              </div>

              {/* 3x3 Responsive Grid Layout for Mobile/Tablet */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-3.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2 sm:p-3 lg:p-3.5 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all cursor-pointer flex flex-col items-center sm:items-start justify-between ${
                        isSelected
                          ? 'border-[#008080] bg-teal-50/80 shadow-md ring-2 ring-[#008080]/30 -translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-full flex flex-col items-center sm:items-start">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2.5 shrink-0 ${
                            isSelected ? 'bg-[#008080] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <h4 className="text-[11px] sm:text-xs font-bold text-[#002b49] leading-snug line-clamp-2 sm:line-clamp-none">
                          {cat.name}
                        </h4>
                        <p className="hidden md:block text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                          {cat.desc}
                        </p>
                      </div>
                      <div className="w-full mt-1.5 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-200/60 hidden sm:block">
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
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-10 border border-slate-200/90 shadow-lg space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#002b49]">
                    Step 2: Partner Profile &amp; Verification Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official clinical and credential details for regulatory verification and dashboard empanelment.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-[#008080] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Category: {selectedCategory}
                </span>
              </div>

              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Row 1: Full Name / Entity Name & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {selectedCategory === 'Doctor' ? 'Doctor Full Name & Qualifications' : selectedCategory === 'Care Rider' ? 'Rider Full Legal Name' : 'Hospital / Entity / Fleet Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedCategory === 'Doctor'
                        ? 'e.g. Dr. Rajeshwar Rao, MBBS, MD'
                        : selectedCategory === 'Care Rider'
                        ? 'e.g. Ramesh Kumar (Care Rider)'
                        : 'e.g. Apollo Reach / Thyrocare / MedPlus Hub'
                    }
                    value={form.entityName}
                    onChange={(e) => setForm({ ...form, entityName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registration Number / License / Accreditation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCI-48921 / NABL-MC-2024 / TS-RTO-2024"
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
                    Specialty / Department / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedCategory === 'Doctor'
                        ? 'e.g. General Medicine / Cardiology'
                        : selectedCategory === 'Care Rider'
                        ? 'e.g. Phlebotomy & Rapid Sample Transit Rider'
                        : 'e.g. Clinical Pathology & Home Phlebotomy'
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
                    placeholder="e.g. Ramesh K. (Fleet Lead / Medical In-Charge)"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Row 3: Standard Contact Info (Phone, WhatsApp Number, Work Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 shrink-0">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                      className="min-w-0 flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                </div>

                {/* WhatsApp Number (Standard Required Field) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 shrink-0">
                      💬 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="WhatsApp 10-digit"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                      className="min-w-0 flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
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
                    placeholder="partner@domain.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Row 4: Full Address (Standard Required Field) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Operating Address (Premises, Street, Landmark) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat/Unit 402, Signature Hub, Near Metro Pillar 128, Hitec City"
                    value={form.fullAddress}
                    onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Row 5: City, District, State, Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City, District &amp; State <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="District"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
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

              {/* Nhealth Care Rider Additional Required Fields */}
              {selectedCategory === 'Care Rider' && (
                <div className="p-4 sm:p-6 bg-teal-50/70 rounded-2xl border border-teal-300 shadow-2xs space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#002b49] uppercase tracking-wide border-b border-teal-200/80 pb-2">
                    <Bike className="w-4 h-4 text-[#008080]" />
                    <span>Nhealth Care Rider — Specialized Fleet Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.vehicleType}
                        onChange={(e) => setForm({ ...form, vehicleType: e.target.value as '2-Wheeler' | '4-Wheeler' })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                      >
                        <option value="2-Wheeler">2-Wheeler (Motorbike/Scooter)</option>
                        <option value="4-Wheeler">4-Wheeler (Rapid Van/Car)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Vehicle Reg Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TS09FA1234"
                        value={form.vehicleRegNumber}
                        onChange={(e) => setForm({ ...form, vehicleRegNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#008080]"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Driving License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TS00920200004512"
                        value={form.drivingLicenseNumber}
                        onChange={(e) => setForm({ ...form, drivingLicenseNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#008080]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Alternate Family Contact &amp; Relation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Suresh (Father) - 9848022331"
                        value={form.alternateContactDetails}
                        onChange={(e) => setForm({ ...form, alternateContactDetails: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Partner Portal Credentials Section */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 rounded-2xl border border-teal-200/90 shadow-2xs space-y-4">
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
                        Used to access your dynamic {selectedCategory} management console
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Create Login ID / Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={form.email || 'e.g. partner.fleet@nhealth.in'}
                      value={form.loginIdOrEmail}
                      onChange={(e) => setForm({ ...form, loginIdOrEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create partner password"
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
                  </div>
                </div>
              </div>

              {/* Standard Partner Document Uploaders (All Departments) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Required Verification Documents &amp; Photos <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSimulateAllDocs}
                    className="text-[#008080] text-xs font-bold hover:underline cursor-pointer"
                  >
                    + Auto-Attach Demo Verification Files
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Uploader 1: Certificates / Registered Documents */}
                  <div className="border-2 border-dashed border-teal-300/80 hover:border-[#008080] rounded-2xl p-4 bg-teal-50/30 text-center relative transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, setCertDoc)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                      <FileCheck2 className="w-7 h-7 text-[#008080]" />
                      <span className="text-xs font-bold text-slate-800">
                        {certDoc ? (
                          <span className="text-emerald-700 font-extrabold line-clamp-1">✓ {certDoc.name}</span>
                        ) : (
                          'Certificates / Reg Documents'
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">Medical License / NABH / NABL</span>
                    </div>
                  </div>

                  {/* Uploader 2: Govt ID Proof */}
                  <div className="border-2 border-dashed border-teal-300/80 hover:border-[#008080] rounded-2xl p-4 bg-teal-50/30 text-center relative transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, setGovtIdDoc)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                      <ShieldCheck className="w-7 h-7 text-[#008080]" />
                      <span className="text-xs font-bold text-slate-800">
                        {govtIdDoc ? (
                          <span className="text-emerald-700 font-extrabold line-clamp-1">✓ {govtIdDoc.name}</span>
                        ) : (
                          'Govt ID Proof'
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">Aadhaar / PAN / Voter ID</span>
                    </div>
                  </div>

                  {/* Uploader 3: Profile Photo */}
                  <div className="border-2 border-dashed border-teal-300/80 hover:border-[#008080] rounded-2xl p-4 bg-teal-50/30 text-center relative transition-colors">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, setProfilePhotoDoc)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                      <Camera className="w-7 h-7 text-[#008080]" />
                      <span className="text-xs font-bold text-slate-800">
                        {profilePhotoDoc ? (
                          <span className="text-emerald-700 font-extrabold line-clamp-1">✓ {profilePhotoDoc.name}</span>
                        ) : (
                          'Profile Photo'
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">Active Profile Pic (After Admin Approval)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nhealth Care Rider Additional File Uploaders */}
              {selectedCategory === 'Care Rider' && (
                <div className="p-4 sm:p-5 bg-teal-50/40 rounded-2xl border border-teal-300/80 space-y-3">
                  <div className="text-xs font-bold text-[#002b49] uppercase tracking-wide">
                    Care Rider Mandatory Verification Uploads (4 Documents)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* DL Doc */}
                    <div className="border border-dashed border-teal-400 bg-white rounded-xl p-3 text-center relative">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, setDlDoc)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="pointer-events-none flex flex-col items-center">
                        <FileText className="w-5 h-5 text-[#008080] mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 line-clamp-1">
                          {dlDoc ? `✓ ${dlDoc.name}` : 'Driving License Photo'}
                        </span>
                      </div>
                    </div>

                    {/* Individual Photo */}
                    <div className="border border-dashed border-teal-400 bg-white rounded-xl p-3 text-center relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, setIndividualPhotoDoc)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="pointer-events-none flex flex-col items-center">
                        <Camera className="w-5 h-5 text-[#008080] mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 line-clamp-1">
                          {individualPhotoDoc ? `✓ ${individualPhotoDoc.name}` : 'Individual Photo'}
                        </span>
                      </div>
                    </div>

                    {/* Family Photo */}
                    <div className="border border-dashed border-teal-400 bg-white rounded-xl p-3 text-center relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, setFamilyPhotoDoc)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="pointer-events-none flex flex-col items-center">
                        <UserCheck className="w-5 h-5 text-[#008080] mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 line-clamp-1">
                          {familyPhotoDoc ? `✓ ${familyPhotoDoc.name}` : 'Family Photo'}
                        </span>
                      </div>
                    </div>

                    {/* Police Dept NOC */}
                    <div className="border border-dashed border-teal-400 bg-white rounded-xl p-3 text-center relative">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, setPoliceNocDoc)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="pointer-events-none flex flex-col items-center">
                        <ShieldCheck className="w-5 h-5 text-[#008080] mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 line-clamp-1">
                          {policeNocDoc ? `✓ ${policeNocDoc.name}` : 'Police Dept NOC'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Experience & Overview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinical Experience, Infrastructure &amp; Operational Capacity
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your medical team, experience, equipment, or service turnaround time..."
                  value={form.bioOrExperience}
                  onChange={(e) => setForm({ ...form, bioOrExperience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                />
              </div>

              {/* Mandatory Consent Checkbox (Requirement 3 & 7) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.agreeTerms}
                    onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#008080] rounded border-slate-300 focus:ring-[#008080] cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    I agree to the <span className="font-bold text-[#002b49]">Terms &amp; Conditions</span> and <span className="font-bold text-[#002b49]">Privacy Policy</span> of Nhealth Unified Healthcare Technologies Private Limited. I certify that all submitted licenses, registration proofs, and identity documents are authentic. <span className="text-red-500 font-bold">(Mandatory)</span>
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0" />
                  <span>All partner profiles undergo strict credentialing before going Live.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !form.agreeTerms}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    !form.agreeTerms || isSubmitting
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60 shadow-none'
                      : 'bg-gradient-to-r from-[#002b49] via-[#003859] to-[#002b49] hover:from-[#00172b] hover:to-[#00172b] text-white shadow-lg hover:shadow-xl ring-2 ring-[#008080]/30 active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  <span>{isSubmitting ? 'Submitting Credentials...' : 'Submit Request'}</span>
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
