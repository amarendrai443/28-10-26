import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Stethoscope,
  Building2,
  TestTube2,
  Pill,
  UserCheck,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  Crosshair,
  Filter,
  CheckCircle2,
  Activity,
  Phone,
} from 'lucide-react';
import { EMPANELED_DOCTORS } from '../data/doctorsData';
import { EXTRACTED_SERVICES } from '../data/servicesData';
import { EmpaneledDoctor } from '../types/doctorFinder';
import { ServiceItem, BookingFormData } from '../types/serviceBooking';

export interface HealthcareProfessional {
  id: string;
  name: string;
  role: string;
  qualifications: string;
  experienceYears: number;
  city: string;
  locality: string;
  pincode: string;
  rating: number;
  reviewCount: number;
  availability: string;
  serviceId: string;
  serviceName: string;
  badge: string;
}

export interface PartnerLab {
  id: string;
  name: string;
  category: 'Diagnostic Lab' | 'Pathology' | 'Imaging & Scans';
  accreditation: string;
  city: string;
  localities: string[];
  turnaroundTime: string;
  homeCollection: boolean;
  rating: number;
  popularTests: string[];
}

export interface PartnerPharmacy {
  id: string;
  name: string;
  type: 'Retail & Express Delivery' | 'Hospital Pharmacy' | 'Online 24/7 Delivery';
  city: string;
  coverage: string;
  deliverySpeed: string;
  discount: string;
  rating: number;
}

// Healthcare Professionals Mock Data
export const HEALTHCARE_PROFESSIONALS: HealthcareProfessional[] = [
  {
    id: 'HP-01',
    name: 'Sister Mary Varghese',
    role: 'Senior Critical Care & ICU Nurse',
    qualifications: 'B.Sc Nursing, Critical Care Certified (12+ Yrs)',
    experienceYears: 12,
    city: 'Hyderabad',
    locality: 'Banjara Hills & Jubilee Hills',
    pincode: '500034',
    rating: 4.95,
    reviewCount: 380,
    availability: 'On-Demand Doorstep · Dispatched in 30 mins',
    serviceId: 'nursing-care',
    serviceName: 'Nursing Care at Home',
    badge: '100% Certified ICU Nurse',
  },
  {
    id: 'HP-02',
    name: 'Dr. Praveen Kumar, PT',
    role: 'Consultant Neuro & Ortho Physiotherapist',
    qualifications: 'MPT (Orthopedics), MIAP (14+ Yrs)',
    experienceYears: 14,
    city: 'Hyderabad',
    locality: 'Gachibowli & Madhapur',
    pincode: '500081',
    rating: 4.92,
    reviewCount: 510,
    availability: 'Available Today · Home Rehabilitation',
    serviceId: 'physiotherapy-at-home',
    serviceName: 'Physiotherapy at Home',
    badge: 'Senior Rehabilitation Specialist',
  },
  {
    id: 'HP-03',
    name: 'Ramesh Reddy',
    role: 'Certified Senior Phlebotomist',
    qualifications: 'DMLT, NABL Certified Phlebotomy (9+ Yrs)',
    experienceYears: 9,
    city: 'Hyderabad',
    locality: 'Kukatpally & Miyapur',
    pincode: '500072',
    rating: 4.98,
    reviewCount: 1240,
    availability: 'Painless Vacuum Draw · Within 45 Mins',
    serviceId: 'blood-sample-collection',
    serviceName: 'Blood Sample Collection',
    badge: 'Painless Barcode Sampling',
  },
  {
    id: 'HP-04',
    name: 'Sister Anitha Sharma',
    role: 'Geriatric & Palliative Care Nurse',
    qualifications: 'GNM, Palliative Nursing Certification (10+ Yrs)',
    experienceYears: 10,
    city: 'Hyderabad',
    locality: 'Secunderabad & Begumpet',
    pincode: '500003',
    rating: 4.91,
    reviewCount: 290,
    availability: '12h / 24h Attendant Shifts Available',
    serviceId: 'elderly-care',
    serviceName: 'Elderly Care Assistance',
    badge: 'Compassionate Senior Care',
  },
  {
    id: 'HP-05',
    name: 'Suresh Babu',
    role: 'Certified Bedside ECG & Cardiac Tech',
    qualifications: 'B.Sc Cardiac Technology (8+ Yrs)',
    experienceYears: 8,
    city: 'Bengaluru',
    locality: 'Koramangala & Indiranagar',
    pincode: '560034',
    rating: 4.94,
    reviewCount: 420,
    availability: '12-Lead Portable ECG · 15 Min Reporting',
    serviceId: 'ecg-at-home',
    serviceName: 'ECG at Home',
    badge: 'Cardiologist Verified Reports',
  },
];

// Partner Diagnostic Labs
export const PARTNER_LABS: PartnerLab[] = [
  {
    id: 'LAB-01',
    name: 'Apollo Diagnostics & Nhealth Lab Hub',
    category: 'Diagnostic Lab',
    accreditation: 'NABL & CAP Accredited',
    city: 'Hyderabad',
    localities: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Kukatpally', 'Secunderabad'],
    turnaroundTime: '6 Hours Digital Delivery',
    homeCollection: true,
    rating: 4.93,
    popularTests: ['Complete Blood Count (CBC)', 'Lipid Profile', 'HbA1c', 'Thyroid Profile (T3, T4, TSH)'],
  },
  {
    id: 'LAB-02',
    name: 'Thyrocare Technologies',
    category: 'Pathology',
    accreditation: 'NABL, ICMR & ISO Certified',
    city: 'Hyderabad',
    localities: ['All Pincodes Coverage across Hyderabad & Secunderabad'],
    turnaroundTime: 'Same-day Reporting',
    homeCollection: true,
    rating: 4.88,
    popularTests: ['Aarogyam Full Body Checkup', 'Vitamin D3 & B12', 'Liver Function Test (LFT)'],
  },
  {
    id: 'LAB-03',
    name: 'Dr. Lal PathLabs & Imaging',
    category: 'Diagnostic Lab',
    accreditation: 'NABL & CAP Certified',
    city: 'Delhi NCR',
    localities: ['Connaught Place', 'South Extension', 'Gurugram', 'Noida'],
    turnaroundTime: '4 - 8 Hours Online Vault',
    homeCollection: true,
    rating: 4.9,
    popularTests: ['Kidney Function (KFT)', 'Double Marker', 'Cardiac Risk Profile'],
  },
  {
    id: 'LAB-04',
    name: 'Vijaya Diagnostic Center',
    category: 'Imaging & Scans',
    accreditation: 'NABL & AERB Certified',
    city: 'Hyderabad',
    localities: ['Himayatnagar', 'Dilsukhnagar', 'Kondapur', 'Ameerpet'],
    turnaroundTime: 'Immediate Digital Films + Radiologist Read',
    homeCollection: true,
    rating: 4.89,
    popularTests: ['Portable Bedside X-Ray', 'Home Ultrasound', 'Holter 24h Monitoring'],
  },
  {
    id: 'LAB-05',
    name: 'Suburban Diagnostics',
    category: 'Diagnostic Lab',
    accreditation: 'NABL Accredited',
    city: 'Mumbai',
    localities: ['Andheri West', 'Bandra', 'Powai', 'Dadar'],
    turnaroundTime: 'Within 6 Hours',
    homeCollection: true,
    rating: 4.91,
    popularTests: ['Diabetes Master Panel', 'Tumor Markers', 'Allergy 50 Panel'],
  },
];

// Partner Pharmacies
export const PARTNER_PHARMACIES: PartnerPharmacy[] = [
  {
    id: 'PHARM-01',
    name: 'Apollo Pharmacy Express',
    type: 'Retail & Express Delivery',
    city: 'Hyderabad',
    coverage: 'Citywide Doorstep Delivery across 50+ Hubs',
    deliverySpeed: '<60 Mins Rapid Dispatch',
    discount: 'Up to 20% Off on Prescriptions',
    rating: 4.9,
  },
  {
    id: 'PHARM-02',
    name: 'MedPlus Health Services',
    type: 'Retail & Express Delivery',
    city: 'Hyderabad',
    coverage: 'Extensive Greater Hyderabad Network',
    deliverySpeed: '<90 Mins Doorstep Delivery',
    discount: 'Genuine Cold-Chain Guaranteed',
    rating: 4.87,
  },
  {
    id: 'PHARM-03',
    name: 'Tata 1mg Doorstep Delivery',
    type: 'Online 24/7 Delivery',
    city: 'All Major Metros',
    coverage: 'Pan-Bharat Express Delivery',
    deliverySpeed: 'Same-Day Delivery in Metros',
    discount: 'Flat 18% Off with Verified Rx',
    rating: 4.92,
  },
  {
    id: 'PHARM-04',
    name: 'Netmeds Healthcare Network',
    type: 'Online 24/7 Delivery',
    city: 'All Major Metros',
    coverage: '19,000+ Pincodes across Bharat',
    deliverySpeed: '24-48 Hours Express Delivery',
    discount: 'Assured Authentic Medicines',
    rating: 4.85,
  },
];

interface UniversalSearchFilterProps {
  onSelectService: (service: ServiceItem, prefillData?: Partial<BookingFormData>) => void;
  onBookDoctorVisit: (doctor: EmpaneledDoctor, symptomsText: string) => void;
}

export const UniversalSearchFilter: React.FC<UniversalSearchFilterProps> = ({
  onSelectService,
  onBookDoctorVisit,
}) => {
  const [nameKeyword, setNameKeyword] = useState('');
  const [locationKeyword, setLocationKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'doctors' | 'professionals' | 'labs' | 'pharmacies' | 'services'>('all');
  const [isLocating, setIsLocating] = useState(false);

  // Auto detect location helper
  const handleAutoDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationKeyword('Hyderabad, Telangana');
          setIsLocating(false);
        },
        () => {
          setLocationKeyword('Hyderabad');
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      setLocationKeyword('Hyderabad');
      setIsLocating(false);
    }
  };

  // Instant filtering logic
  const filteredData = useMemo(() => {
    const qName = nameKeyword.toLowerCase().trim();
    const qLoc = locationKeyword.toLowerCase().trim();

    // 1. Doctors
    const matchedDoctors = EMPANELED_DOCTORS.filter((doc) => {
      const matchName =
        !qName ||
        doc.name.toLowerCase().includes(qName) ||
        doc.specialization.toLowerCase().includes(qName) ||
        (doc.subSpecialty ? doc.subSpecialty.toLowerCase().includes(qName) : false) ||
        doc.title.toLowerCase().includes(qName) ||
        doc.hospitalAffiliation.toLowerCase().includes(qName);

      const matchLoc =
        !qLoc ||
        doc.city.toLowerCase().includes(qLoc) ||
        doc.locality.toLowerCase().includes(qLoc) ||
        doc.pincodes.some((pin) => pin.includes(qLoc));

      return matchName && matchLoc;
    });

    // 2. Healthcare Professionals
    const matchedProfessionals = HEALTHCARE_PROFESSIONALS.filter((hp) => {
      const matchName =
        !qName ||
        hp.name.toLowerCase().includes(qName) ||
        hp.role.toLowerCase().includes(qName) ||
        hp.qualifications.toLowerCase().includes(qName) ||
        hp.serviceName.toLowerCase().includes(qName);

      const matchLoc =
        !qLoc ||
        hp.city.toLowerCase().includes(qLoc) ||
        hp.locality.toLowerCase().includes(qLoc) ||
        hp.pincode.includes(qLoc);

      return matchName && matchLoc;
    });

    // 3. Labs
    const matchedLabs = PARTNER_LABS.filter((lab) => {
      const matchName =
        !qName ||
        lab.name.toLowerCase().includes(qName) ||
        lab.category.toLowerCase().includes(qName) ||
        lab.popularTests.some((t) => t.toLowerCase().includes(qName));

      const matchLoc =
        !qLoc ||
        lab.city.toLowerCase().includes(qLoc) ||
        lab.localities.some((loc) => loc.toLowerCase().includes(qLoc));

      return matchName && matchLoc;
    });

    // 4. Pharmacies
    const matchedPharmacies = PARTNER_PHARMACIES.filter((pharm) => {
      const matchName =
        !qName ||
        pharm.name.toLowerCase().includes(qName) ||
        pharm.type.toLowerCase().includes(qName);

      const matchLoc =
        !qLoc ||
        pharm.city.toLowerCase().includes(qLoc) ||
        pharm.coverage.toLowerCase().includes(qLoc);

      return matchName && matchLoc;
    });

    // 5. Unified 16 Services
    const matchedServices = EXTRACTED_SERVICES.filter((svc) => {
      const matchName =
        !qName ||
        svc.name.toLowerCase().includes(qName) ||
        svc.category.toLowerCase().includes(qName) ||
        svc.tagline.toLowerCase().includes(qName) ||
        svc.description.toLowerCase().includes(qName);

      // Services operate across all cities
      const matchLoc = true;

      return matchName && matchLoc;
    });

    const totalCount =
      matchedDoctors.length +
      matchedProfessionals.length +
      matchedLabs.length +
      matchedPharmacies.length +
      matchedServices.length;

    return {
      doctors: matchedDoctors,
      professionals: matchedProfessionals,
      labs: matchedLabs,
      pharmacies: matchedPharmacies,
      services: matchedServices,
      totalCount,
    };
  }, [nameKeyword, locationKeyword]);

  const hasFilterActive = Boolean(nameKeyword.trim() || locationKeyword.trim());

  return (
    <section id="universal-search" className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 via-teal-50/20 to-white border-y border-slate-200/80 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-12">
        {/* Header Label and Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Universal Healthcare Network Directory</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3.5xl font-black text-[#002b49] tracking-tight leading-snug">
            Search doctor, healthcare professional, lab, pharmacy, or any service with us by name and location
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Real-time verified directory across all 16 unified services, top specialist doctors, ICU-grade nurses, accredited diagnostic hubs, and doorstep pharmacies.
          </p>
        </div>

        {/* Dual Input Search Filter Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-slate-200/90 p-3.5 sm:p-5 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Input 1: Search by Name / Keyword */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-[#008080]" />
                <span>Search by Name, Role, or Keyword</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nameKeyword}
                  onChange={(e) => setNameKeyword(e.target.value)}
                  placeholder="Doctor, Nurse, Physio, Lab, Pharmacy, ECG, Blood test..."
                  className="w-full pl-9 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent text-slate-800 font-medium placeholder-slate-400 bg-slate-50/60 focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {nameKeyword && (
                  <button
                    type="button"
                    onClick={() => setNameKeyword('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                    title="Clear keyword"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Input 2: Search by Location / City / Pincode */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#008080]" />
                <span>Search by Location, City, or Pincode</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={locationKeyword}
                  onChange={(e) => setLocationKeyword(e.target.value)}
                  placeholder="e.g., Hyderabad, Banjara Hills, Gachibowli, 500034..."
                  className="w-full pl-9 pr-24 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent text-slate-800 font-medium placeholder-slate-400 bg-slate-50/60 focus:bg-white transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                
                {/* Auto-detect button inside location input */}
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  disabled={isLocating}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008080] text-[10.5px] font-bold flex items-center gap-1 border border-teal-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="Detect current location"
                >
                  <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isLocating ? 'Detecting...' : 'Auto'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tag Chips */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Popular:
              </span>
              {[
                { label: 'Cardiologist', q: 'Cardiologist' },
                { label: 'Home ECG', q: 'ECG' },
                { label: 'ICU Nurse', q: 'Nurse' },
                { label: 'Physiotherapist', q: 'Physiotherapy' },
                { label: 'Apollo Lab', q: 'Apollo' },
                { label: 'Blood Sample', q: 'Blood' },
                { label: 'MedPlus', q: 'MedPlus' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setNameKeyword(chip.q)}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-[#008080] text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {hasFilterActive && (
              <button
                type="button"
                onClick={() => {
                  setNameKeyword('');
                  setLocationKeyword('');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation for Filtered Categories */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>All Results</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'all' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredData.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'doctors'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#008080]" />
            <span>Doctors ({filteredData.doctors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('professionals')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'professionals'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#008080]" />
            <span>Nurses &amp; Clinicians ({filteredData.professionals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labs')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'labs'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5 text-[#008080]" />
            <span>Diagnostic Labs ({filteredData.labs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pharmacies')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pharmacies'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-[#008080]" />
            <span>Pharmacies ({filteredData.pharmacies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#008080]" />
            <span>Services ({filteredData.services.length})</span>
          </button>
        </div>

        {/* Results Container */}
        {filteredData.totalCount === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Direct Matches Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keyword or location filter to explore doctors, nurses, labs, and services across Bharat.
            </p>
            <button
              type="button"
              onClick={() => {
                setNameKeyword('');
                setLocationKeyword('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#008080] text-white text-xs font-bold hover:bg-[#006666] transition-colors cursor-pointer"
            >
              Show All Network Offerings
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Doctors Section */}
            {(activeTab === 'all' || activeTab === 'doctors') && filteredData.doctors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#008080]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#002b49]">
                      Empaneled Doctors &amp; Specialists ({filteredData.doctors.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Verified Medical Practitioners</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredData.doctors.slice(0, activeTab === 'all' ? 3 : 12).map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-[#008080] p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <img
                            src={doctor.profileImage}
                            alt={doctor.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs sm:text-sm font-bold text-[#002b49] truncate">
                                {doctor.name}
                              </h4>
                              <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                <span>{doctor.rating}</span>
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-[#008080] truncate">
                              {doctor.specialization} · {doctor.degrees}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span>{doctor.locality}, {doctor.city}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-[10.5px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-lg mb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Experience:</span>
                            <span className="font-bold text-slate-700">{doctor.experienceYears}+ Years</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Home Consultation:</span>
                            <span className="font-black text-[#002b49]">₹{doctor.consultationFee}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onBookDoctorVisit(doctor, `Universal search booking for ${doctor.specialization}`)}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#002b49] hover:bg-[#00172b] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                        <span>Book Doctor Visit</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Healthcare Professionals (Nurses & Attendants) */}
            {(activeTab === 'all' || activeTab === 'professionals') && filteredData.professionals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#008080]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#002b49]">
                      Certified Nurses &amp; Clinical Professionals ({filteredData.professionals.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">On-Demand Doorstep Care</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredData.professionals.slice(0, activeTab === 'all' ? 3 : 12).map((hp) => (
                    <div
                      key={hp.id}
                      className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-[#008080] p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            {hp.badge}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{hp.rating} ({hp.reviewCount})</span>
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-[#002b49] leading-snug">
                          {hp.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-[#008080] mt-0.5">
                          {hp.role}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {hp.qualifications}
                        </p>

                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{hp.locality}, {hp.city}</span>
                        </div>

                        <p className="text-[10.5px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{hp.availability}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const targetService = EXTRACTED_SERVICES.find((s) => s.id === hp.serviceId) || EXTRACTED_SERVICES[0];
                          onSelectService(targetService, { symptoms: `Request for certified healthcare professional: ${hp.name} (${hp.role})` });
                        }}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Book Care at Home</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Diagnostic Labs */}
            {(activeTab === 'all' || activeTab === 'labs') && filteredData.labs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TestTube2 className="w-4 h-4 text-[#008080]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#002b49]">
                      Partner Diagnostic Labs &amp; Imaging ({filteredData.labs.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">NABL &amp; CAP Accredited</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredData.labs.slice(0, activeTab === 'all' ? 3 : 12).map((lab) => (
                    <div
                      key={lab.id}
                      className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-[#008080] p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#008080] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            {lab.category}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{lab.rating}</span>
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-[#002b49] leading-snug">
                          {lab.name}
                        </h4>
                        <p className="text-[10.5px] font-semibold text-slate-600 mt-0.5">
                          {lab.accreditation}
                        </p>

                        <div className="mt-2 space-y-1 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Hub Location:</span>
                            <span className="font-bold text-slate-700">{lab.city}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Report Turnaround:</span>
                            <span className="font-bold text-teal-700">{lab.turnaroundTime}</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-[9.5px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                            Available Tests:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {lab.popularTests.slice(0, 3).map((test, i) => (
                              <span
                                key={i}
                                className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                              >
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const bloodService = EXTRACTED_SERVICES.find((s) => s.id === 'blood-sample-collection') || EXTRACTED_SERVICES[0];
                          onSelectService(bloodService, { symptoms: `Diagnostic lab test booking at ${lab.name} (${lab.city})` });
                        }}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <TestTube2 className="w-3.5 h-3.5" />
                        <span>Book Home Sample Draw</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Partner Pharmacies */}
            {(activeTab === 'all' || activeTab === 'pharmacies') && filteredData.pharmacies.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#008080]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#002b49]">
                      Partner Pharmacies &amp; Medicine Delivery ({filteredData.pharmacies.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Genuine Cold-Chain Guaranteed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredData.pharmacies.slice(0, activeTab === 'all' ? 3 : 12).map((pharm) => (
                    <div
                      key={pharm.id}
                      className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-[#008080] p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {pharm.type}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{pharm.rating}</span>
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-[#002b49] leading-snug">
                          {pharm.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-teal-700 mt-0.5">
                          {pharm.coverage}
                        </p>

                        <div className="mt-2 space-y-1 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Delivery Speed:</span>
                            <span className="font-bold text-slate-800">{pharm.deliverySpeed}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Offer / Perk:</span>
                            <span className="font-bold text-emerald-700">{pharm.discount}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const rxService = EXTRACTED_SERVICES.find((s) => s.id === 'pharmacy-delivery') || EXTRACTED_SERVICES[3];
                          onSelectService(rxService, { symptoms: `Prescription medicine doorstep delivery via ${pharm.name}` });
                        }}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#002b49] hover:bg-[#00172b] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Pill className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Order Prescription Medicines</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Unified 16 Services Grid */}
            {(activeTab === 'all' || activeTab === 'services') && filteredData.services.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#008080]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#002b49]">
                      Unified Home Healthcare Services ({filteredData.services.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Hospital-Grade Doorstep Care</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {filteredData.services.slice(0, activeTab === 'all' ? 4 : 16).map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-[#008080] p-2.5 sm:p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-full aspect-[370/236] bg-slate-100 rounded-lg overflow-hidden mb-2">
                          <img
                            src={service.cardImage}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#008080] block truncate">
                          {service.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#002b49] leading-snug truncate mt-0.5">
                          {service.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {service.tagline}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectService(service, { symptoms: `Booking from Universal Directory Search: ${service.name}` })}
                        className="mt-2 w-full py-1.5 px-2 rounded-lg bg-teal-50 hover:bg-[#008080] text-[#008080] hover:text-white text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Book Service</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
