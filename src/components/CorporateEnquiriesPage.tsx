import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  Ambulance,
  Home,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  FileCheck2,
  Clock,
  Briefcase,
  Send,
  Building,
  Check,
  Award,
  Zap,
  X
} from 'lucide-react';
import { addEnquiry, EnquiryRecord } from '../types/enquiry';

interface CorporateEnquiriesPageProps {
  onNavigateHome: () => void;
  onNavigatePartner?: () => void;
  onEnquirySubmitted?: (enquiry: EnquiryRecord) => void;
}

export const CorporateEnquiriesPage: React.FC<CorporateEnquiriesPageProps> = ({
  onNavigateHome,
  onNavigatePartner,
  onEnquirySubmitted,
}) => {
  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    corporateEmail: '',
    designation: '',
    mobileNumber: '',
    employeeCount: '500-2000',
    cityLocation: '',
    requirementDescription: '',
    selectedOfferings: [
      'Annual Corporate Health Audits & Executive Health Checks',
      'Onsite Occupational Health Centers & Emergency Ambulance Protocols',
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const employeeOptions = [
    { id: '<100', label: '< 100 Employees', sub: 'Startups & Boutique Teams' },
    { id: '100-500', label: '100 - 500 Employees', sub: 'Growing Mid-Market Orgs' },
    { id: '500-2000', label: '500 - 2,000 Employees', sub: 'Large Tech & Corporate Campuses' },
    { id: '2000+', label: '2,000+ Employees', sub: 'Enterprise Conglomerates & Plants' },
  ];

  const enterpriseOfferings = [
    {
      id: 'audits-checks',
      title: 'Annual Corporate Health Audits & Executive Health Checks',
      tag: 'PREVENTIVE DIAGNOSTICS & HRAs',
      icon: Activity,
      color: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      description:
        'Comprehensive onsite corporate health camps and executive health packages for CXOs and team members across corporate parks and campuses.',
      highlights: [
        'Over 100+ diagnostic biomarkers screened (Cardiac, Liver, Renal, HbA1c, Vitamin D/B12)',
        'Anonymized corporate Health Risk Assessment (HRA) analytics for HR leadership',
        'Direct phlebotomist camps at company premises with digital report delivery within 24 hours',
        'Executive VIP express checkups at partner tertiary hospital lounges',
      ],
      deliverable: 'Digital Employee Health Portal + Consolidated Corporate Wellness Index',
    },
    {
      id: 'ohc-ambulance',
      title: 'Onsite Occupational Health Centers & Emergency Ambulance Protocols',
      tag: 'STATUTORY COMPLIANCE & SAFETY',
      icon: Ambulance,
      color: 'from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      description:
        'Turnkey setup and complete medical staffing of Occupational Health Centers (OHC) compliant with the Indian Factories Act, state labor laws, and corporate safety protocols.',
      highlights: [
        'Dedicated certified occupational nurses & visiting industrial medicine physicians',
        '24x7 ALS/BLS Emergency Ambulance standby dedicated to your tech park / facility',
        'Automated External Defibrillator (AED) training & workplace emergency triage protocols',
        'Pre-employment health clearances and annual occupational fitness certifications',
      ],
      deliverable: '100% Statutory OHC Compliance + 15-Minute Response Code Blue Guarantee',
    },
    {
      id: 'family-care',
      title: 'Employee Family At-Home Care & Eldercare Subscriptions',
      tag: 'HOLISTIC DEPENDENT CARE',
      icon: Home,
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      description:
        'Extend empathetic healthcare benefits beyond the employee cubicle to dependent parents, spouses, and children with home-delivered clinical care.',
      highlights: [
        'Pan-India home doctor consultations, bedside nursing, and post-hospitalization recovery',
        'Dedicated geriatric eldercare subscriptions for parents of employees living in Tier 1 & 2 cities',
        'Doorstep routine medicine refills with corporate subsidy integration',
        'Specialist home physiotherapy and chronic illness coaching (Diabetes, Hypertension)',
      ],
      deliverable: 'Care Coordinator Concierge + Zero-Hassle Direct Corporate Billing',
    },
    {
      id: 'vital-lens',
      title: 'Nhealth Vital Lens™ AI-Powered Preventive Health Drives',
      tag: 'AI HEALTH TECH INNOVATION',
      icon: Sparkles,
      color: 'from-purple-600 to-teal-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      description:
        'Revolutionary contactless vital scanning kiosks and mobile engagement drives powered by optical computer vision for high-energy corporate wellness weeks.',
      highlights: [
        'Contactless 60-second vital check: Estimated Heart Rate, HRV, Stress Index, SpO2 & Respiratory rhythm',
        'Zero hardware invasiveness: instant scan via employee smartphone or onsite tablet kiosks',
        'Gamified health challenges, ergonomic workspace assessments, and posture screenings',
        'Live wellness workshops conducted by senior cardiologists and clinical nutritionists',
      ],
      deliverable: 'Real-time Vital Lens™ Kiosk Deployment + Employee Engagement Badges',
    },
  ];

  const toggleOffering = (title: string) => {
    setFormData((prev) => {
      const exists = prev.selectedOfferings.includes(title);
      return {
        ...prev,
        selectedOfferings: exists
          ? prev.selectedOfferings.filter((t) => t !== title)
          : [...prev.selectedOfferings, title],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const refId = 'NH-CORP-' + Math.floor(100000 + Math.random() * 900000);
    setSubmittedRefId(refId);

    // Centralize submissions to Admin Dashboard store
    const newEnquiry = addEnquiry({
      id: refId,
      type: 'Corporate Enquiry',
      name: formData.contactPerson,
      companyName: formData.companyName,
      designation: formData.designation,
      email: formData.corporateEmail,
      phone: formData.mobileNumber,
      employeeCount: formData.employeeCount,
      location: formData.cityLocation,
      categoryOrService: 'Corporate Health & Institutional Packages',
      selectedOfferings: formData.selectedOfferings,
      requirements:
        formData.requirementDescription ||
        `Offerings: ${formData.selectedOfferings.join(', ')}. Workforce: ${formData.employeeCount}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      rawPayload: {
        ...formData,
        submittedVia: 'CorporateEnquiriesPage',
      },
    });

    if (onEnquirySubmitted) {
      onEnquirySubmitted(newEnquiry);
    }

    // Direct email to support@nhealth.in and WhatsApp links completely removed as requested.

    // Trigger the standard Nhealth Thank You pop-up modal
    setIsSubmitting(false);
    setShowThankYouModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#008080]/15 selection:text-[#002b49]">
      {/* Top Corporate Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#008080] transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Patient Portal</span>
              <span className="sm:hidden">Home</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl text-[#002b49] tracking-tight">
                Nhealth<span className="text-[#008080]">™</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-teal-50 text-[#008080] border border-teal-200">
                <Building2 className="w-3 h-3" />
                Enterprise Health
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="tel:+919393932969"
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#008080] transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <Phone className="w-3.5 h-3.5 text-[#008080]" />
              <span>+91 9393932969</span>
            </a>

            <a
              href="mailto:support@nhealth.in"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>support@nhealth.in</span>
            </a>

            <button
              type="button"
              onClick={() => {
                const formElem = document.getElementById('corporate-form-section');
                formElem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#008080] to-[#006666] hover:from-[#006666] hover:to-[#004d4d] text-white text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Request Corporate RFP
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-[#00172b] via-[#002b49] to-[#00475b] text-white overflow-hidden py-16 sm:py-20 lg:py-24">
        {/* Abstract Ambient Medical Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00d2c4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Enterprise Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-teal-300/30 text-teal-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-6 shadow-xs">
              <Building className="w-3.5 h-3.5" />
              Corporate &amp; Institutional Healthcare Solutions
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] mb-6">
              Elevating Enterprise Health &amp; Workforce Wellness
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed font-normal mb-8">
              Tailored healthcare ecosystems for Indian enterprises, IT parks, and institutions—combining preventive wellness, onsite medical care, and complete family health coverage.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('corporate-form-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#00d2c4] hover:bg-[#00bfa5] text-[#002b49] font-black px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-lg shadow-teal-900/30 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Submit Enterprise Enquiry</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('enterprise-offerings')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all cursor-pointer backdrop-blur-xs"
              >
                Explore 4 Core Offerings
              </button>
            </div>
          </div>

          {/* Institutional Trust Indicators */}
          <div className="mt-14 pt-10 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#00d2c4]">450+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Corporate Campuses &amp; Parks</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#00d2c4]">50+ Cities</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Pan-India Doorstep Coverage</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#00d2c4]">99.4%</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Onsite SLA &amp; Safety Compliance</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#00d2c4]">&lt;15 Mins</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Emergency Ambulance Protocol</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 4 Enterprise Offerings */}
      <section id="enterprise-offerings" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-[#008080] border border-teal-200 mb-3">
              <Award className="w-3.5 h-3.5" />
              Four Comprehensive Pillars
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#002b49] tracking-tight">
              Enterprise Offerings Engineered for Indian Workforces
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              From proactive health risk identification to full turnkey occupational centers and remote family medical subsidies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {enterpriseOfferings.map((offering, idx) => {
              const Icon = offering.icon;
              return (
                <div
                  key={offering.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#008080]/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${offering.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${offering.badgeBg}`}>
                        {offering.tag}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-400 mb-1">
                      OFFERING 0{idx + 1}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#002b49] mb-3 leading-snug">
                      {offering.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {offering.description}
                    </p>

                    <div className="space-y-2.5 mb-6">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Key Capabilities &amp; Inclusions:
                      </div>
                      {offering.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#008080] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="font-semibold text-slate-500">
                      Primary Deliverable:{' '}
                      <span className="text-[#002b49] font-bold block sm:inline">
                        {offering.deliverable}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Indian Enterprises Choose Nhealth Section */}
      <section className="py-14 sm:py-18 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#008080]">
                Measurable Impact &amp; ROI
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#002b49] leading-tight">
                Designed to Safeguard Human Capital &amp; Boost Productivity
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Indian corporates lose an estimated ₹1.4 lakh crore annually to unplanned employee absenteeism and delayed chronic illness management. Nhealth creates an integrated, preventive safety net.
              </p>
              <div className="pt-2">
                <a
                  href="tel:+919393932969"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#008080] hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  Speak to Enterprise Accounts Desk: +91 9393932969
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-black">
                  28%
                </div>
                <h4 className="text-base font-bold text-[#002b49]">Reduced Sick Leave Days</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Proactive vital monitoring and timely chronic condition management decrease unplanned medical leaves.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                  100%
                </div>
                <h4 className="text-base font-bold text-[#002b49]">Statutory OHC Audit Compliance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Meets Indian Directorate of Industrial Safety and Health (DISH) and Factories Act medical guidelines.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                  50+
                </div>
                <h4 className="text-base font-bold text-[#002b49]">Cities Family Home Support</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parents of employees in native towns and tier-2 hubs receive the same world-class doorstep care.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  HIPAA
                </div>
                <h4 className="text-base font-bold text-[#002b49]">Zero-Trust Data Protection</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Employee medical records remain 100% private. HR receives only aggregate, anonymized health trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Inquiry Form Section */}
      <section id="corporate-form-section" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white via-slate-50 to-teal-50/40 rounded-3xl border border-teal-500/30 p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
            {/* Header of Form */}
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#002b49] text-white mb-3">
                <Briefcase className="w-3.5 h-3.5 text-[#00d2c4]" />
                Institutional RFP &amp; Proposal Request
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#002b49] tracking-tight">
                Request a Custom Corporate Healthcare Proposal
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Please complete the enterprise details below. Our corporate medical solutions team will review your requirements and reach out within 4 business hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Company Name & Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Company / Entity Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Infosys Technologies, Tata Consultancy Services"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma, Rajesh Menon"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Corporate Email ID & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Corporate Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. hr@company.com or priya.s@corp.in"
                      value={formData.corporateEmail}
                      onChange={(e) => setFormData({ ...formData, corporateEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Official enterprise email domain preferred for fast-track processing.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Designation / Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. VP Human Resources, EHS Lead, Admin Head"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Mobile Number & City/Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="9876543210"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="w-full pl-3 pr-4 py-3 rounded-r-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    City / Campus Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru, Electronic City / Hyderabad / Gurugram"
                      value={formData.cityLocation}
                      onChange={(e) => setFormData({ ...formData, cityLocation: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Employee Count Selection (<100, 100-500, 500-2000, 2000+) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Workforce / Employee Count Selection <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {employeeOptions.map((opt) => {
                    const isSelected = formData.employeeCount === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, employeeCount: opt.id })}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#008080] bg-teal-50/80 ring-2 ring-[#008080]/30 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-black ${isSelected ? 'text-[#002b49]' : 'text-slate-800'}`}>
                            {opt.label}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#008080]" />}
                        </div>
                        <span className="text-[11px] text-slate-500 leading-tight">
                          {opt.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Primary Offerings of Interest */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Primary Enterprise Offerings Needed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {enterpriseOfferings.map((offering) => {
                    const isChecked = formData.selectedOfferings.includes(offering.title);
                    return (
                      <label
                        key={offering.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-teal-50/60 border-teal-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOffering(offering.title)}
                          className="mt-0.5 rounded-sm border-slate-300 text-[#008080] focus:ring-[#008080]"
                        />
                        <div className="text-xs font-medium leading-snug">
                          <span className="font-bold text-[#002b49] block">{offering.title}</span>
                          <span className="text-[11px] text-slate-500">{offering.tag}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Requirement Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Requirement Description &amp; Specific Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your specific corporate health requirements: e.g., Onsite OHC setup for 800 staff in Electronic City, Annual master health checks across 3 offices, 24x7 ambulance standby, or custom wellness days..."
                  value={formData.requirementDescription}
                  onChange={(e) => setFormData({ ...formData, requirementDescription: e.target.value })}
                  className="w-full p-4 rounded-xl border border-slate-300 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all leading-relaxed"
                />
              </div>

              {/* Trust Callout */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-[#008080] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900">Enterprise Privacy Guarantee:</strong> All employee medical consultations and diagnostic findings adhere to the Indian Digital Personal Data Protection (DPDP) Act, HIPAA, and medical confidentiality protocols.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                  Questions? Call direct corporate helpline:{' '}
                  <a href="tel:+919393932969" className="font-bold text-[#008080] hover:underline">
                    +91 9393932969
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#008080] via-[#006666] to-[#002b49] hover:opacity-95 text-white text-sm sm:text-base font-black shadow-lg shadow-teal-900/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Processing Corporate Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Corporate Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Corporate Institutional Footer */}
      <footer className="bg-[#00172b] text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-black text-lg text-white">Nhealth™ Enterprise</span>
              <span>•</span>
              <span>Unified Corporate &amp; Institutional Healthcare Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Patient Portal
              </button>
              {onNavigatePartner && (
                <button
                  type="button"
                  onClick={onNavigatePartner}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Healthcare Partner Portal
                </button>
              )}
              <a href="mailto:support@nhealth.in" className="hover:text-white transition-colors">
                support@nhealth.in
              </a>
            </div>
          </div>
          <div className="pt-6 text-center md:text-left text-[11px] text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
            <div>
              © {new Date().getFullYear()} Nhealth Unified Healthcare Technologies Private Limited. All rights reserved.
            </div>
            <div>
              Enterprise Healthcare • OHC Management • Vital Lens™ AI • Pan-India Home Healthcare
            </div>
          </div>
        </div>
      </footer>

      {/* Standard Nhealth Thank You Pop-up Modal */}
      {showThankYouModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowThankYouModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient strip */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#008080] via-teal-500 to-[#002b49]" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close thank you modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-teal-50 text-[#008080] border-2 border-teal-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#002b49]">
                Thank You for Your Enquiry
              </h3>
              {submittedRefId && (
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-mono text-xs font-bold border border-teal-200">
                  Ref: {submittedRefId}
                </div>
              )}
            </div>

            {/* Exact Required Message Content */}
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed text-left">
              <p className="font-semibold text-slate-900">
                Thank you for your interest in Nhealth.
              </p>
              <p>
                We sincerely appreciate you reaching out to us. Your enquiry has been received successfully, and our team will review your request and get in touch with you shortly.
              </p>
              <p>
                At Nhealth, we are committed to delivering integrated, technology-driven healthcare solutions that make quality healthcare more accessible, convenient, and affordable.
              </p>
              <p>
                We look forward to connecting with you and building a valuable association.
              </p>

              <div className="pt-3 border-t border-slate-100 space-y-0.5">
                <p className="font-bold text-[#002b49]">Warm Regards,</p>
                <p className="font-bold text-[#008080]">Team Nhealth</p>
                <p className="text-[11px] sm:text-xs text-slate-500 italic">
                  Powering the Future of Unified &amp; At-Home Healthcare.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowThankYouModal(false);
                  onNavigateHome();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Return to Homepage
              </button>
              <button
                type="button"
                onClick={() => setShowThankYouModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#008080] to-[#006666] hover:from-[#006666] hover:to-[#004d4d] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Close &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
