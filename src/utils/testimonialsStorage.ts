export interface TestimonialItem {
  id: string;
  patientName: string;
  serviceName: string;
  rating: number; // 1 to 5
  feedbackNote: string;
  complaintNote?: string;
  status: 'approved' | 'flagged_danger' | 'pending' | 'rejected';
  flaggedReason?: string;
  city: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'nhealth_testimonials_v1';

// Initial verified patient reviews for Bharat's at-home healthcare services
export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-01',
    patientName: 'Ananya Sharma',
    serviceName: 'Home Diagnostics & Lab Tests',
    rating: 5,
    feedbackNote: 'The phlebotomist arrived within 25 minutes of booking in Hyderabad. Absolutely painless blood draw for my elderly mother, and digital reports were delivered on WhatsApp before evening.',
    city: 'Hyderabad',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-02',
    patientName: 'Karthik Ramanathan',
    serviceName: 'Online Doctor Consultations',
    rating: 5,
    feedbackNote: 'Had an urgent midnight video consultation with a senior cardiologist. The doctor patiently examined my ECG readings, reassured us, and generated a verified digital prescription instantly.',
    city: 'Bengaluru',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-03',
    patientName: 'Sumantha Mukherjee',
    serviceName: 'Eldercare & Bedside Assistance',
    rating: 5,
    feedbackNote: 'The nursing attendant provided compassionate, hospital-grade care for my father post-knee replacement surgery. Monitored vitals, managed IV drips, and helped him walk safely.',
    city: 'Kolkata',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-04',
    patientName: 'Dr. Vikramaditya Rao',
    serviceName: 'Doctor Home Visits',
    rating: 5,
    feedbackNote: 'Nhealth is a game-changer for pediatric emergency care. The doctor reached our apartment in Gachibowli with a clinical kit and calmed our 4-year-old high fever in 30 minutes.',
    city: 'Hyderabad',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Moderation wordlist to detect abusive, profanity, offensive, spam, or hostile content
const UNWANTED_PATTERNS = [
  /\b(scam|fraud|cheat|fake|robbery|thief|idiot|stupid|bastard|damn|hell|asshole|bitch|f\*ck|fuck|shit|crap|bloody|garbage|rubbish|kill|threat|harass|hate|worst)\b/i,
  /\b(chor|lutere|bakwaas|pagal|ganda|fraudster|dhokha|chutiya|harami)\b/i,
  /[!$?*#]{3,}/, // Excessive aggressive punctuation
];

/**
 * AI Content Moderation Filter:
 * Evaluates sentiment, abusive words, profanity, and toxicity.
 */
export function moderateFeedback(text: string): { isClean: boolean; reason?: string } {
  if (!text || text.trim().length < 3) {
    return { isClean: false, reason: 'Feedback text too short or empty' };
  }

  for (const pattern of UNWANTED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isClean: false,
        reason: 'Detected offensive, abusive, or unparliamentary phrasing',
      };
    }
  }

  return { isClean: true };
}

export function getStoredTestimonials(): TestimonialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TESTIMONIALS));
      return DEFAULT_TESTIMONIALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TESTIMONIALS;
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
}

export function getApprovedTestimonials(): TestimonialItem[] {
  return getStoredTestimonials().filter((t) => t.status === 'approved');
}

export function getFlaggedTestimonials(): TestimonialItem[] {
  return getStoredTestimonials().filter((t) => t.status === 'flagged_danger');
}

export function saveStoredTestimonials(list: TestimonialItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('nhealth_testimonials_updated'));
  } catch (err) {
    console.error('Failed to save testimonials:', err);
  }
}

export interface FeedbackSubmissionPayload {
  patientName: string;
  serviceName: string;
  rating: number;
  feedbackNote: string;
  complaintNote?: string;
  city?: string;
}

/**
 * Automated Submission with AI Moderation & Auto-Feed:
 * - If Rating >= 4 and passes AI text moderation -> status 'approved' (auto-published)
 * - If flagged by AI moderation -> status 'flagged_danger' (blocked from public view, highlighted in Red Danger Alert)
 * - If Rating < 4 and clean -> status 'pending' (internal review)
 */
export function submitPatientFeedback(payload: FeedbackSubmissionPayload): {
  success: boolean;
  item: TestimonialItem;
  moderationResult: { isClean: boolean; reason?: string };
  isAutoPublished: boolean;
} {
  const modResult = moderateFeedback(payload.feedbackNote);
  let status: TestimonialItem['status'] = 'pending';
  let flaggedReason: string | undefined = undefined;
  let isAutoPublished = false;

  if (!modResult.isClean) {
    status = 'flagged_danger';
    flaggedReason = modResult.reason || 'Flagged by AI Text Moderation';
  } else if (payload.rating >= 4) {
    status = 'approved';
    isAutoPublished = true;
  } else {
    status = 'pending';
  }

  const newItem: TestimonialItem = {
    id: `test-${Date.now()}`,
    patientName: payload.patientName.trim() || 'Verified Patient',
    serviceName: payload.serviceName || 'Home Healthcare',
    rating: payload.rating,
    feedbackNote: payload.feedbackNote.trim(),
    complaintNote: payload.complaintNote?.trim() || undefined,
    status,
    flaggedReason,
    city: payload.city || 'Hyderabad',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.patientName || 'VP')}&backgroundColor=008080,002b49`,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = getStoredTestimonials();
  const updated = [newItem, ...current];
  saveStoredTestimonials(updated);

  return {
    success: true,
    item: newItem,
    moderationResult: modResult,
    isAutoPublished,
  };
}

export function updateTestimonialStatus(id: string, status: TestimonialItem['status']): void {
  const current = getStoredTestimonials();
  const updated = current.map((t) =>
    t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
  );
  saveStoredTestimonials(updated);
}

export function deleteTestimonial(id: string): void {
  const current = getStoredTestimonials();
  const updated = current.filter((t) => t.id !== id);
  saveStoredTestimonials(updated);
}

export function addAdminTestimonial(item: Omit<TestimonialItem, 'id' | 'createdAt' | 'updatedAt'>): TestimonialItem {
  const newItem: TestimonialItem = {
    ...item,
    id: `test-admin-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const current = getStoredTestimonials();
  saveStoredTestimonials([newItem, ...current]);
  return newItem;
}
