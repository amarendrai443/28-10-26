export interface VitalLensUserData {
  fullName: string;
  mobileNumber: string;
  pincode: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  heightCm: number;
  weightKg: number;
  heightUnit: 'cm' | 'ft_in';
  heightFt?: number;
  heightIn?: number;
  weightUnit: 'kg' | 'lb';
  weightLb?: number;
}

export interface VitalMetricsResult {
  // Key Body Vitals
  heartRate: number; // BPM
  respirationRate: number; // RPM
  oxygenSaturation: number; // SpO2 %
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  
  // Heart Health Metrics
  sdnn: number; // ms
  rmssd: number; // ms
  pnn50: number; // %
  cardiacOutput: number; // L/min
  meanArterialPressure: number; // MAP mmHg
  heartUtilized: number; // %

  // Mental Wellbeing & Stress / ANS
  mentalWellbeingScore: number; // 0-100
  stressLevel: 'Low / Relaxed' | 'Moderate / Normal' | 'Elevated Stress';
  ansBalanceRatio: number; // LF/HF ratio
  ansStatus: 'Balanced' | 'Sympathetic Dominant' | 'Parasympathetic Dominant';

  // Physiological Metrics
  bmi: number;
  bmiStatus: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  bloodVolumeLiters: number;
  totalBloodWaterLiters: number;
  bodyWaterPercentage: number;
  totalBodyFatPercentage: number;
  bodyWeightKg: number;

  scanTimestamp: string;
}
