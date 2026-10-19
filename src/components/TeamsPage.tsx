import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Stethoscope,
  Code2,
  Network,
  Activity,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Building2,
  CheckCircle2,
  HeartPulse,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Send,
  X,
  Lock,
  Globe2,
  Award
} from 'lucide-react';
import { addEnquiry } from '../types/enquiry';

interface TeamsPageProps {
  onNavigateHome: () => void;
  onNavigatePartner?: () => void;
  onNavigateCorporate?: () => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({
  onNavigateHome,
  onNavigatePartner,
  onNavigateCorporate,
}) => {
  // Official Nhealth Logo from https://ibb.co/SDYB7XbW
  const officialLogoUrl = 'https://i.ibb.co/JW6HFRV0/Nhealth-logo-8cm-x-8cm-high-quality-1-1.png';
  const fallbackLogoUrl = 'https://i.ibb.co/wZG4rNV3/Nhealth-logo-8cm-x-8cm-high-quality-1-1.png';

  const [activePillar, setActivePillar] = useState<'clinical' | 'tech' | 'network'>('clinical');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [careerFormData, setCareerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pillar: 'Clinical Ops',
    experience: '3-5 years',
    message: '',
  });

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Save to central enquiries store
    addEnquiry({
      id: `NH-TEAM-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Talent & Team Application',
      name: careerFormData.name,
      email: careerFormData.email,
      phone: careerFormData.phone,
      categoryOrService: careerFormData.pillar,
      requirements: `Target Pillar: ${careerFormData.pillar} | Experience: ${careerFormData.experience} | Message/Profile: ${careerFormData.message || 'N/A'}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      rawPayload: {
        ...careerFormData,
        source: 'TeamsPage',
      },
    });

    setTimeout(() => {
      setShowRoleModal(false);
      setFormSubmitted(false);
      setCareerFormData({
        name: '',
        email: '',
        phone: '',
        pillar: 'Clinical Ops',
        experience: '3-5 years',
        message: '',
      });
    }, 2500);
  };

  const pillars = [
    {
      id: 'clinical',
      key: 'clinical' as const,
      name: 'Clinical Ops',
      fullName: 'Clinical Operations & Medical Quality Governance',
      tagline: 'NABH-Standard Care Protocols & Patient Safety',
      icon: Stethoscope,
      accentColor: 'from-[#008080] to-emerald-600',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      stats: [
        { label: 'Verified Specialists', value: '250+' },
        { label: 'Protocol Adherence', value: '99.8%' },
        { label: 'Emergency Triage Benchmark', value: '< 15 mins' },
      ],
      description:
        'Our Clinical Operations command team bridges bedside medicine, hospital emergency wards, tele-triage consultations, and home-care patient interventions with uncompromising safety benchmarks and clinical governance.',
      coreResponsibilities: [
        'Rigorous doctor, nurse, and allied medical personnel credentialing & background verification',
        'NABH-aligned clinical standard operating procedures (SOPs) for acute and chronic home care',
        '24/7 tele-triage escalation matrix and hospital tertiary care transfer protocols',
        'Continuous clinical mortality and morbidity audits, feedback reviews, and pharmacovigilance',
      ],
      disciplines: [
        'Emergency Medicine Specialists',
        'Critical Care Physicians & MD Internists',
        'Certified Home ICU Nursing Leads',
        'Clinical Quality & NABH Auditors',
      ],
    },
    {
      id: 'tech',
      key: 'tech' as const,
      name: 'Tech & Product',
      fullName: 'Technology, AI & Digital Health Products',
      tagline: 'High-Availability Architectures & Contactless AI Diagnostics',
      icon: Code2,
      accentColor: 'from-[#002b49] to-cyan-700',
      badgeColor: 'bg-blue-50 text-[#002b49] border-blue-200',
      stats: [
        { label: 'Platform Availability', value: '99.99%' },
        { label: 'API Response Latency', value: '< 50 ms' },
        { label: 'Data Encryption Standard', value: 'AES-256' },
      ],
      description:
        'The Tech & Product division engineers the backbone of Nhealth: high-performance teleconsultation pipelines, VitalLens AI contactless vitals screening, real-time GPS ambulance telemetry, and ABDM-compliant health record interoperability.',
      coreResponsibilities: [
        'VitalLens AI engine for contactless biometric extraction (Pulse, HRV, Respiration, Stress) via standard cameras',
        'ABDM (Ayushman Bharat Digital Mission) FHIR health record pipelines with strict data privacy',
        'Zero-trust microservices architecture with role-based access controls and end-to-end encryption',
        'Real-time dispatch coordination engine for ambulances, home nurses, and diagnostic phlebotomists',
      ],
      disciplines: [
        'Distributed Systems & Cloud Architects',
        'Computer Vision & Bio-Signal AI Engineers',
        'Full-Stack Frontend & Mobile Developers',
        'Cybersecurity & HIPAA/ABDM Compliance Officers',
      ],
    },
    {
      id: 'network',
      key: 'network' as const,
      name: 'Network Expansion',
      fullName: 'Provider Alliances, Hospital & City Growth',
      tagline: 'Hyperlocal Provider Grid & Institutional Alliances',
      icon: Network,
      accentColor: 'from-[#003e6b] to-[#008080]',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      stats: [
        { label: 'Provider Nodes', value: '500+' },
        { label: 'Operational Hubs', value: '18+ Cities' },
        { label: 'Home Delivery Radius', value: '15 Mins' },
      ],
      description:
        'The Network Expansion team builds the physical fabric of Nhealth by onboarding certified diagnostic labs, licensed retail pharmacies, premier hospital emergency networks, and corporate enterprise clients nationwide.',
      coreResponsibilities: [
        'Strategic alliances with tertiary and quaternary multi-specialty hospital chains for cashless beds & emergency admissions',
        'Hyperlocal integration with NABL-accredited diagnostic labs for 60-minute doorstep sample collection',
        'Last-mile fulfillment network for verified pharmacy delivery and home medical equipment supply',
        'Enterprise healthcare and occupational wellness deployments for corporate campuses and industrial hubs',
      ],
      disciplines: [
        'Hospital & Institutional Alliance Leads',
        'Diagnostic Laboratory Network Managers',
        'Hyperlocal Operations & Logistics Directors',
        'Enterprise Corporate Wellness Consultants',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Corporate Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-3 group focus:outline-hidden text-left"
              title="Return to Nhealth Home"
            >
              <div className="h-12 w-12 rounded-xl bg-white border border-teal-500/20 shadow-xs flex items-center justify-center p-1 group-hover:border-teal-500 transition-all overflow-hidden">
                <img
                  src={officialLogoUrl}
                  alt="Nhealth Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Fallback to secondary mirror if network blocks primary
                    const target = e.currentTarget;
                    if (target.src !== fallbackLogoUrl) {
                      target.src = fallbackLogoUrl;
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002b49] group-hover:text-[#008080] transition-colors">
                    Nhealth
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/80">
                    Teams
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 tracking-normal hidden sm:block">
                  Unified Healthcare Technologies
                </span>
              </div>
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#008080] bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            {onNavigateCorporate && (
              <button
                type="button"
                onClick={onNavigateCorporate}
                className="hidden md:inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#008080] rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Corporate Enquiries</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#002b49] to-[#008080] hover:from-[#001d31] hover:to-[#006666] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Join Our Team</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Dedicated "Welcome to Nhealth Teams" Hero Section */}
        <section
          id="teams"
          className="relative overflow-hidden bg-gradient-to-b from-[#002b49] via-[#003456] to-[#00223a] text-white pt-14 pb-20 sm:pt-20 sm:pb-28"
        >
          {/* Subtle Ambient Radial Glowing Lights & Background Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 128, 128, 0.3) 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-teal-200/80 mb-6 animate-fade-in-up">
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-semibold">Teams</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Heading, Overview, & Mission */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide uppercase shadow-inner animate-fade-in-up">
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>The Minds, Clinicians &amp; Builders</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white animate-fade-in-up">
                  Welcome to <br />
                  <span className="bg-gradient-to-r from-teal-300 via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                    Nhealth Teams
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl animate-fade-in-up-delay-1 font-normal">
                  At <strong>Nhealth Unified Healthcare Technologies</strong>, we are uniting clinical
                  excellence, high-reliability engineering, and rapid ground logistics to make world-class
                  healthcare accessible across India in minutes—not days.
                </p>

                {/* Key Pillars Quick Switch Buttons */}
                <div className="pt-2 flex flex-wrap gap-2.5 animate-fade-in-up-delay-2">
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('clinical')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 hover:border-teal-400"
                  >
                    <Stethoscope className="w-4 h-4 text-teal-300" />
                    <span>Clinical Ops</span>
                  </a>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('tech')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 hover:border-teal-400"
                  >
                    <Code2 className="w-4 h-4 text-cyan-300" />
                    <span>Tech &amp; Product</span>
                  </a>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('network')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 hover:border-teal-400"
                  >
                    <Network className="w-4 h-4 text-emerald-300" />
                    <span>Network Expansion</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-6 text-slate-300 text-xs sm:text-sm animate-fade-in-up-delay-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>NABH-Aligned Standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>HIPAA &amp; ABDM Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pan-India Healthcare Grid</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Prominent Nhealth Logo Card with Glowing Highlights & Animation */}
              <div className="lg:col-span-5 flex justify-center animate-fade-in-up-delay-1">
                <div className="relative w-full max-w-md">
                  {/* Subtle Glowing Aura */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500/40 via-cyan-400/30 to-blue-600/40 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />

                  {/* Glassmorphic White Container */}
                  <div className="relative rounded-3xl bg-white/95 p-8 sm:p-10 shadow-2xl border border-teal-500/30 backdrop-blur-xl flex flex-col items-center text-center">
                    {/* Official Image Container */}
                    <div className="w-48 h-36 sm:w-56 sm:h-44 flex items-center justify-center p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-inner group">
                      <img
                        src={officialLogoUrl}
                        alt="Nhealth Official Logo"
                        className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== fallbackLogoUrl) {
                            target.src = fallbackLogoUrl;
                          }
                        }}
                      />
                    </div>

                    <div className="mt-5 space-y-1.5 text-slate-800">
                      <div className="text-xl font-bold tracking-tight text-[#002b49]">
                        Nhealth Unified Healthcare
                      </div>
                      <div className="text-xs font-semibold text-teal-700 uppercase tracking-widest">
                        Technologies Private Limited
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                      Transforming the Indian healthcare continuum with integrated doctor visits,
                      contactless AI diagnostics, emergency hospital beds, and home care.
                    </p>

                    <div className="mt-6 w-full pt-4 border-t border-slate-100 flex items-center justify-around text-center">
                      <div>
                        <div className="text-base sm:text-lg font-bold text-[#002b49]">250+</div>
                        <div className="text-[11px] text-slate-500 font-medium">Clinicians</div>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <div className="text-base sm:text-lg font-bold text-teal-700">40+</div>
                        <div className="text-[11px] text-slate-500 font-medium">Engineers</div>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <div className="text-base sm:text-lg font-bold text-[#003e6b]">18+</div>
                        <div className="text-[11px] text-slate-500 font-medium">Cities Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Overview Section */}
        <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Corporate Overview</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002b49] tracking-tight">
                Architecting the Future of Integrated Healthcare in India
              </h2>
              <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
                Nhealth operates at the nexus of clinical medicine, automated triage protocols, and software
                reliability to overcome fragmented healthcare silos and empower families with proactive,
                round-the-clock medical security.
              </p>
            </div>

            {/* 3 Pillar Summary Cards Grid with Glowing Hover Effect & Clean Border Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Clinical Ops */}
              <div className="corporate-glow-card rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-5 shadow-xs">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
                    Pillar 01
                  </div>
                  <h3 className="text-xl font-bold text-[#002b49] mb-3">Clinical Ops</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Upholding patient safety, hospital triage pathways, verified doctor accreditations,
                    and standardized NABH care delivery for both emergency and home healthcare regimes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#008080]">
                  <span>250+ Verified Specialists</span>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('clinical')}
                    className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Inspect Pillar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 2: Tech & Product */}
              <div className="corporate-glow-card rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#002b49] flex items-center justify-center mb-5 shadow-xs">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#003e6b] mb-1">
                    Pillar 02
                  </div>
                  <h3 className="text-xl font-bold text-[#002b49] mb-3">Tech &amp; Product</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Building fault-tolerant teleconsultation pipelines, VitalLens contactless biometric
                    scanning, real-time GPS ambulance dispatch, and ABDM-compliant health record vaults.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003e6b]">
                  <span>99.99% Core Uptime</span>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('tech')}
                    className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Inspect Pillar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 3: Network Expansion */}
              <div className="corporate-glow-card rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-5 shadow-xs">
                    <Network className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    Pillar 03
                  </div>
                  <h3 className="text-xl font-bold text-[#002b49] mb-3">Network Expansion</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Expanding institutional alliances across accredited multi-specialty hospitals,
                    NABL diagnostic laboratories, licensed pharmacies, and corporate campus wellness programs.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>500+ Partner Nodes</span>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('network')}
                    className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Inspect Pillar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive: 3 Team Pillars Interactive Showcase */}
        <section id="pillars" className="py-16 sm:py-24 bg-slate-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                  Operational Core
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002b49]">
                  The 3 Core Pillars of Nhealth
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
                  Explore how each specialized division operates to maintain clinical precision,
                  software velocity, and institutional scale.
                </p>
              </div>

              {/* Pillar Selector Tabs */}
              <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  const isSelected = activePillar === pillar.key;
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => setActivePillar(pillar.key)}
                      className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#002b49] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{pillar.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Pillar Full Detail Card */}
            {pillars
              .filter((p) => p.key === activePillar)
              .map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="corporate-border-highlight rounded-3xl bg-white p-6 sm:p-10 shadow-lg border border-teal-500/20 transition-all animate-fade-in-up"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Header & Responsibilities */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shadow-xs">
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                              {pillar.name} Division
                            </span>
                            <h3 className="text-xl sm:text-3xl font-extrabold text-[#002b49]">
                              {pillar.fullName}
                            </h3>
                          </div>
                        </div>

                        <p className="text-base text-slate-700 leading-relaxed font-normal">
                          {pillar.description}
                        </p>

                        {/* Core Responsibilities List */}
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Core Strategic Mandate
                          </div>
                          <div className="space-y-2.5">
                            {pillar.coreResponsibilities.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                                <span className="text-xs sm:text-sm text-slate-700 font-medium">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Metrics & Disciplines */}
                      <div className="lg:col-span-5 space-y-6">
                        {/* Key Performance Indicators */}
                        <div className="rounded-2xl bg-gradient-to-br from-[#002b49] to-[#003e6b] text-white p-6 shadow-md">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">
                            <Award className="w-4 h-4 text-teal-400" />
                            <span>Pillar Benchmarks</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {pillar.stats.map((s, idx) => (
                              <div key={idx} className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-xl sm:text-2xl font-black text-white">
                                  {s.value}
                                </div>
                                <div className="text-[11px] text-teal-200/90 font-medium mt-0.5">
                                  {s.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Disciplines & Roles In This Pillar */}
                        <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Specialized Disciplines
                          </div>
                          <div className="space-y-2">
                            {pillar.disciplines.map((disc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-200/60 last:border-0"
                              >
                                <span className="font-semibold text-slate-800">{disc}</span>
                                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                  Active Focus
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRole(pillar.name);
                                setCareerFormData((prev) => ({ ...prev, pillar: pillar.name }));
                                setShowRoleModal(true);
                              }}
                              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Briefcase className="w-4 h-4" />
                              <span>Apply to {pillar.name} Roles</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Culture & Core Values Section */}
        <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b49]">
                Our Operating Principles
              </h2>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                How our clinicians and engineers collaborate every single day to serve our patients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                  01
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Patient-First Integrity</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every software deployment and operational protocol is measured against direct clinical
                  outcomes and patient recovery.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Clinical Zero-Tolerance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No compromises on credentialing, cold-chain medication integrity, or ambulance triage
                  equipment readiness.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Engineering Velocity</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-speed continuous integration with sub-second health data synchronization and
                  unyielding data privacy.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                  04
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Radical Empathy &amp; Speed</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Healthcare emergencies require compassionate, urgent execution. We treat every patient
                  as our own family member.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join Our Mission Banner */}
        <section className="py-16 bg-gradient-to-r from-[#002b49] via-[#003e6b] to-[#008080] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Shape India&apos;s Healthcare Future?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto">
              We are continuously looking for doctors, emergency paramedics, software engineers, and
              healthcare alliance leads to join our growing teams.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="px-6 py-3 rounded-xl bg-white text-[#002b49] hover:bg-slate-100 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Explore Open Roles &amp; Careers
              </button>
              {onNavigatePartner && (
                <button
                  type="button"
                  onClick={onNavigatePartner}
                  className="px-6 py-3 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  Onboard as a Healthcare Partner
                </button>
              )}
              <a
                href="mailto:support@nhealth.in"
                className="px-6 py-3 rounded-xl bg-transparent hover:bg-white/10 text-white font-semibold text-sm transition-all"
              >
                support@nhealth.in
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src={officialLogoUrl}
                  alt="Nhealth Logo"
                  className="h-8 w-auto object-contain bg-white rounded-md p-0.5"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallbackLogoUrl) {
                      target.src = fallbackLogoUrl;
                    }
                  }}
                />
                <span className="text-white font-bold text-base">Nhealth Teams</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Nhealth Unified Healthcare Technologies Private Limited.
              </p>
              <div className="text-[11px] text-teal-400">
                Official Support: support@nhealth.in | careers@nhealth.in
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <div className="text-white font-bold uppercase tracking-wider text-xs mb-3">
                Quick Navigation
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <a href="#teams" className="text-teal-400 font-semibold cursor-pointer">
                    Teams (#teams)
                  </a>
                </li>
                {onNavigateCorporate && (
                  <li>
                    <button
                      type="button"
                      onClick={onNavigateCorporate}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Corporate Enquiries
                    </button>
                  </li>
                )}
                {onNavigatePartner && (
                  <li>
                    <button
                      type="button"
                      onClick={onNavigatePartner}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Partner With Us
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Pillars */}
            <div>
              <div className="text-white font-bold uppercase tracking-wider text-xs mb-3">
                Team Pillars
              </div>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('clinical')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Clinical Ops
                  </a>
                </li>
                <li>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('tech')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Tech &amp; Product
                  </a>
                </li>
                <li>
                  <a
                    href="#pillars"
                    onClick={() => setActivePillar('network')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Network Expansion
                  </a>
                </li>
              </ul>
            </div>

            {/* Emergency & Helpline */}
            <div>
              <div className="text-white font-bold uppercase tracking-wider text-xs mb-3">
                24/7 Operations Hub
              </div>
              <p className="text-slate-400 text-xs mb-2">
                Emergency &amp; Clinical Escalation Hotline:
              </p>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rose-400" />
                <span>+91 98765 43210</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Pan-India dispatch coordination active 24 hours a day, 365 days a year.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              &copy; {new Date().getFullYear()} Nhealth Unified Healthcare Technologies Private Limited. All
              rights reserved.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span>&bull;</span>
              <span className="hover:text-white cursor-pointer">Clinical Governance</span>
              <span>&bull;</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Careers / Join Team Interest Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-fade-in-up">
            <button
              type="button"
              onClick={() => setShowRoleModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {formSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#002b49]">Application Received!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you for your interest in joining <strong>Nhealth Teams</strong>. Our Talent
                  Acquisition &amp; Clinical Review committee will reach out to you within 48 hours.
                </p>
                <div className="text-xs text-slate-400">
                  Reference forwarded to: careers@nhealth.in &amp; support@nhealth.in
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#002b49]">Join Nhealth Teams</h3>
                    <p className="text-xs text-slate-500">
                      Connect with our Clinical Ops, Tech, or Network teams
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRoleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Priya Sharma / Arun Verma"
                      value={careerFormData.name}
                      onChange={(e) =>
                        setCareerFormData({ ...careerFormData, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={careerFormData.email}
                        onChange={(e) =>
                          setCareerFormData({ ...careerFormData, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit number"
                        value={careerFormData.phone}
                        onChange={(e) =>
                          setCareerFormData({ ...careerFormData, phone: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Pillar</label>
                      <select
                        value={careerFormData.pillar}
                        onChange={(e) =>
                          setCareerFormData({ ...careerFormData, pillar: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden bg-white"
                      >
                        <option value="Clinical Ops">Clinical Ops</option>
                        <option value="Tech & Product">Tech &amp; Product</option>
                        <option value="Network Expansion">Network Expansion</option>
                        <option value="Medical Governance">Medical Governance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Experience</label>
                      <select
                        value={careerFormData.experience}
                        onChange={(e) =>
                          setCareerFormData({ ...careerFormData, experience: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden bg-white"
                      >
                        <option value="1-3 years">1 - 3 years</option>
                        <option value="3-5 years">3 - 5 years</option>
                        <option value="5-10 years">5 - 10 years</option>
                        <option value="10+ years">10+ years (Lead/Director)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Brief Background / Profile Link (LinkedIn / Portfolio)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Share a short note or link to your credentials/portfolio..."
                      value={careerFormData.message}
                      onChange={(e) =>
                        setCareerFormData({ ...careerFormData, message: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#002b49] to-[#008080] text-white font-bold text-sm shadow-md hover:from-[#001d31] hover:to-[#006666] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Application to Talent Team</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
