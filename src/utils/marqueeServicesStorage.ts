export interface MarqueeServiceItem {
  id: string;
  name: string;
  directUrl: string;
  localFile?: string;
  pageUrl?: string;
  tagline: string;
  description?: string;
  category: string;
  iconName?: string;
  gradient?: string;
  aspectRatio?: string; // Strict 3:2 aspect ratio setting
  active?: boolean;
}

export const DEFAULT_MARQUEE_SERVICES: MarqueeServiceItem[] = [
  {
    id: 'physiotherapy',
    name: 'Physiotherapy',
    directUrl: 'https://i.ibb.co/MD4rcRxf/physiotherapy.png',
    localFile: '/physiotherapy.png',
    pageUrl: 'https://ibb.co/Z6P5BhpS',
    tagline: 'Home Rehabilitation & Mobility Care',
    category: 'Therapy',
    iconName: 'Activity',
    gradient: 'from-[#002b49] to-[#008080]',
    active: true,
  },
  {
    id: 'care-ride',
    name: 'Nhealth Care Ride',
    directUrl: 'https://i.ibb.co/HLBmNpxW/nhealth-care-ride.png',
    localFile: '/nhealth%20care%20ride.png',
    pageUrl: 'https://ibb.co/TDYzKqbV',
    tagline: 'Assisted Non-Emergency Medical Transit',
    category: 'Transit',
    iconName: 'Car',
    gradient: 'from-[#003e6b] to-[#0d9488]',
    active: true,
  },
  {
    id: 'teleconsult',
    name: 'Online Doctor Consultations',
    directUrl: 'https://i.ibb.co/xKYqBdCf/online-doctor-consultations.png',
    localFile: '/online%20doctor%20consultations.png',
    pageUrl: 'https://ibb.co/8nbgftKd',
    tagline: 'Instant Specialist Video & E-Prescription',
    category: 'Tele-Health',
    iconName: 'Video',
    gradient: 'from-[#002b49] to-[#0284c7]',
    active: true,
  },
  {
    id: 'care-assist',
    name: 'Care Assist',
    directUrl: 'https://i.ibb.co/k2fngTSD/nhealth-care-assist.png',
    localFile: '/nhealth%20care%20assist.png',
    pageUrl: 'https://ibb.co/RTmnpKD6',
    tagline: 'Trained Home Attendants & Daily Support',
    category: 'Personal Care',
    iconName: 'HeartHandshake',
    gradient: 'from-[#0a3d66] to-[#0f766e]',
    active: true,
  },
  {
    id: 'home-xray',
    name: 'Home X-Ray Services',
    directUrl: 'https://i.ibb.co/wNP3sZ5j/home-X-ray-Services.png',
    localFile: '/home%20X-ray%20Services.png',
    pageUrl: 'https://ibb.co/mC218rfg',
    tagline: 'Portable Digital Radiography At Doorstep',
    category: 'Imaging',
    iconName: 'Layers',
    gradient: 'from-[#0f172a] to-[#008080]',
    active: true,
  },
  {
    id: 'bedside',
    name: 'Bedside Assistance',
    directUrl: 'https://i.ibb.co/jZWnsBZY/bedside-assistance.png',
    localFile: '/bedside%20assistance.png',
    pageUrl: 'https://ibb.co/Z1Yq7t1r',
    tagline: 'Compassionate Post-Hospitalization Care',
    category: 'Nursing',
    iconName: 'HeartPulse',
    gradient: 'from-[#002b49] to-[#059669]',
    active: true,
  },
  {
    id: 'premium-opd',
    name: 'Premium OPD Services',
    directUrl: 'https://i.ibb.co/xWCH1bq/premium-opd-services.png',
    localFile: '/premium%20opd%20services.png',
    pageUrl: 'https://ibb.co/H6FdtyT',
    tagline: 'Priority Zero-Wait Specialist Clinic Access',
    category: 'Priority Care',
    iconName: 'Award',
    gradient: 'from-[#1e293b] to-[#0d9488]',
    active: true,
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Delivery',
    directUrl: 'https://i.ibb.co/N6DZSZ9q/Pharmacy-to-home.png',
    localFile: '/Pharmacy%20to%20home.png',
    pageUrl: 'https://ibb.co/4ZvPdP8L',
    tagline: 'Direct Temperature-Controlled Medicines',
    category: 'Pharmacy',
    iconName: 'Pill',
    gradient: 'from-[#002b49] to-[#10b981]',
    active: true,
  },
  {
    id: 'prebook-opd',
    name: 'Pre-Booking OPD',
    directUrl: 'https://i.ibb.co/BVmgv704/pre-booking-opd-services.png',
    localFile: '/pre%20booking%20opd%20services.png',
    pageUrl: 'https://ibb.co/1f39BpFs',
    tagline: 'Guaranteed Consult Slots & Express Tokens',
    category: 'Scheduling',
    iconName: 'CalendarCheck',
    gradient: 'from-[#00385e] to-[#0284c7]',
    active: true,
  },
];

const STORAGE_KEY = 'nhealth_marquee_services';
export const MARQUEE_SERVICES_UPDATED_EVENT = 'nhealth_marquee_services_updated';

export const getStoredMarqueeServices = (): MarqueeServiceItem[] => {
  if (typeof window === 'undefined') return DEFAULT_MARQUEE_SERVICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MARQUEE_SERVICES));
      return DEFAULT_MARQUEE_SERVICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MARQUEE_SERVICES;
  } catch {
    return DEFAULT_MARQUEE_SERVICES;
  }
};

export const saveStoredMarqueeServices = (items: MarqueeServiceItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(MARQUEE_SERVICES_UPDATED_EVENT, { detail: items }));
  } catch (err) {
    console.error('Failed to save marquee services to localStorage:', err);
  }
};

export const addMarqueeService = (
  item: Omit<MarqueeServiceItem, 'id'> & { id?: string }
): MarqueeServiceItem => {
  const current = getStoredMarqueeServices();
  const newItem: MarqueeServiceItem = {
    ...item,
    id: item.id || `srv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    active: item.active !== false,
  };
  const updated = [newItem, ...current];
  saveStoredMarqueeServices(updated);
  return newItem;
};

export const updateMarqueeService = (
  id: string,
  updates: Partial<MarqueeServiceItem>
): void => {
  const current = getStoredMarqueeServices();
  const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveStoredMarqueeServices(updated);
};

export const deleteMarqueeService = (id: string): void => {
  const current = getStoredMarqueeServices();
  const updated = current.filter((s) => s.id !== id);
  saveStoredMarqueeServices(updated.length > 0 ? updated : DEFAULT_MARQUEE_SERVICES);
};

export const toggleMarqueeServiceActive = (id: string): void => {
  const current = getStoredMarqueeServices();
  const updated = current.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
  saveStoredMarqueeServices(updated);
};

export const resetMarqueeServices = (): void => {
  saveStoredMarqueeServices(DEFAULT_MARQUEE_SERVICES);
};
