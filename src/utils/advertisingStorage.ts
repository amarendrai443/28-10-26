export type BannerSectionType = 'section1' | 'section2' | 'consultation' | 'waitingRoom';

export interface AdBannerItem {
  id: string;
  section: BannerSectionType; // 'section1' (Top), 'section2' (Bottom), 'consultation', or 'waitingRoom'
  imageUrl: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  ctaLink: string;
  aspectRatio: '4:1' | '4:1.5' | '16:9' | '3:1' | '2:1';
  heightMode: 'compact' | 'medium' | 'tall';
  imageFit: 'cover' | 'contain';
  scale: number; // 80 to 140
  isActive: boolean;
  order: number;
  autoPlayInterval: number; // in seconds (e.g. 4 or 5)
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'nhealth_advertising_banners_v4';
const LEGACY_STORAGE_KEY_V3 = 'nhealth_advertising_banners_v3';
const LEGACY_STORAGE_KEY_V2 = 'nhealth_advertising_banners_v2';
const LEGACY_STORAGE_KEY_V1 = 'nhealth_advertising_banner';

export const DEFAULT_BANNERS: AdBannerItem[] = [
  // SECTION 1 (TOP BANNER CAROUSEL)
  {
    id: 'banner-s1-1',
    section: 'section1',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    title: 'Comprehensive Preventive Health Checkups at Home',
    subtitle: 'Full body 72+ bio-marker testing with doorstep sample pickup and digital reports in 12 hours.',
    tag: 'BANNER SECTION 1',
    ctaText: 'Book Checkup @ 45% OFF',
    ctaLink: 'Home diagnostics & lab tests',
    aspectRatio: '4:1',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 1,
    autoPlayInterval: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-s1-2',
    section: 'section1',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    title: '24/7 Rapid Ambulance & Emergency Life Support',
    subtitle: 'Direct dispatch to your doorstep within 15–30 minutes across Hyderabad & Secunderabad.',
    tag: 'EMERGENCY DISPATCH',
    ctaText: 'Call SOS Ambulance',
    ctaLink: 'Ambulance & medical transport',
    aspectRatio: '4:1',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 2,
    autoPlayInterval: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-s1-3',
    section: 'section1',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    title: 'Vital Lens™ Instant AI Facial Biometrics Scan',
    subtitle: 'Check Heart Rate, HRV, Stress Index & Respiration in 30 seconds with zero medical hardware.',
    tag: 'AI VITAL SCAN',
    ctaText: 'Scan Vitals Free',
    ctaLink: 'vital-lens',
    aspectRatio: '4:1',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 3,
    autoPlayInterval: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // SECTION 2 (BOTTOM BANNER CAROUSEL)
  {
    id: 'banner-s2-1',
    section: 'section2',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    title: 'Certified Nursing Care & Elderly Bedside Assistance',
    subtitle: 'Compassionate medical attendants for medication, post-op vitals & mobility care at your home.',
    tag: 'BANNER SECTION 2',
    ctaText: 'Book Attendant',
    ctaLink: 'Home nursing & patient care',
    aspectRatio: '4:1',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 1,
    autoPlayInterval: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-s2-2',
    section: 'section2',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
    title: 'Doorstep Pharmacy & 60-Minute Genuine Medicine Delivery',
    subtitle: 'Upload prescription or order verified pharmaceuticals with flat 20% discount on first order.',
    tag: 'EXPRESS PHARMACY',
    ctaText: 'Order Medicines',
    ctaLink: 'Pharmacy & doorstep medicines',
    aspectRatio: '4:1',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 2,
    autoPlayInterval: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-s2-3',
    section: 'section2',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80',
    title: 'Expert Specialist Doctor Home Consultations',
    subtitle: 'Top General Physicians, Pediatricians & Cardiologists visit your residence for personalized clinical care.',
    tag: 'DOCTOR CONSULT',
    ctaText: 'Book Doctor Visit',
    ctaLink: 'Doctor Home Consultations',
    aspectRatio: '4:1',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 3,
    autoPlayInterval: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // SECTION 3 (ONLINE CONSULTATION TOP BANNER CAROUSEL - STRICT 4:1.5 ASPECT RATIO)
  {
    id: 'banner-cons-1',
    section: 'consultation',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    title: 'Instant Online Doctor Consultation in 15 Minutes',
    subtitle: 'Connect 1-on-1 with verified MBBS & MD specialists via HD secure video with immediate digital prescriptions.',
    tag: 'INSTANT CONNECT',
    ctaText: 'Consult Specialist Now',
    ctaLink: 'instant-doctor',
    aspectRatio: '4:1.5',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 1,
    autoPlayInterval: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-cons-2',
    section: 'consultation',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80',
    title: 'Top Specialists Across 20+ Clinical Disciplines',
    subtitle: 'From Cardiology & Pediatrics to Dermatology & Psychiatry — expert care coordination at your convenience.',
    tag: 'MULTI-SPECIALTY CARE',
    ctaText: 'Explore Specialties',
    ctaLink: 'specialties',
    aspectRatio: '4:1.5',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 2,
    autoPlayInterval: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-cons-3',
    section: 'consultation',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    title: 'Flat ₹150 OFF On Your First Digital Consultation',
    subtitle: 'Use promo coupon code NHEALTHLIVE during checkout for priority tele-queue and 7-day free followup.',
    tag: 'WELCOME OFFER',
    ctaText: 'Claim ₹150 OFF',
    ctaLink: 'offer-coupon',
    aspectRatio: '4:1.5',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 3,
    autoPlayInterval: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // SECTION 4 (PATIENT WAITING ROOM AD CAROUSEL - 16:9)
  {
    id: 'banner-wr-1',
    section: 'waitingRoom',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    title: 'Doorstep Full Body Health Checkup (72+ Bio-Markers)',
    subtitle: 'Free phlebotomist home visit. 100% NABL accredited lab report in 12 hours.',
    tag: 'SPONSORED HEALTHCARE',
    ctaText: 'Claim 45% OFF',
    ctaLink: 'Home diagnostics & lab tests',
    aspectRatio: '16:9',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 1,
    autoPlayInterval: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-wr-2',
    section: 'waitingRoom',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
    title: 'Express Doorstep Pharmacy & Medicine Delivery',
    subtitle: 'Upload your digital prescription right after this consultation for 60-min express medicine delivery.',
    tag: 'EXPRESS PHARMACY',
    ctaText: 'Explore Pharmacy',
    ctaLink: 'Pharmacy & doorstep medicines',
    aspectRatio: '16:9',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 2,
    autoPlayInterval: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'banner-wr-3',
    section: 'waitingRoom',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    title: 'Vital Lens™ Health Pass for Family',
    subtitle: 'Continuous contactless vitals tracking for aging parents and chronic disease monitoring.',
    tag: 'PREVENTIVE AI',
    ctaText: 'Learn More',
    ctaLink: 'vital-lens',
    aspectRatio: '16:9',
    heightMode: 'medium',
    imageFit: 'cover',
    scale: 100,
    isActive: true,
    order: 3,
    autoPlayInterval: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getStoredBanners = (sectionFilter?: BannerSectionType): AdBannerItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BANNERS));
      const filtered = sectionFilter
        ? DEFAULT_BANNERS.filter((b) => b.section === sectionFilter)
        : DEFAULT_BANNERS;
      return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let sanitized: AdBannerItem[] = parsed.map((item: any) => ({
        ...item,
        section: (item.section === 'waitingRoom' ? 'waitingRoom' : item.section === 'consultation' ? 'consultation' : item.section === 'section2' ? 'section2' : 'section1') as BannerSectionType,
        aspectRatio: item.section === 'waitingRoom' ? '16:9' : item.section === 'consultation' ? '4:1.5' : (item.aspectRatio || '4:1'),
      }));

      // Ensure consultation and waitingRoom defaults exist if none present
      let needsResave = false;
      if (!sanitized.some((b) => b.section === 'consultation')) {
        const consDefaults = DEFAULT_BANNERS.filter((b) => b.section === 'consultation');
        sanitized = [...sanitized, ...consDefaults];
        needsResave = true;
      }
      if (!sanitized.some((b) => b.section === 'waitingRoom')) {
        const wrDefaults = DEFAULT_BANNERS.filter((b) => b.section === 'waitingRoom');
        sanitized = [...sanitized, ...wrDefaults];
        needsResave = true;
      }
      if (needsResave) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      }

      const filtered = sectionFilter ? sanitized.filter((b) => b.section === sectionFilter) : sanitized;
      return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return sectionFilter
      ? DEFAULT_BANNERS.filter((b) => b.section === sectionFilter)
      : DEFAULT_BANNERS;
  } catch {
    return sectionFilter
      ? DEFAULT_BANNERS.filter((b) => b.section === sectionFilter)
      : DEFAULT_BANNERS;
  }
};

export const getActiveBanners = (sectionFilter?: BannerSectionType): AdBannerItem[] => {
  const all = getStoredBanners(sectionFilter);
  return all.filter((b) => b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const saveStoredBanners = (banners: AdBannerItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event('nhealth_banners_updated'));
    window.dispatchEvent(new Event('nhealth_banner_updated'));
  } catch (err) {
    console.error('Failed to save banners:', err);
  }
};

export const addStoredBanner = (banner: Omit<AdBannerItem, 'id' | 'createdAt' | 'updatedAt'>): AdBannerItem => {
  const current = getStoredBanners();
  const section = banner.section || 'section1';
  const sectionItems = current.filter((b) => b.section === section);
  const newBanner: AdBannerItem = {
    ...banner,
    section,
    aspectRatio: section === 'waitingRoom' ? '16:9' : section === 'consultation' ? '4:1.5' : '4:1',
    id: `banner-${section}-${Date.now()}`,
    order: banner.order || sectionItems.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [...current, newBanner];
  saveStoredBanners(updated);
  return newBanner;
};

export const updateStoredBanner = (id: string, updates: Partial<AdBannerItem>): void => {
  const current = getStoredBanners();
  const updated = current.map((b) =>
    b.id === id ? {
      ...b,
      ...updates,
      aspectRatio: (updates.section || b.section) === 'waitingRoom' ? ('16:9' as const) : (updates.section || b.section) === 'consultation' ? ('4:1.5' as const) : ('4:1' as const),
      updatedAt: new Date().toISOString()
    } : b
  );
  saveStoredBanners(updated);
};

export const deleteStoredBanner = (id: string): void => {
  const current = getStoredBanners();
  const target = current.find((b) => b.id === id);
  const remaining = current.filter((b) => b.id !== id);
  if (target) {
    // Re-index order within target's section
    const targetSection = target.section;
    let secIdx = 1;
    const reindexed = remaining.map((b) => {
      if (b.section === targetSection) {
        return { ...b, order: secIdx++ };
      }
      return b;
    });
    saveStoredBanners(reindexed);
  } else {
    saveStoredBanners(remaining);
  }
};

export const reorderStoredBanners = (bannerIds: string[], section: BannerSectionType): void => {
  const current = getStoredBanners();
  const otherSections = current.filter((b) => b.section !== section);
  const sectionBanners = current.filter((b) => b.section === section);
  const map = new Map(sectionBanners.map((b) => [b.id, b]));
  const reordered: AdBannerItem[] = [];

  bannerIds.forEach((id, idx) => {
    const item = map.get(id);
    if (item) {
      reordered.push({ ...item, order: idx + 1, updatedAt: new Date().toISOString() });
      map.delete(id);
    }
  });

  map.forEach((item) => {
    reordered.push({ ...item, order: reordered.length + 1 });
  });

  saveStoredBanners([...otherSections, ...reordered]);
};

export const resetStoredBanners = (): AdBannerItem[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BANNERS));
    window.dispatchEvent(new Event('nhealth_banners_updated'));
    window.dispatchEvent(new Event('nhealth_banner_updated'));
  } catch (err) {
    console.error('Failed to reset banners:', err);
  }
  return DEFAULT_BANNERS;
};

// Legacy compatibility exports
export type AdBannerConfig = AdBannerItem;
export const DEFAULT_AD_BANNER = DEFAULT_BANNERS[0];
export const getStoredAdBanner = (): AdBannerItem => {
  const active = getActiveBanners();
  return active[0] || DEFAULT_BANNERS[0];
};
export const saveStoredAdBanner = (banner: AdBannerItem): void => {
  updateStoredBanner(banner.id, banner);
};
export const resetStoredAdBanner = (): AdBannerItem => {
  const b = resetStoredBanners();
  return b[0];
};
