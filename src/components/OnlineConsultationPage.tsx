import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Stethoscope,
  Video,
  Star,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  Filter,
  ArrowRight,
  Activity,
  Heart,
  Baby,
  Bone,
  Eye,
  Brain,
  Pill,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { EMPANELED_DOCTORS } from '../data/doctorsData';
import { EmpaneledDoctor } from '../types/doctorFinder';
import { ServiceItem, BookingFormData } from '../types/serviceBooking';
import { EXTRACTED_SERVICES } from '../data/servicesData';
import { DoctorProfileModal } from './DoctorProfileModal';
import { DoctorCheckoutModal } from './DoctorCheckoutModal';
import { ConsultationSession } from '../types/consultationBooking';
import {
  isDoctorAvailable,
  DOCTOR_AVAILABILITY_EVENT,
} from '../utils/doctorAvailabilityStore';
import {
  AdBannerItem,
  getActiveBanners,
  DEFAULT_BANNERS,
} from '../utils/advertisingStorage';

interface OnlineConsultationPageProps {
  onBackToHome: () => void;
  onBookDoctor: (doctor: EmpaneledDoctor, mode: 'Video Call' | 'In-Clinic' | 'Home Visit') => void;
  onSelectService: (service: ServiceItem, prefillData?: Partial<BookingFormData>) => void;
}

export interface SpecialtyItem {
  id: string;
  name: string;
  specializationKey: string;
  iconName: string;
  tagline: string;
  commonSymptoms: string[];
  startingFee: number;
  availableDoctorsCount: number;
}

const SPECIALTY_CATALOG: SpecialtyItem[] = [
  {
    id: 'gen-physician',
    name: 'General Physician & Internal Medicine',
    specializationKey: 'General Medicine',
    iconName: 'Stethoscope',
    tagline: 'Fever, Infections, Weakness & Everyday Health',
    commonSymptoms: ['High Fever', 'Viral Flu', 'Cough & Cold', 'Body Ache', 'Fatigue'],
    startingFee: 500,
    availableDoctorsCount: 18,
  },
  {
    id: 'dermatology',
    name: 'Dermatology & Skin Care',
    specializationKey: 'Dermatology',
    iconName: 'Sparkles',
    tagline: 'Rashes, Acne, Fungal Infections & Hair Fall',
    commonSymptoms: ['Acne & Pits', 'Skin Rash', 'Fungal Infection', 'Severe Hair Loss', 'Eczema'],
    startingFee: 650,
    availableDoctorsCount: 12,
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Child Health',
    specializationKey: 'Pediatrics',
    iconName: 'Baby',
    tagline: 'Newborn Care, Child Fevers & Immunization',
    commonSymptoms: ['Infant Fever', 'Child Cough', 'Teething Distress', 'Loss of Appetite', 'Growth Check'],
    startingFee: 600,
    availableDoctorsCount: 14,
  },
  {
    id: 'cardiology',
    name: 'Cardiology & Heart Health',
    specializationKey: 'Cardiology',
    iconName: 'Heart',
    tagline: 'Chest Pain, BP Management & Palpitations',
    commonSymptoms: ['Chest Discomfort', 'High Blood Pressure', 'Palpitations', 'Breathlessness on Exertion'],
    startingFee: 700,
    availableDoctorsCount: 10,
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Joint Care',
    specializationKey: 'Orthopedics',
    iconName: 'Bone',
    tagline: 'Back Pain, Knee Arthritis & Muscle Strains',
    commonSymptoms: ['Knee Pain', 'Lower Back Ache', 'Joint Stiffness', 'Neck Pain', 'Frozen Shoulder'],
    startingFee: 700,
    availableDoctorsCount: 15,
  },
  {
    id: 'neurology',
    name: 'Neurology & Brain Health',
    specializationKey: 'Neurology',
    iconName: 'Brain',
    tagline: 'Severe Migraines, Vertigo & Nerve Issues',
    commonSymptoms: ['Migraine', 'Vertigo / Dizziness', 'Numbness / Tingling', 'Tension Headache'],
    startingFee: 800,
    availableDoctorsCount: 8,
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology & Respiratory Care',
    specializationKey: 'Pulmonology',
    iconName: 'Activity',
    tagline: 'Chronic Cough, Asthma & Breathlessness',
    commonSymptoms: ['Wheezing', 'Dry / Wet Cough', 'Asthma Flareup', 'Chest Congestion'],
    startingFee: 750,
    availableDoctorsCount: 9,
  },
  {
    id: 'gynecology',
    name: 'Gynecology & Women’s Health',
    specializationKey: 'Gynecology',
    iconName: 'Activity',
    tagline: 'PCOS, Menstrual Disorders & Pregnancy Follow-up',
    commonSymptoms: ['Irregular Periods', 'PCOS / PCOD', 'Pelvic Pain', 'First Trimester Advice'],
    startingFee: 700,
    availableDoctorsCount: 16,
  },
];

export const OnlineConsultationPage: React.FC<OnlineConsultationPageProps> = ({
  onBackToHome,
  onBookDoctor,
  onSelectService,
}) => {
  // Primary Navigation / Search Mode: "Doctor" OR "Health Problem / Specialty"
  const [searchMode, setSearchMode] = useState<'doctor' | 'specialty'>('doctor');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All');
  const [activeSpecialtyCard, setActiveSpecialtyCard] = useState<SpecialtyItem | null>(null);

  // Top Advertising Banner Carousel State
  const [banners, setBanners] = useState<AdBannerItem[]>(() => {
    const loaded = getActiveBanners('consultation');
    return loaded.length > 0 ? loaded : DEFAULT_BANNERS.filter((b) => b.section === 'consultation');
  });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Banners on storage updates
  useEffect(() => {
    const handleBannerUpdate = () => {
      const updated = getActiveBanners('consultation');
      if (updated.length > 0) {
        setBanners(updated);
        setCurrentBannerIndex(0);
      }
    };
    window.addEventListener('nhealth_banners_updated', handleBannerUpdate);
    window.addEventListener('nhealth_banner_updated', handleBannerUpdate);
    return () => {
      window.removeEventListener('nhealth_banners_updated', handleBannerUpdate);
      window.removeEventListener('nhealth_banner_updated', handleBannerUpdate);
    };
  }, []);

  // Carousel auto-sliding effect
  useEffect(() => {
    if (banners.length <= 1 || isCarouselPaused) return;
    const currentBanner = banners[currentBannerIndex];
    const duration = (currentBanner?.autoPlayInterval || 4.5) * 1000;

    autoPlayTimerRef.current = setTimeout(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, duration);

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [banners, currentBannerIndex, isCarouselPaused]);

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  // AI Symptom-to-Doctor Auto-Suggestion State
  const [symptomQuery, setSymptomQuery] = useState('');
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<EmpaneledDoctor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking Checkout, Coupon & Waiting Room Modal State
  const [checkoutDoctor, setCheckoutDoctor] = useState<EmpaneledDoctor | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'Immediate Connect' | 'Scheduled Slot'>('Immediate Connect');
  const [checkoutDate, setCheckoutDate] = useState<string>('Today, 25 Oct');
  const [checkoutSlot, setCheckoutSlot] = useState<string>('11:00 AM');

  // Deep Link Auto-Detection from WhatsApp or Mobile App redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session') || params.get('consultationId');
    if (sessionParam && !checkoutDoctor) {
      const targetDoc = EMPANELED_DOCTORS[0];
      setCheckoutDoctor(targetDoc);
      setCheckoutMode('Immediate Connect');
      showToast(`Deep Link Detected: Loading consultation session #${sessionParam}...`);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // AI Symptom Detection Parser
  const detectSpecialtyFromSymptom = (text: string): { specialty: string; condition: string } | null => {
    const q = text.toLowerCase().trim();
    if (!q) return null;
    if (q.includes('chest') || q.includes('heart') || q.includes('bp') || q.includes('palpitat') || q.includes('angina')) {
      return { specialty: 'Cardiology', condition: 'Cardiovascular / Heart Condition' };
    }
    if (q.includes('knee') || q.includes('joint') || q.includes('bone') || q.includes('back') || q.includes('spine') || q.includes('sprain') || q.includes('fracture') || q.includes('arthritis')) {
      return { specialty: 'Orthopedics', condition: 'Musculoskeletal & Joint Dysfunction' };
    }
    if (q.includes('fever') || q.includes('cold') || q.includes('flu') || q.includes('chills') || q.includes('dengue') || q.includes('viral') || q.includes('weakness') || q.includes('fatigue')) {
      return { specialty: 'General Medicine', condition: 'Acute Febrile Syndrome & Infection' };
    }
    if (q.includes('skin') || q.includes('rash') || q.includes('acne') || q.includes('itch') || q.includes('eczema') || q.includes('hair') || q.includes('pimple') || q.includes('fungal')) {
      return { specialty: 'Dermatology', condition: 'Dermatological Condition & Skin Flare' };
    }
    if (q.includes('cough') || q.includes('breath') || q.includes('asthma') || q.includes('wheez') || q.includes('lung') || q.includes('phlegm')) {
      return { specialty: 'Pulmonology', condition: 'Respiratory Distress & Bronchial Care' };
    }
    if (q.includes('child') || q.includes('baby') || q.includes('infant') || q.includes('pediatric')) {
      return { specialty: 'Pediatrics', condition: 'Pediatric Care & Infant Health' };
    }
    if (q.includes('headache') || q.includes('migraine') || q.includes('dizzy') || q.includes('vertigo') || q.includes('neuro') || q.includes('numb')) {
      return { specialty: 'Neurology', condition: 'Neurological & Cephalic Evaluation' };
    }
    if (q.includes('stomach') || q.includes('acid') || q.includes('gerd') || q.includes('constipat') || q.includes('digest') || q.includes('gut')) {
      return { specialty: 'Gastroenterology', condition: 'Digestive & Gastrointestinal Health' };
    }
    if (q.includes('sugar') || q.includes('diabet') || q.includes('thyroid') || q.includes('hormone')) {
      return { specialty: 'Endocrinology', condition: 'Metabolic & Endocrine Review' };
    }
    return null;
  };

  const detectedSymptomInfo = symptomQuery ? detectSpecialtyFromSymptom(symptomQuery) : null;

  // Filter Doctors list
  const filteredDoctors = EMPANELED_DOCTORS.filter((doc) => {
    // Must support Video Call or telemedicine
    const supportsVideo = doc.modes.includes('Video Call');
    if (!supportsVideo) return false;

    // AI Symptom Filter override if active
    if (detectedSymptomInfo && doc.specialization !== detectedSymptomInfo.specialty) {
      return false;
    }

    // Specialty Card drilldown
    if (activeSpecialtyCard && doc.specialization !== activeSpecialtyCard.specializationKey) {
      return false;
    }

    // Specialty dropdown filter
    if (selectedSpecialtyFilter !== 'All' && doc.specialization !== selectedSpecialtyFilter) {
      return false;
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSpec = doc.specialization.toLowerCase().includes(q);
      const matchSub = doc.subSpecialty ? doc.subSpecialty.toLowerCase().includes(q) : false;
      const matchHosp = doc.hospitalAffiliation ? doc.hospitalAffiliation.toLowerCase().includes(q) : false;
      const matchLang = doc.languages ? doc.languages.some((l) => l.toLowerCase().includes(q)) : false;
      const matchBio = doc.bio ? doc.bio.toLowerCase().includes(q) : false;
      return matchName || matchSpec || matchSub || matchHosp || matchLang || matchBio;
    }

    return true;
  });

  // Separate Doctors into 2 Tiers: Nhealth Badged FIRST, followed by regular doctors
  const badgedDoctors = filteredDoctors.filter(
    (doc) => doc.isNhealthBadged !== false && doc.isNhealthVerified
  );
  const regularDoctors = filteredDoctors.filter(
    (doc) => !(doc.isNhealthBadged !== false && doc.isNhealthVerified)
  );

  // Filter Specialties list
  const filteredSpecialties = SPECIALTY_CATALOG.filter((spec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = spec.name.toLowerCase().includes(q);
    const matchTag = spec.tagline.toLowerCase().includes(q);
    const matchSymptoms = spec.commonSymptoms.some((s) => s.toLowerCase().includes(q));
    return matchName || matchTag || matchSymptoms;
  });

  const handleBannerAction = (banner: AdBannerItem) => {
    if (banner.ctaLink === 'specialties') {
      setSearchMode('specialty');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } else {
      setSearchMode('doctor');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleOpenDoctorProfile = (doc: EmpaneledDoctor) => {
    setSelectedDoctorForProfile(doc);
  };

  const handleBookImmediate = (doc: EmpaneledDoctor) => {
    setSelectedDoctorForProfile(null);
    setCheckoutDoctor(doc);
    setCheckoutMode('Immediate Connect');
    showToast(`Opening Booking Checkout for Immediate Connect with ${doc.name}...`);
  };

  const handleScheduleSlot = (doc: EmpaneledDoctor, date: string, timeSlot: string) => {
    setSelectedDoctorForProfile(null);
    setCheckoutDoctor(doc);
    setCheckoutMode('Scheduled Slot');
    setCheckoutDate(date);
    setCheckoutSlot(timeSlot);
    showToast(`Opening Booking Checkout for ${doc.name} (${date} @ ${timeSlot})...`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-[10000] bg-[#002b49] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-400/50 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* ============================================================== */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#008080] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-black text-[#002b49] leading-tight flex items-center gap-2">
                <span>Online Doctor Consultation</span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>100+ Specialists Live</span>
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Instant Video Connect · Digital Rx in Minutes · 100% Empaneled MD Doctors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Queue: &lt;15 Mins</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        {/* ============================================================== */}
        {/* 2. TOP ADVERTISING BANNER CAROUSEL (STRICT 4:1.5 ASPECT RATIO) */}
        {/* ============================================================== */}
        {banners.length > 0 && (
          <section className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-teal-500/30 bg-slate-900 group">
            {/* Strict 4:1.5 Aspect Ratio Container */}
            <div
              className="consultation-banner-frame relative overflow-hidden select-none"
              style={{ aspectRatio: '4 / 1.5', width: '100%', objectFit: 'cover' }}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {banners.map((banner, index) => {
                const isActive = index === currentBannerIndex;
                return (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
                    }`}
                  >
                    {/* Background Banner Graphic */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover object-center"
                      style={{
                        transform: `scale(${(banner.scale || 100) / 100})`,
                        objectFit: banner.imageFit || 'cover',
                      }}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />

                    {/* Gradient Overlay for Crisp Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex flex-col justify-between p-3.5 sm:p-6 md:p-8 lg:p-10 text-white">
                      {/* Top Tag & Indicators */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider bg-teal-500/30 text-teal-300 border border-teal-400/50 backdrop-blur-md">
                          <Sparkles className="w-3 h-3 text-teal-300" />
                          <span>{banner.tag || 'NHEALTH ONLINE CARE'}</span>
                        </span>

                        <span className="text-[10px] sm:text-xs font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {index + 1} / {banners.length}
                        </span>
                      </div>

                      {/* Headline, Subtitle & CTA */}
                      <div className="max-w-xl space-y-1 sm:space-y-2">
                        <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md line-clamp-2">
                          {banner.title}
                        </h2>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-xs max-w-lg">
                          {banner.subtitle}
                        </p>

                        <div className="pt-1 sm:pt-2">
                          <button
                            type="button"
                            onClick={() => handleBannerAction(banner)}
                            className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-900/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <span>{banner.ctaText || 'Consult Specialist'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevBanner}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextBanner}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentBannerIndex(i)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                          i === currentBannerIndex ? 'w-6 sm:w-8 bg-amber-400' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 3. ENTRY SEARCH & SELECTION MODE OPTIONS */}
        {/*    Select by "Doctor" OR Select by "Health Problem / Specialty" */}
        {/* ============================================================== */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md p-4 sm:p-6 lg:p-8 space-y-5">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-50 text-[#008080] border border-teal-200">
              Personalized Clinical Triage
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#002b49] tracking-tight">
              How would you like to start your consultation?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose your preferred booking path below to connect with top verified doctors instantly.
            </p>
          </div>

          {/* TWO PRIMARY SELECTION TABS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {/* TAB 1: SELECT BY DOCTOR */}
            <button
              type="button"
              onClick={() => {
                setSearchMode('doctor');
                setActiveSpecialtyCard(null);
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-start gap-3.5 relative overflow-hidden ${
                searchMode === 'doctor'
                  ? 'border-[#008080] bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  searchMode === 'doctor'
                    ? 'bg-[#008080] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-[#002b49]">
                    Select by Doctor
                  </h3>
                  {searchMode === 'doctor' && (
                    <span className="w-2 h-2 rounded-full bg-[#008080]" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Browse verified MD specialists, ratings, experience &amp; hospital affiliations.
                </p>
              </div>
            </button>

            {/* TAB 2: SELECT BY HEALTH PROBLEM / SPECIALTY */}
            <button
              type="button"
              onClick={() => {
                setSearchMode('specialty');
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-start gap-3.5 relative overflow-hidden ${
                searchMode === 'specialty'
                  ? 'border-[#008080] bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  searchMode === 'specialty'
                    ? 'bg-[#008080] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-[#002b49]">
                    Select by Health Problem / Specialty
                  </h3>
                  {searchMode === 'specialty' && (
                    <span className="w-2 h-2 rounded-full bg-[#008080]" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Choose your symptoms, pain area, or clinical specialty for guided matching.
                </p>
              </div>
            </button>
          </div>

          {/* 3. AI SYMPTOM-TO-DOCTOR AUTO-SUGGESTION INPUT */}
          <div className="max-w-3xl mx-auto pt-1 space-y-2.5">
            <div className="bg-gradient-to-r from-teal-900 via-[#002b49] to-teal-950 p-4 sm:p-5 rounded-3xl text-white shadow-lg border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span>Auto-Suggest Doctor by Symptoms / Problem</span>
                      <span className="text-[9.5px] uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                        AI Clinical Match
                      </span>
                    </h3>
                    <p className="text-[11px] text-teal-200/80">
                      Enter your clinical symptoms or health issue for automated doctor matching, prioritizing Nhealth Badged specialists.
                    </p>
                  </div>
                </div>
              </div>

              {/* Symptom Input Bar */}
              <div className="flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-teal-400/40 rounded-2xl px-3.5 py-2.5 transition-all">
                <Search className="w-4 h-4 text-teal-300 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={symptomQuery}
                  onChange={(e) => {
                    setSymptomQuery(e.target.value);
                    if (e.target.value.trim() && searchMode !== 'doctor') {
                      setSearchMode('doctor');
                    }
                  }}
                  placeholder="Auto-Suggest Doctor by Symptoms: e.g. severe chest discomfort, knee arthritis, high fever, skin rash..."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-teal-200/60 focus:outline-none font-medium"
                />
                {symptomQuery && (
                  <button
                    type="button"
                    onClick={() => setSymptomQuery('')}
                    className="p-1 text-teal-300 hover:text-white rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Symptom Chips */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-300/80 block">
                  Popular Symptom Quick Auto-Suggest:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Chest Discomfort / BP', symptom: 'chest tightness and high blood pressure' },
                    { label: 'Knee & Joint Arthritis', symptom: 'knee pain joint stiffness' },
                    { label: 'High Fever & Chills', symptom: 'high fever chills shivering' },
                    { label: 'Skin Rash & Itching', symptom: 'skin rash itching allergy' },
                    { label: 'Cough & Wheezing', symptom: 'persistent cough breathlessness wheezing' },
                    { label: 'Migraine & Vertigo', symptom: 'severe migraine headache dizziness' },
                    { label: 'Child Infant Fever', symptom: 'child infant high fever vomiting' },
                    { label: 'Stomach Ache / Acidity', symptom: 'stomach pain acid reflux gerd' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSymptomQuery(chip.symptom);
                        setSearchMode('doctor');
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                        symptomQuery === chip.symptom
                          ? 'bg-teal-400 text-[#002b49] border-teal-300 shadow-xs'
                          : 'bg-white/10 text-teal-100 hover:bg-white/20 border-white/10'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched AI Triage Feedback */}
              {detectedSymptomInfo && (
                <div className="p-3 rounded-xl bg-teal-400/15 border border-teal-300/40 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>
                      AI Matched Department: <strong className="text-white">{detectedSymptomInfo.specialty}</strong> ({detectedSymptomInfo.condition})
                    </span>
                  </div>
                  <span className="text-[10px] bg-teal-300 text-teal-950 font-black px-2 py-0.5 rounded-full shrink-0">
                    Nhealth Badged Doctors Prioritized
                  </span>
                </div>
              )}
            </div>

            {/* Standard keyword filter input */}
            <div className="flex items-center bg-slate-50 border border-slate-300 focus-within:border-[#008080] focus-within:ring-2 focus-within:ring-teal-500/20 rounded-2xl px-3.5 py-2 transition-all shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by doctor name, degrees (MD/DM), hospital (Apollo/Care), or spoken language..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. CONTENT VIEW A: SPECIALTY & HEALTH PROBLEM EXPLORER */}
        {/* ============================================================== */}
        {searchMode === 'specialty' && (
          <section className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#002b49]">
                  Popular Clinical Specialties &amp; Health Conditions
                </h3>
                <p className="text-xs text-slate-500">
                  Select a category to view empaneled doctors specializing in that discipline.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                {filteredSpecialties.length} Specialties
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSpecialties.map((spec) => (
                <div
                  key={spec.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#008080] p-4.5 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group text-left"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 group-hover:bg-[#008080] text-[#008080] group-hover:text-white flex items-center justify-center transition-colors">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        From ₹{spec.startingFee}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-[#002b49] group-hover:text-[#008080] transition-colors">
                        {spec.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        {spec.tagline}
                      </p>
                    </div>

                    {/* Common symptom tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {spec.commonSymptoms.map((symp) => (
                        <span
                          key={symp}
                          className="text-[9.5px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md"
                        >
                          {symp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {spec.availableDoctorsCount} Doctors Available
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSpecialtyCard(spec);
                        setSelectedSpecialtyFilter(spec.specializationKey);
                        setSearchMode('doctor');
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#008080] group-hover:translate-x-0.5 transition-transform cursor-pointer"
                    >
                      <span>View Doctors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 5. CONTENT VIEW B: DIRECT DOCTOR SEARCH & SELECTION LIST */}
        {/* ============================================================== */}
        {searchMode === 'doctor' && (
          <section className="space-y-6 animate-in fade-in duration-200">
            {/* Active Specialty Filter Banner if drilled down from Specialty */}
            {activeSpecialtyCard && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900">
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-5 h-5 text-[#008080]" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#002b49]">
                      Showing Top Specialists for: {activeSpecialtyCard.name}
                    </h4>
                    <p className="text-[11px] text-teal-700">
                      Trained in managing {activeSpecialtyCard.commonSymptoms.slice(0, 3).join(', ')}...
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSpecialtyCard(null);
                    setSelectedSpecialtyFilter('All');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-red-600 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Quick Specialty Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Department:</span>
              </span>
              {['All', 'Cardiology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Neurology', 'Pulmonology', 'Dermatology'].map(
                (spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setSelectedSpecialtyFilter(spec);
                      setActiveSpecialtyCard(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSpecialtyFilter === spec
                        ? 'bg-[#002b49] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {spec}
                  </button>
                )
              )}
            </div>

            {/* DOCTOR LISTING EMPTY STATE */}
            {filteredDoctors.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-black text-slate-700">No empaneled doctors found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your symptoms query or reset the department filter to view all available video doctors.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSymptomQuery('');
                    setSelectedSpecialtyFilter('All');
                    setActiveSpecialtyCard(null);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#008080] text-white text-xs font-bold hover:bg-[#006666] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* ============================================================== */}
                {/* TIER 1: NHEALTH BADGED (VERIFIED) DOCTORS - FIRST PRIORITY */}
                {/* ============================================================== */}
                {badgedDoctors.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-teal-500/10 border-2 border-amber-300/80 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-black">
                          <ShieldCheck className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-[#002b49] flex items-center gap-2">
                            <span>★ Nhealth Badged (Verified) Specialists — Priority Ranking</span>
                            <span className="hidden sm:inline text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                              Priority Display
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Displaying Nhealth verified and badged consultants first based on verified clinical credentials &amp; patient ratings.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shrink-0 self-start sm:self-auto">
                        {badgedDoctors.length} Badged Doctors
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {badgedDoctors.map((doc, idx) => {
                        const isAvail = isDoctorAvailable(doc.id, doc.isAvailableNow ?? true);
                        return (
                          <div
                            key={doc.id}
                            className="bg-gradient-to-br from-amber-50/30 via-white to-teal-50/20 rounded-2xl sm:rounded-3xl border-2 border-amber-300/90 hover:border-amber-400 p-4 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden"
                          >
                            {/* Priority Rank Ribbon */}
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-600 text-slate-950 text-[10px] font-black uppercase tracking-wider py-0.5 px-3 rounded-bl-xl shadow-xs flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-slate-950" />
                              <span>#{idx + 1} Nhealth Badged</span>
                            </div>

                            <div>
                              {/* Doctor Top Row: Image, Badge, Rating */}
                              <div className="flex items-start gap-3.5 mb-3.5 pt-2">
                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-400 shrink-0 shadow-md">
                                  <img
                                    src={doc.profileImage}
                                    alt={doc.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80';
                                    }}
                                  />
                                  <span className="absolute bottom-0 right-0 p-0.5 rounded-tl-lg bg-amber-500 text-slate-950" title="Nhealth Verified Doctor">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </span>
                                </div>

                                <div className="flex-1 min-w-0 pr-12">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9.5px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 truncate">
                                      {doc.specialization}
                                    </span>
                                  </div>

                                  <h3 className="font-black text-[#002b49] text-sm sm:text-base leading-tight mt-1 truncate">
                                    {doc.name}
                                  </h3>
                                  <p className="text-[11px] text-slate-500 truncate font-semibold">
                                    {doc.degrees}
                                  </p>
                                  <p className="text-[10.5px] text-slate-600 truncate mt-0.5 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{doc.hospitalAffiliation}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Experience, Languages & Availability */}
                              <div className="space-y-1.5 py-2.5 border-t border-slate-100 text-xs">
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="text-slate-400">Experience:</span>
                                  <span className="font-bold text-slate-800">{doc.experienceYears}+ Years</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="text-slate-400">Rating:</span>
                                  <div className="flex items-center gap-1 text-amber-700 font-extrabold text-xs">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                    <span>{doc.rating}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">({doc.reviewCount}+ patients)</span>
                                  </div>
                                </div>

                                {/* Dynamic Live Availability Tag */}
                                <div
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                                    isAvail
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {isAvail ? (
                                    <>
                                      <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                      <span className="truncate">Available Now · Immediate Connect</span>
                                    </>
                                  ) : (
                                    <>
                                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">Schedule Time Slot Available</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bottom CTA Row: Fee + Profile View / Book Now */}
                            <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase">Fee</div>
                                <div className="text-base sm:text-lg font-black text-[#002b49]">
                                  ₹{doc.consultationFee}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDoctorProfile(doc)}
                                className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                                  isAvail
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
                                    : 'bg-[#002b49] hover:bg-[#00172b]'
                                }`}
                              >
                                {isAvail ? <Video className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                                <span>{isAvail ? 'Immediate Connect' : 'View Profile & Slot'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TIER 2: OTHER EMPANELED DOCTORS - SUBSEQUENT LIST */}
                {/* ============================================================== */}
                {regularDoctors.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-slate-500" />
                          <span>Other Empaneled Doctors</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Licensed practitioners available on the general Nhealth medical network.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        {regularDoctors.length} Empaneled Doctors
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {regularDoctors.map((doc) => {
                        const isAvail = isDoctorAvailable(doc.id, doc.isAvailableNow ?? true);
                        return (
                          <div
                            key={doc.id}
                            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-slate-400 p-4 sm:p-5 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group text-left"
                          >
                            <div>
                              {/* Doctor Top Row: Image, Specialization, Rating */}
                              <div className="flex items-start gap-3.5 mb-3.5">
                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <img
                                    src={doc.profileImage}
                                    alt={doc.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80';
                                    }}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 truncate">
                                      {doc.specialization}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                      <span>{doc.rating}</span>
                                    </div>
                                  </div>

                                  <h3 className="font-black text-[#002b49] text-sm sm:text-base leading-tight mt-1 truncate">
                                    {doc.name}
                                  </h3>
                                  <p className="text-[11px] text-slate-500 truncate font-medium">
                                    {doc.degrees}
                                  </p>
                                  <p className="text-[10.5px] text-slate-600 truncate mt-0.5 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{doc.hospitalAffiliation}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Experience, Languages & Availability */}
                              <div className="space-y-1.5 py-2.5 border-t border-slate-100 text-xs">
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="text-slate-400">Experience:</span>
                                  <span className="font-bold text-slate-800">{doc.experienceYears}+ Years</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="text-slate-400">Languages:</span>
                                  <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                    {doc.languages.join(', ')}
                                  </span>
                                </div>

                                {/* Dynamic Live Availability Tag */}
                                <div
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                                    isAvail
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {isAvail ? (
                                    <>
                                      <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                      <span className="truncate">Available Now · Instant Video</span>
                                    </>
                                  ) : (
                                    <>
                                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">Advance Slot Booking</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bottom CTA Row: Fee + Video Booking Button */}
                            <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase">Fee</div>
                                <div className="text-base sm:text-lg font-black text-[#002b49]">
                                  ₹{doc.consultationFee}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDoctorProfile(doc)}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                              >
                                <User className="w-3.5 h-3.5" />
                                <span>View Profile &amp; Book</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ============================================================== */}
      {/* 6. DOCTOR PROFILE & REAL-TIME AVAILABILITY MODAL */}
      {/* ============================================================== */}
      {selectedDoctorForProfile && (
        <DoctorProfileModal
          doctor={selectedDoctorForProfile}
          onClose={() => setSelectedDoctorForProfile(null)}
          onBookImmediate={handleBookImmediate}
          onScheduleSlot={handleScheduleSlot}
        />
      )}

      {/* ============================================================== */}
      {/* 7. BOOKING CHECKOUT, COUPON & PATIENT WAITING ROOM MODAL */}
      {/* ============================================================== */}
      {checkoutDoctor && (
        <DoctorCheckoutModal
          doctor={checkoutDoctor}
          isOpen={!!checkoutDoctor}
          onClose={() => setCheckoutDoctor(null)}
          initialMode={checkoutMode}
          initialDate={checkoutDate}
          initialSlot={checkoutSlot}
          initialSymptoms={symptomQuery ? `Symptoms: ${symptomQuery}` : ''}
          onConsultationConfirmed={(session) => {
            showToast(`Consultation Confirmed (Ref #${session.referenceId}). Waiting room active.`);
          }}
        />
      )}
    </div>
  );
};
