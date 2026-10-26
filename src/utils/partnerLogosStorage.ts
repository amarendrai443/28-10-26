export interface PartnerLogoItem {
  id: string;
  name: string;
  src: string;
  fallback?: string;
  websiteUrl?: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface AccreditationItem {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export const INITIAL_PARTNER_LOGOS: PartnerLogoItem[] = [
  {
    id: 'partner-thyrocare',
    name: 'Thyrocare',
    src: 'https://i.ibb.co/svR7RMht/Thyrocare-Logo.jpg',
    fallback: '/thyrocare_partner_logo.jpg',
    order: 1,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'partner-lupin',
    name: 'Lupin Diagnostics',
    src: 'https://i.ibb.co/GfR32V8n/lupin-diagnostics.jpg',
    fallback: '/lupin_partner_logo.jpg',
    order: 2,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_ACCREDITATIONS: AccreditationItem[] = [
  { id: 'acc-1', name: 'NABL Accreditations', order: 1, active: true },
  { id: 'acc-2', name: 'CAP Accreditations', order: 2, active: true },
  { id: 'acc-3', name: 'NABH Accreditations', order: 3, active: true },
];

const LOGOS_STORAGE_KEY = 'nhealth_diagnostic_partner_logos';
const ACCREDITATIONS_STORAGE_KEY = 'nhealth_accreditations';

export function getStoredPartnerLogos(): PartnerLogoItem[] {
  if (typeof window === 'undefined') return INITIAL_PARTNER_LOGOS;
  try {
    const raw = localStorage.getItem(LOGOS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOGOS_STORAGE_KEY, JSON.stringify(INITIAL_PARTNER_LOGOS));
      return INITIAL_PARTNER_LOGOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PARTNER_LOGOS;
  } catch {
    return INITIAL_PARTNER_LOGOS;
  }
}

export function saveStoredPartnerLogos(logos: PartnerLogoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGOS_STORAGE_KEY, JSON.stringify(logos));
    window.dispatchEvent(new CustomEvent('nhealth_partner_logos_updated', { detail: logos }));
  } catch {}
}

export function addPartnerLogo(data: Omit<PartnerLogoItem, 'id' | 'createdAt'>): PartnerLogoItem {
  const current = getStoredPartnerLogos();
  const newItem: PartnerLogoItem = {
    ...data,
    id: 'partner-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newItem];
  saveStoredPartnerLogos(updated);
  return newItem;
}

export function updatePartnerLogo(id: string, updates: Partial<PartnerLogoItem>): void {
  const current = getStoredPartnerLogos();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveStoredPartnerLogos(updated);
}

export function deletePartnerLogo(id: string): void {
  const current = getStoredPartnerLogos();
  const updated = current.filter((item) => item.id !== id);
  saveStoredPartnerLogos(updated);
}

export function getStoredAccreditations(): AccreditationItem[] {
  if (typeof window === 'undefined') return INITIAL_ACCREDITATIONS;
  try {
    const raw = localStorage.getItem(ACCREDITATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCREDITATIONS_STORAGE_KEY, JSON.stringify(INITIAL_ACCREDITATIONS));
      return INITIAL_ACCREDITATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACCREDITATIONS;
  } catch {
    return INITIAL_ACCREDITATIONS;
  }
}

export function saveStoredAccreditations(items: AccreditationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCREDITATIONS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('nhealth_accreditations_updated', { detail: items }));
  } catch {}
}

export function addAccreditation(name: string): AccreditationItem {
  const current = getStoredAccreditations();
  const newItem: AccreditationItem = {
    id: 'acc-' + Date.now(),
    name: name.trim(),
    order: current.length + 1,
    active: true,
  };
  const updated = [...current, newItem];
  saveStoredAccreditations(updated);
  return newItem;
}

export function updateAccreditation(id: string, updates: Partial<AccreditationItem>): void {
  const current = getStoredAccreditations();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveStoredAccreditations(updated);
}

export function deleteAccreditation(id: string): void {
  const current = getStoredAccreditations();
  const updated = current.filter((item) => item.id !== id);
  saveStoredAccreditations(updated);
}

export function moveAccreditationOrder(id: string, direction: 'up' | 'down'): void {
  const current = getStoredAccreditations();
  const sorted = [...current].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((item) => item.id === id);
  if (idx < 0) return;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return;

  const temp = sorted[idx];
  sorted[idx] = sorted[targetIdx];
  sorted[targetIdx] = temp;

  // re-assign consecutive order
  const reordered = sorted.map((item, index) => ({ ...item, order: index + 1 }));
  saveStoredAccreditations(reordered);
}

export function resetPartnerLogos(): PartnerLogoItem[] {
  saveStoredPartnerLogos(INITIAL_PARTNER_LOGOS);
  return INITIAL_PARTNER_LOGOS;
}

export function resetAccreditations(): AccreditationItem[] {
  saveStoredAccreditations(INITIAL_ACCREDITATIONS);
  return INITIAL_ACCREDITATIONS;
}
