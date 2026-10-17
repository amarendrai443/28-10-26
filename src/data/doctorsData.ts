import { EmpaneledDoctor, SymptomAnalysisResult, UserLocationState } from '../types/doctorFinder';
import { EXTRACTED_SERVICES } from './servicesData';

export const SUPPORTED_CITIES: { name: string; state: string; popularPincodes: string[] }[] = [
  { name: 'Hyderabad', state: 'Telangana', popularPincodes: ['500001', '500033', '500081', '500034', '500072', '500084'] },
  { name: 'Bengaluru', state: 'Karnataka', popularPincodes: ['560001', '560038', '560034', '560100', '560068'] },
  { name: 'Delhi NCR', state: 'Delhi NCR', popularPincodes: ['110001', '110016', '122001', '201301', '110025'] },
  { name: 'Mumbai', state: 'Maharashtra', popularPincodes: ['400001', '400050', '400053', '400076', '400098'] },
  { name: 'Chennai', state: 'Tamil Nadu', popularPincodes: ['600001', '600018', '600028', '600040', '600096'] },
  { name: 'Pune', state: 'Maharashtra', popularPincodes: ['411001', '411014', '411028', '411045', '411057'] },
  { name: 'Kolkata', state: 'West Bengal', popularPincodes: ['700001', '700019', '700029', '700091', '700064'] },
  { name: 'Ahmedabad', state: 'Gujarat', popularPincodes: ['380001', '380015', '380054', '380059'] },
];

export const POPULAR_SYMPTOM_TAGS = [
  'Chest Pain / Discomfort',
  'High Fever & Shivering',
  'Knee & Joint Pain',
  'Cough & Breathlessness',
  'Severe Back Pain',
  'Stomach Ache & Acidity',
  'Migraine & Headache',
  'Diabetes Checkup',
  'Elderly Care at Home',
  'Skin Rash & Itching',
  'Doorstep Blood Test',
  'Bedside ECG / X-Ray',
];

export const EMPANELED_DOCTORS: EmpaneledDoctor[] = [
  // Cardiology
  {
    id: 'DOC-CARD-01',
    name: 'Dr. Rajeshwar Rao',
    title: 'Senior Consultant Interventional Cardiologist',
    degrees: 'MBBS, MD (Internal Med), DM (Cardiology), FACC',
    specialization: 'Cardiology',
    subSpecialty: 'Preventive & Emergency Heart Care',
    experienceYears: 22,
    hospitalAffiliation: 'Apollo Health City & Nhealth Cardiac Network',
    city: 'Hyderabad',
    locality: 'Jubilee Hills & Banjara Hills',
    pincodes: ['500033', '500034', '500081', '500032', '500084'],
    languages: ['English', 'Telugu', 'Hindi'],
    rating: 4.96,
    reviewCount: 1480,
    consultationFee: 850,
    modes: ['Home Visit', 'Video Call', 'In-Clinic'],
    availabilityText: 'Available Today · Home Visit in 45 mins',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    bio: 'Former Chief Cardiologist with over 22 years of clinical excellence in acute chest pain triage, ECG evaluation, and chronic hypertensive disease management.',
    bestDoctorBadge: 'AI Top-Matched Cardiologist (Highest Rating)',
  },
  {
    id: 'DOC-CARD-02',
    name: 'Dr. Sunita Reddy',
    title: 'Consultant Clinical Cardiologist',
    degrees: 'MBBS, MD (Medicine), DNB (Cardiology)',
    specialization: 'Cardiology',
    subSpecialty: 'Non-Invasive Cardiology & Heart Failure',
    experienceYears: 16,
    hospitalAffiliation: 'Yashoda Hospitals & Nhealth Tele-Cardio',
    city: 'Hyderabad',
    locality: 'Secunderabad & Somajiguda',
    pincodes: ['500003', '500082', '500025', '500016'],
    languages: ['English', 'Telugu', 'Hindi'],
    rating: 4.88,
    reviewCount: 920,
    consultationFee: 700,
    modes: ['Video Call', 'Home Visit'],
    availabilityText: 'Next Video Slot: Within 20 Mins',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1594824813501-4837e3146468?auto=format&fit=crop&w=400&q=80',
    bio: 'Specializes in tele-cardiology, ambulatory blood pressure monitoring, post-angioplasty home follow-ups, and lipid disorder protocols.',
  },

  // Orthopedics
  {
    id: 'DOC-ORTHO-01',
    name: 'Dr. Anand Kulkarni',
    title: 'Lead Orthopedic & Joint Reconstruction Specialist',
    degrees: 'MBBS, MS (Orthopaedics), M.Ch (Ortho, UK)',
    specialization: 'Orthopedics',
    subSpecialty: 'Geriatric Joint Pain & Spine Rehabilitation',
    experienceYears: 20,
    hospitalAffiliation: 'KIMS Hospital & Nhealth Mobility Clinic',
    city: 'Hyderabad',
    locality: 'Gachibowli & Madhapur',
    pincodes: ['500081', '500032', '500084', '500019'],
    languages: ['English', 'Telugu', 'Hindi', 'Marathi'],
    rating: 4.94,
    reviewCount: 1620,
    consultationFee: 800,
    modes: ['Home Visit', 'In-Clinic', 'Video Call'],
    availabilityText: 'Available Today · Priority Home Visit',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    bio: 'Renowned orthopedic surgeon specializing in knee osteo-arthritis bedside consultations, portable X-ray evaluations, and at-home physical recovery management.',
    bestDoctorBadge: 'AI Top-Matched Orthopedic Specialist',
  },
  {
    id: 'DOC-ORTHO-02',
    name: 'Dr. Vikramaditya Varma',
    title: 'Consultant Sports Medicine & Orthopedic Surgeon',
    degrees: 'MBBS, MS (Orthopaedics), DNB',
    specialization: 'Orthopedics',
    subSpecialty: 'Sports Injuries, Ligament Tears & Sciatica',
    experienceYears: 14,
    hospitalAffiliation: 'Care Hospitals & Nhealth Sports Rehab',
    city: 'Hyderabad',
    locality: 'Banjara Hills & Kukatpally',
    pincodes: ['500034', '500072', '500085'],
    languages: ['English', 'Telugu', 'Hindi'],
    rating: 4.89,
    reviewCount: 840,
    consultationFee: 650,
    modes: ['Home Visit', 'Video Call'],
    availabilityText: 'Available Today · Slot at 4:30 PM',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    bio: 'Expertise in acute ligament injuries, back spasm treatments, lumbar sciatica diagnosis, and coordinated home physiotherapy protocols.',
  },

  // General Medicine & Infectious Disease
  {
    id: 'DOC-GEN-01',
    name: 'Dr. Priya Sharma',
    title: 'Senior Consultant Physician & Internal Medicine Specialist',
    degrees: 'MBBS, MD (Internal Medicine), MRCP (London)',
    specialization: 'General Medicine',
    subSpecialty: 'Acute Fevers, Dengue/Typhoid & Preventive Medicine',
    experienceYears: 17,
    hospitalAffiliation: 'Continental Hospital & Nhealth Home Physician Head',
    city: 'Hyderabad',
    locality: 'Financial District & Gachibowli',
    pincodes: ['500032', '500081', '500084', '500008'],
    languages: ['English', 'Hindi', 'Telugu'],
    rating: 4.95,
    reviewCount: 2150,
    consultationFee: 600,
    modes: ['Home Visit', 'Video Call', 'In-Clinic'],
    availabilityText: 'Instant Video / Home Visit in 30 Mins',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    bio: '17+ years managing seasonal febrile illnesses, viral fever triage, diabetic ketoacidosis prevention, and rapid doorstep clinical checkups.',
    bestDoctorBadge: 'AI Top-Matched General Physician',
  },
  {
    id: 'DOC-GEN-02',
    name: 'Dr. Farhan Ahmed',
    title: 'Consultant General Physician & Family Doctor',
    degrees: 'MBBS, MD (General Medicine)',
    specialization: 'General Medicine',
    subSpecialty: 'Chronic Illness Care & Geriatric Health',
    experienceYears: 13,
    hospitalAffiliation: 'Nhealth Primary Care Center',
    city: 'Hyderabad',
    locality: 'Mehdipatnam & Tolichowki',
    pincodes: ['500028', '500008', '500001'],
    languages: ['English', 'Urdu', 'Hindi', 'Telugu'],
    rating: 4.87,
    reviewCount: 1100,
    consultationFee: 500,
    modes: ['Home Visit', 'Video Call'],
    availabilityText: 'Available Today · Immediate Dispatch',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
    bio: 'Dedicated family medicine practitioner with comprehensive expertise in elderly fever monitoring, home antibiotic therapy, and lab results correlation.',
  },

  // Pulmonology
  {
    id: 'DOC-PULM-01',
    name: 'Dr. Arvind Nambiar',
    title: 'Consultant Pulmonologist & Chest Disease Specialist',
    degrees: 'MBBS, MD (Pulmonary Med), DNB (Respiratory), FCCP',
    specialization: 'Pulmonology',
    subSpecialty: 'Asthma, COPD & Post-Viral Lung Recovery',
    experienceYears: 18,
    hospitalAffiliation: 'AIG Hospitals & Nhealth Respiratory Support',
    city: 'Hyderabad',
    locality: 'Gachibowli & Kondapur',
    pincodes: ['500084', '500081', '500032'],
    languages: ['English', 'Malayalam', 'Hindi', 'Telugu'],
    rating: 4.92,
    reviewCount: 1320,
    consultationFee: 750,
    modes: ['Home Visit', 'Video Call', 'In-Clinic'],
    availabilityText: 'Available Today · Home Spirometry Available',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=80',
    bio: 'Recognized specialist in severe chronic cough, oxygen therapy management, home nebulization guidance, and acute bronchospasm protocols.',
    bestDoctorBadge: 'AI Top-Matched Chest Specialist',
  },

  // Gastroenterology
  {
    id: 'DOC-GASTRO-01',
    name: 'Dr. Meenakshi Iyer',
    title: 'Senior Consultant Gastroenterologist & Hepatologist',
    degrees: 'MBBS, MD, DM (Gastroenterology)',
    specialization: 'Gastroenterology',
    subSpecialty: 'GERD, Acidity, IBS & Liver Wellness',
    experienceYears: 16,
    hospitalAffiliation: 'Apollo Hospitals & Nhealth Digestive Care',
    city: 'Hyderabad',
    locality: 'Jubilee Hills & Hitec City',
    pincodes: ['500033', '500081', '500034'],
    languages: ['English', 'Tamil', 'Telugu', 'Hindi'],
    rating: 4.91,
    reviewCount: 980,
    consultationFee: 750,
    modes: ['Video Call', 'Home Visit'],
    availabilityText: 'Next Video Slot: Today 2:00 PM',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1594824813681-42013f9c6c5a?auto=format&fit=crop&w=400&q=80',
    bio: 'Extensive background in abdominal pain evaluation, persistent acid reflux, non-ulcer dyspepsia, and home recovery diet prescription.',
    bestDoctorBadge: 'AI Top-Matched Gastroenterologist',
  },

  // Neurology
  {
    id: 'DOC-NEURO-01',
    name: 'Dr. Sanjay Bansal',
    title: 'Senior Consultant Neurologist',
    degrees: 'MBBS, MD, DM (Neurology)',
    specialization: 'Neurology',
    subSpecialty: 'Migraines, Vertigo, Sciatica & Stroke Rehab',
    experienceYears: 21,
    hospitalAffiliation: 'Sunshine Hospitals & Nhealth Neuro Hub',
    city: 'Hyderabad',
    locality: 'Secunderabad & Begumpet',
    pincodes: ['500003', '500016', '500082'],
    languages: ['English', 'Hindi', 'Telugu'],
    rating: 4.93,
    reviewCount: 1450,
    consultationFee: 850,
    modes: ['Home Visit', 'Video Call', 'In-Clinic'],
    availabilityText: 'Available Today · Home Visit Slots Open',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in intractable headaches, vestibular balance dysfunction, peripheral neuropathies, and bedside neurological examinations.',
    bestDoctorBadge: 'AI Top-Matched Neurologist',
  },

  // Dermatology
  {
    id: 'DOC-DERM-01',
    name: 'Dr. Ananya Sen',
    title: 'Consultant Dermatologist & Trichologist',
    degrees: 'MBBS, MD (DVL - Dermatology)',
    specialization: 'Dermatology',
    subSpecialty: 'Allergic Dermatitis, Eczema & Psoriasis',
    experienceYears: 13,
    hospitalAffiliation: 'Max Healthcare & Nhealth Tele-Derma',
    city: 'Hyderabad',
    locality: 'Madhapur & Jubilee Hills',
    pincodes: ['500081', '500033', '500034'],
    languages: ['English', 'Bengali', 'Hindi', 'Telugu'],
    rating: 4.9,
    reviewCount: 1220,
    consultationFee: 650,
    modes: ['Video Call', 'Home Visit'],
    availabilityText: 'Instant HD Video Slot Available',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    bio: 'Expert in high-definition video skin assessment, allergic rashes, shingles relief, fungal infection eradication, and topical medicine delivery.',
    bestDoctorBadge: 'AI Top-Matched Dermatologist',
  },

  // Pediatrics
  {
    id: 'DOC-PED-01',
    name: 'Dr. Sangeetha Murthy',
    title: 'Senior Consultant Pediatrician & Child Health Specialist',
    degrees: 'MBBS, MD (Pediatrics), DCH',
    specialization: 'Pediatrics',
    subSpecialty: 'Pediatric Fevers, Growth & Infant Nutrition',
    experienceYears: 18,
    hospitalAffiliation: 'Rainbow Children’s Hospital Partner',
    city: 'Hyderabad',
    locality: 'Banjara Hills & Kondapur',
    pincodes: ['500034', '500084', '500081'],
    languages: ['English', 'Telugu', 'Kannada', 'Hindi'],
    rating: 4.97,
    reviewCount: 2300,
    consultationFee: 700,
    modes: ['Home Visit', 'Video Call', 'In-Clinic'],
    availabilityText: 'Available Today · Gentle Child Home Visit',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1594824813501-4837e3146468?auto=format&fit=crop&w=400&q=80',
    bio: 'Highly trusted child health specialist focusing on gentle home visits, painless pediatric vaccination, and 24/7 tele-triage for concerned parents.',
    bestDoctorBadge: 'AI Top-Matched Pediatrician',
  },

  // Geriatrics & Eldercare
  {
    id: 'DOC-GERI-01',
    name: 'Dr. K. V. Ramanathan',
    title: 'Chief Geriatrician & Palliative Medicine Specialist',
    degrees: 'MBBS, MD (Geriatric Medicine), FRCP (Edin)',
    specialization: 'Geriatric Care',
    subSpecialty: 'Senior Chronic Poly-pharmacy & Mobility',
    experienceYears: 25,
    hospitalAffiliation: 'Apollo Hospital & Nhealth Eldercare Medical Director',
    city: 'Hyderabad',
    locality: 'Jubilee Hills & Somajiguda',
    pincodes: ['500033', '500082', '500003', '500034'],
    languages: ['English', 'Telugu', 'Tamil', 'Hindi'],
    rating: 4.98,
    reviewCount: 1850,
    consultationFee: 900,
    modes: ['Home Visit', 'Video Call'],
    availabilityText: 'Dedicated 60-Min Senior Home Visit',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    bio: 'Over 25 years caring for senior citizens in home environments. Specializes in mobility maintenance, medicine reconciliation, and post-hospitalization recovery.',
    bestDoctorBadge: 'AI Top-Matched Geriatrician',
  },

  // Dental Care
  {
    id: 'DOC-DENT-01',
    name: 'Dr. Rohit Verma',
    title: 'Consultant Dental Surgeon & Home Dentistry Lead',
    degrees: 'BDS, MDS (Oral & Maxillofacial Surgery)',
    specialization: 'Dentistry',
    subSpecialty: 'Emergency Toothache, Dentures & Portable Scaling',
    experienceYears: 12,
    hospitalAffiliation: 'Nhealth Portable Dental Units',
    city: 'Hyderabad',
    locality: 'Kukatpally & Hitec City',
    pincodes: ['500072', '500081', '500085'],
    languages: ['English', 'Hindi', 'Telugu'],
    rating: 4.88,
    reviewCount: 760,
    consultationFee: 500,
    modes: ['Home Visit', 'In-Clinic'],
    availabilityText: 'Portable Dental Unit Available Today',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    bio: 'Delivers painless bedside dental evaluations for elderly and bedridden patients with sterilized portable suction and ultrasonic scaler systems.',
    bestDoctorBadge: 'AI Top-Matched Dental Specialist',
  },

  // Endocrinology & Diabetes
  {
    id: 'DOC-ENDO-01',
    name: 'Dr. Deepa Chawla',
    title: 'Consultant Endocrinologist & Diabetologist',
    degrees: 'MBBS, MD (Medicine), DM (Endocrinology)',
    specialization: 'Endocrinology',
    subSpecialty: 'Type-1 & Type-2 Diabetes, Thyroid & Weight Management',
    experienceYears: 15,
    hospitalAffiliation: 'Fortis Hospital & Nhealth Chronic Care',
    city: 'Hyderabad',
    locality: 'Banjara Hills & Madhapur',
    pincodes: ['500034', '500081', '500033'],
    languages: ['English', 'Hindi', 'Punjabi', 'Telugu'],
    rating: 4.93,
    reviewCount: 1540,
    consultationFee: 800,
    modes: ['Video Call', 'Home Visit'],
    availabilityText: 'Available Today · Slot at 5:00 PM',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1594824813501-4837e3146468?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in continuous glucose monitoring (CGM), insulin titration, gestational diabetes care, and thyroid hormone optimization at home.',
    bestDoctorBadge: 'AI Top-Matched Diabetologist',
  },
];

/**
 * Intelligent AI Symptom Engine
 * Analyzes raw keywords or sentences, identifies clinical triage level,
 * recommends required doctor qualification, maps platform services,
 * and algorithmically identifies the best empaneled doctor.
 */
export function analyzeSymptoms(
  query: string,
  userLocation: UserLocationState,
  findBestDoctorRequested: boolean = false
): SymptomAnalysisResult {
  const cleanQ = query.trim().toLowerCase();

  // Specialty detection rules
  let specialty = 'General Medicine';
  let detectedSymptom = 'General Health Consultation';
  let urgency: SymptomAnalysisResult['urgencyLevel'] = 'Routine Care';
  let triage = 'Comprehensive general physician clinical review and primary triage.';
  let serviceIds: string[] = ['doctor-home-visits', 'online-doctor-consultations', 'home-diagnostics'];

  // 1. Cardiology (Heart / Chest pain / BP)
  if (
    cleanQ.includes('chest') ||
    cleanQ.includes('heart') ||
    cleanQ.includes('angina') ||
    cleanQ.includes('palpitat') ||
    cleanQ.includes('bp') ||
    cleanQ.includes('blood pressure') ||
    cleanQ.includes('cardio')
  ) {
    specialty = 'Cardiology';
    detectedSymptom = 'Chest Tightness / Cardiovascular Symptoms';
    urgency = cleanQ.includes('severe') || cleanQ.includes('pain') ? 'Urgent Clinical Review' : 'Priority Attention';
    triage =
      'Immediate cardiovascular evaluation recommended. Bedside 12-lead ECG and Troponin-I screening should be correlated with clinical status.';
    serviceIds = ['xray-portable-diagnostics', 'doctor-home-visits', 'ambulance-24-7', 'home-diagnostics'];
  }
  // 2. Orthopedics (Knee / Leg / Joint / Spine / Back)
  else if (
    cleanQ.includes('knee') ||
    cleanQ.includes('leg') ||
    cleanQ.includes('joint') ||
    cleanQ.includes('bone') ||
    cleanQ.includes('back') ||
    cleanQ.includes('spine') ||
    cleanQ.includes('shoulder') ||
    cleanQ.includes('ortho') ||
    cleanQ.includes('arthritis') ||
    cleanQ.includes('hip') ||
    cleanQ.includes('ankle') ||
    cleanQ.includes('sprain') ||
    cleanQ.includes('fracture') ||
    cleanQ.includes('walk')
  ) {
    specialty = 'Orthopedics';
    detectedSymptom = 'Musculoskeletal & Joint Dysfunction';
    urgency = cleanQ.includes('unable to walk') || cleanQ.includes('severe') ? 'Priority Attention' : 'Routine Care';
    triage =
      'Evaluation by an Orthopedic Specialist and bedside portable digital X-ray recommended. Followed by tailored home physiotherapy.';
    serviceIds = ['physiotherapy-at-home', 'doctor-home-visits', 'xray-portable-diagnostics', 'bedside-assistance'];
  }
  // 3. Respiratory / Pulmonology (Cough / Breathing / Asthma)
  else if (
    cleanQ.includes('cough') ||
    cleanQ.includes('breath') ||
    cleanQ.includes('asthma') ||
    cleanQ.includes('wheez') ||
    cleanQ.includes('phlegm') ||
    cleanQ.includes('throat') ||
    cleanQ.includes('lung') ||
    cleanQ.includes('bronch')
  ) {
    specialty = 'Pulmonology';
    detectedSymptom = 'Respiratory Infection & Breathing Distress';
    urgency = cleanQ.includes('breath') || cleanQ.includes('suffocat') ? 'Urgent Clinical Review' : 'Priority Attention';
    triage =
      'Chest physician assessment and SpO2 vital tracking advised. Check for wheezing, bronchial obstruction, and secondary bacterial infection.';
    serviceIds = ['doctor-home-visits', 'xray-portable-diagnostics', 'doorstep-pharmacy', 'home-diagnostics'];
  }
  // 4. Fevers & Infectious Disease
  else if (
    cleanQ.includes('fever') ||
    cleanQ.includes('cold') ||
    cleanQ.includes('chills') ||
    cleanQ.includes('dengue') ||
    cleanQ.includes('malaria') ||
    cleanQ.includes('typhoid') ||
    cleanQ.includes('shiver') ||
    cleanQ.includes('viral') ||
    cleanQ.includes('weakness') ||
    cleanQ.includes('fatigue')
  ) {
    specialty = 'General Medicine';
    detectedSymptom = 'Acute Febrile Syndrome & Infection';
    urgency = cleanQ.includes('high') || cleanQ.includes('shiver') ? 'Priority Attention' : 'Routine Care';
    triage =
      'Painless blood sample collection for Complete Blood Picture (CBC), Dengue NS1 / Widal, and rapid clinician review for prescription.';
    serviceIds = ['home-diagnostics', 'doctor-home-visits', 'doorstep-pharmacy', 'online-doctor-consultations'];
  }
  // 5. Gastro / Stomach
  else if (
    cleanQ.includes('stomach') ||
    cleanQ.includes('abdomen') ||
    cleanQ.includes('belly') ||
    cleanQ.includes('acid') ||
    cleanQ.includes('gast') ||
    cleanQ.includes('vomit') ||
    cleanQ.includes('nausea') ||
    cleanQ.includes('diarrhea') ||
    cleanQ.includes('loose') ||
    cleanQ.includes('constipat')
  ) {
    specialty = 'Gastroenterology';
    detectedSymptom = 'Gastrointestinal Distress & Abdominal Symptoms';
    urgency = cleanQ.includes('severe') || cleanQ.includes('blood') ? 'Urgent Clinical Review' : 'Priority Attention';
    triage =
      'Clinical examination of abdomen, hydration electrolyte monitoring, and targeted anti-secretory / antispasmodic therapy advised.';
    serviceIds = ['doctor-home-visits', 'online-doctor-consultations', 'home-diagnostics', 'doorstep-pharmacy'];
  }
  // 6. Neurology (Headache, Migraine, Dizziness)
  else if (
    cleanQ.includes('headache') ||
    cleanQ.includes('migraine') ||
    cleanQ.includes('dizzy') ||
    cleanQ.includes('vertigo') ||
    cleanQ.includes('numb') ||
    cleanQ.includes('nerve') ||
    cleanQ.includes('seizure') ||
    cleanQ.includes('faint')
  ) {
    specialty = 'Neurology';
    detectedSymptom = 'Neurological Symptoms & Cranial Pain';
    urgency = cleanQ.includes('numb') || cleanQ.includes('faint') ? 'Priority Attention' : 'Routine Care';
    triage =
      'Consultation with a Neurologist recommended. Check cranial nerve reflex, blood pressure correlation, and cervical spine posture.';
    serviceIds = ['doctor-home-visits', 'online-doctor-consultations', 'diagnostics-advance-imaging', 'home-diagnostics'];
  }
  // 7. Dermatology (Skin / Rash / Itch)
  else if (
    cleanQ.includes('skin') ||
    cleanQ.includes('rash') ||
    cleanQ.includes('itch') ||
    cleanQ.includes('allergy') ||
    cleanQ.includes('eczema') ||
    cleanQ.includes('boil') ||
    cleanQ.includes('pimple') ||
    cleanQ.includes('acne')
  ) {
    specialty = 'Dermatology';
    detectedSymptom = 'Dermatological Lesion & Cutaneous Allergy';
    urgency = 'Routine Care';
    triage =
      'HD digital photograph / video assessment by Consultant Dermatologist. Direct doorstep delivery of topical formulations.';
    serviceIds = ['online-doctor-consultations', 'doorstep-pharmacy', 'home-diagnostics'];
  }
  // 8. Dental (Tooth / Gum)
  else if (cleanQ.includes('tooth') || cleanQ.includes('teeth') || cleanQ.includes('dent') || cleanQ.includes('gum') || cleanQ.includes('jaw')) {
    specialty = 'Dentistry';
    detectedSymptom = 'Odontogenic & Oral Health Concern';
    urgency = 'Priority Attention';
    triage = 'Portable bedside dental examination unit dispatched for toothache relief, scaling, or denture alignment.';
    serviceIds = ['dental-care-oral-health', 'doctor-home-visits', 'doorstep-pharmacy'];
  }
  // 9. Elder Care / Senior
  else if (
    cleanQ.includes('elder') ||
    cleanQ.includes('grand') ||
    cleanQ.includes('senior') ||
    cleanQ.includes('bedridden') ||
    cleanQ.includes('dementia') ||
    cleanQ.includes('attendant')
  ) {
    specialty = 'Geriatric Care';
    detectedSymptom = 'Geriatric Health & Assisted Living Needs';
    urgency = 'Priority Attention';
    triage =
      'Comprehensive elderly care review: home nursing, certified bedside attendant scheduling, routine blood pressure/sugar checks.';
    serviceIds = ['eldercare-senior-assistance', 'bedside-assistance', 'specialized-nursing-care', 'nhealth-careassist'];
  }
  // 10. Diabetes & Endocrinology
  else if (cleanQ.includes('diabetes') || cleanQ.includes('sugar') || cleanQ.includes('thyroid') || cleanQ.includes('insulin')) {
    specialty = 'Endocrinology';
    detectedSymptom = 'Metabolic & Glycemic Disorder';
    urgency = 'Routine Care';
    triage = 'Fasting / Post-prandial blood sugar and HbA1c screening at home, followed by Diabetologist diet & dose titration.';
    serviceIds = ['home-diagnostics', 'online-doctor-consultations', 'doctor-home-visits', 'doorstep-pharmacy'];
  }

  // Filter doctors matching the specialty (and location if present)
  let doctors = EMPANELED_DOCTORS.filter((d) => d.specialization === specialty);

  // If few doctors in this exact specialty, append General Medicine doctors as backup
  if (doctors.length === 0) {
    doctors = EMPANELED_DOCTORS.filter((d) => d.specialization === 'General Medicine');
  }

  // City filtering: Prioritize doctors in user city, fallback to all if empty
  const cityFiltered = doctors.filter((d) => d.city.toLowerCase() === userLocation.city.toLowerCase());
  const finalDoctors = cityFiltered.length > 0 ? cityFiltered : doctors;

  // Algorithmically score and rank doctors:
  // Score = Rating (40%) + Experience (30%) + Reviews (15%) + Pincode Match (15%)
  const scoredDoctors = finalDoctors.map((doc) => {
    let score = doc.rating * 10; // ~49 pts
    score += Math.min(30, doc.experienceYears * 1.5); // ~30 pts
    score += Math.min(15, (doc.reviewCount / 2000) * 15); // ~15 pts
    if (userLocation.pincode && doc.pincodes.includes(userLocation.pincode)) {
      score += 15; // Local pincode match bonus
    }
    return { ...doc, recommendationScore: Math.round(score) };
  });

  scoredDoctors.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

  const bestDoctor = scoredDoctors[0] || null;

  return {
    query,
    detectedSymptom,
    primarySpecialty: specialty,
    specialtyDescription: `Requires consultation with a qualified ${specialty} Specialist`,
    urgencyLevel: urgency,
    triageSummary: triage,
    suggestedServiceIds: serviceIds,
    matchedDoctors: scoredDoctors,
    bestDoctor,
    locationCity: userLocation.city,
    locationPincode: userLocation.pincode,
  };
}

export const registerLivePartnerDoctor = (partner: {
  id: string;
  entityName: string;
  specialty: string;
  registrationNumber: string;
  city: string;
  district?: string;
  state?: string;
  phone?: string;
  consultationFee?: number;
  bioOrExperience?: string;
}) => {
  const existingIdx = EMPANELED_DOCTORS.findIndex((d) => d.id === partner.id);
  const specLower = partner.specialty.toLowerCase();
  const specialization = specLower.includes('cardio') || specLower.includes('heart')
    ? 'Cardiology'
    : specLower.includes('pediatric') || specLower.includes('child')
    ? 'Pediatrics'
    : specLower.includes('ortho') || specLower.includes('bone') || specLower.includes('joint')
    ? 'Orthopedics'
    : specLower.includes('gyn') || specLower.includes('women')
    ? 'Gynecology'
    : specLower.includes('neuro')
    ? 'Neurology'
    : specLower.includes('derm') || specLower.includes('skin')
    ? 'Dermatology'
    : specLower.includes('ent') || specLower.includes('throat')
    ? 'ENT'
    : specLower.includes('geriatric') || specLower.includes('elder')
    ? 'Geriatrics'
    : 'General Medicine';

  const newDoc: EmpaneledDoctor = {
    id: partner.id,
    name: partner.entityName,
    title: `Consultant Specialist (${specialization})`,
    degrees: partner.registrationNumber ? `Reg: ${partner.registrationNumber}` : 'MBBS, MD',
    specialization,
    subSpecialty: partner.specialty,
    experienceYears: 14,
    hospitalAffiliation: 'Nhealth Live Verified Partner Network',
    city: partner.city || 'Hyderabad',
    locality: partner.district || 'City Medical Zone',
    pincodes: ['500001', '500033', '500081', '500034', '560001', '560034', '110001'],
    languages: ['English', 'Hindi', 'Regional'],
    rating: 4.95,
    reviewCount: 380,
    consultationFee: partner.consultationFee || 700,
    modes: ['Home Visit', 'Video Call', 'In-Clinic'],
    availabilityText: 'Available Today · Nhealth Live Verified Doctor',
    isNhealthVerified: true,
    isPremiumEmpaneled: true,
    profileImage: 'https://images.unsplash.com/photo-1594824813639-50953fc9a957?auto=format&fit=crop&w=400&q=80',
    bio: partner.bioOrExperience || 'Newly verified Nhealth partner clinician providing hospital-grade care at home.',
    bestDoctorBadge: '★ Newly Approved Live Partner Doctor',
  };

  if (existingIdx >= 0) {
    EMPANELED_DOCTORS[existingIdx] = newDoc;
  } else {
    EMPANELED_DOCTORS.unshift(newDoc);
  }
};

export const unregisterPartnerDoctor = (partnerId: string) => {
  const existingIdx = EMPANELED_DOCTORS.findIndex((d) => d.id === partnerId);
  if (existingIdx >= 0) {
    EMPANELED_DOCTORS.splice(existingIdx, 1);
  }
};
