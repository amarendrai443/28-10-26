import React from 'react';
import {
  Search,
  Award,
  Home,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  HeartPulse,
  Download,
  CalendarCheck,
  Lock,
} from 'lucide-react';

export const HowNhealthWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Describe Your Health Concern',
      description: 'Search bar input, location auto-detect, instant symptom mapping and triage.',
      icon: Search,
      tag: 'AI Clinical Triage',
      badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-500/30',
      iconBg: 'from-teal-600 to-cyan-700',
    },
    {
      number: '02',
      title: 'Select or Auto-Match Your Specialist',
      description: "Choose doctors or click 'Find Me The Best Doctor' for an algorithmic match.",
      icon: Award,
      tag: 'Empaneled Specialists',
      badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
      iconBg: 'from-amber-500 to-orange-600',
    },
    {
      number: '03',
      title: 'Receive Hospital-Grade Care at Home',
      description: 'On-demand home visits, portable diagnostics, and bedside clinical assistance.',
      icon: Home,
      tag: 'Punctual Dispatch',
      badgeColor: 'text-teal-300 bg-teal-950/60 border-teal-500/30',
      iconBg: 'from-emerald-600 to-teal-700',
    },
    {
      number: '04',
      title: 'Manage Your Reports & Healthcare Information',
      description: 'Instant digital reports, doctor e-prescriptions, and lifetime encrypted records vault.',
      icon: FileCheck2,
      tag: 'Secure Health Vault',
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
      iconBg: 'from-cyan-600 to-blue-700',
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-[#f0f4f8] border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/90 text-[#008080] text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
            <span>SIMPLE &amp; EFFICIENT STREAMLINED CARE FLOW</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002b49] tracking-tight">
            How Nhealth Works in 4 Easy Steps
          </h2>

          {/* Subheading */}
          <p className="mt-2.5 text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Experience frictionless booking, hospital-grade healthcare right from your home, punctual arrival of verified medical personnel, and seamless care continuity.
          </p>
        </div>

        {/* 4-Step Card Workflow Layout: Strictly 2x2 Grid on Mobile & Tablet, 4-col on Desktop */}
        <div className="relative">
          {/* Subtle Desktop Connecting Arrow Track (hidden on mobile & tablet) */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-teal-200 via-slate-300 to-teal-200 z-0 pointer-events-none" />

          {/* Strict 2x2 Grid across mobile and tablet viewports (grid-cols-2), transitioning to 4 columns on desktop (lg:grid-cols-4) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-5 lg:gap-6 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-3.5 xs:p-4.5 sm:p-6 border border-slate-200/90 hover:border-[#008080] shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  {/* Top Header inside Card: Step Number & Modern Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                      {/* Step Number Tag */}
                      <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black text-[#002b49]/25 group-hover:text-[#008080] font-mono transition-colors">
                        {step.number}
                      </span>

                      {/* Icon with gradient badge */}
                      <div
                        className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.iconBg} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300 shrink-0`}
                      >
                        <IconComponent className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 text-white" />
                      </div>
                    </div>

                    {/* Step Tag */}
                    <div className="mb-1.5 sm:mb-2">
                      <span className={`inline-block px-1.5 xs:px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${step.badgeColor} truncate max-w-full`}>
                        {step.tag}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-xs xs:text-sm sm:text-base font-black text-[#002b49] group-hover:text-[#008080] leading-snug transition-colors mb-1.5 line-clamp-2">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {step.description}
                    </p>
                  </div>

                  {/* Card Bottom Indicator */}
                  <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold text-[#008080]">
                    <span className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Step {index + 1} of 4
                    </span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed 2-Column Expansion: "Manage Your Reports & Healthcare Information" & "Continue Your Care" */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Manage Your Reports & Healthcare Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-teal-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center shrink-0 border border-teal-200">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">Records &amp; Vault</span>
                  <h3 className="text-base sm:text-lg font-black text-[#002b49] leading-tight">
                    Manage Your Reports &amp; Healthcare Information
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Access your verified diagnostic lab results, doctor consultation notes, e-prescriptions, and vital trends from one secure, encrypted portal. No more carrying paper files or misplacing test histories.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Digital Delivery:</strong> Diagnostic reports delivered directly to your WhatsApp &amp; patient dashboard within hours of sample processing.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Historical Health Trend Analysis:</strong> Compare blood glucose, lipid, and ECG readings across previous visits to track improvement.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Bank-Grade Encryption:</strong> Your medical records remain 100% confidential, accessible only by you and authorized clinicians.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-800 font-bold">
              <span>Encrypted PDF &amp; QR Authenticated</span>
              <span className="inline-flex items-center gap-1 text-[#008080]">
                <span>24/7 Vault Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Continue Your Care */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-amber-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Post-Visit Continuity</span>
                  <h3 className="text-base sm:text-lg font-black text-[#002b49] leading-tight">
                    Continue Your Care
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Healthcare doesn't stop after a single consultation. Nhealth provides end-to-end coordinated continuity so recovery is smooth, predictable, and stress-free for your entire family.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Scheduled Specialist Follow-Ups:</strong> Re-consult your attending physician online or request a follow-up home visit with full historical context.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Long-Term Nursing &amp; Rehabilitation:</strong> Seamless scheduling for post-operative wound dressing, physio sessions, and eldercare attendants.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Medicine Refill Dispatch:</strong> Easy 1-tap reordering of prescribed chronic medications delivered right to your doorstep.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-900 font-bold">
              <span>Coordinated Patient Care Protocol</span>
              <span className="inline-flex items-center gap-1 text-amber-700">
                <span>Lifelong Wellness Partner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Corporate Trust Strip below workflow */}
        <div className="mt-8 sm:mt-12 max-w-4xl mx-auto rounded-2xl bg-[#00172b] text-white p-4 sm:p-5 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold shadow-md border border-teal-500/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Zero Advance Fees for Consultation Match</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Punctual Clinician Arrival Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
            <span>NABL Certified Diagnostic Accuracy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
