export interface EmpaneledDoctor {
  id: string;
  name: string;
  title: string;
  degrees: string;
  specialization: string;
  subSpecialty?: string;
  experienceYears: number;
  hospitalAffiliation: string;
  city: string;
  locality: string;
  pincodes: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  consultationFee: number;
  modes: ('Home Visit' | 'Video Call' | 'In-Clinic')[];
  availabilityText: string;
  isNhealthVerified: boolean;
  isPremiumEmpaneled: boolean;
  profileImage: string;
  bio: string;
  bestDoctorBadge?: string;
  recommendationScore?: number;
}

export interface SymptomAnalysisResult {
  query: string;
  detectedSymptom: string;
  primarySpecialty: string;
  specialtyDescription: string;
  urgencyLevel: 'Routine Care' | 'Priority Attention' | 'Urgent Clinical Review';
  triageSummary: string;
  suggestedServiceIds: string[];
  matchedDoctors: EmpaneledDoctor[];
  bestDoctor: EmpaneledDoctor | null;
  locationCity: string;
  locationPincode?: string;
}

export interface UserLocationState {
  city: string;
  state: string;
  pincode: string;
  isAutoDetected: boolean;
}
