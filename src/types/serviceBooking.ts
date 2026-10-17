export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  cardImage: string;
  iconImage: string;
  iconName: string;
  badge?: string;
  turnaroundTime?: string;
}

export interface BookingFormData {
  serviceId: string;
  serviceName: string;
  patientName: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  state: string;
  city: string;
  symptoms: string;
  address: string;
  preferredDate: string;
  preferredTimeSlot: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  accountType?: 'Patient' | 'Partner' | string;
  role?: string;
  entityName?: string;
  roles?: string[];
  provider?: 'phone' | 'email' | 'google';
  specialty?: string;
  status?: string;
  city?: string;
}

export interface ConfirmedBooking {
  referenceId: string;
  serviceId: string;
  serviceName: string;
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  whatsapp: string;
  state: string;
  city: string;
  symptoms: string;
  address: string;
  preferredDate: string;
  preferredTimeSlot: string;
  bookedAt: string;
  isGuest: boolean;
  userId?: string;
  status: 'Confirmed' | 'Clinician Dispatched' | 'Sample Collected' | 'Report Ready';
}
