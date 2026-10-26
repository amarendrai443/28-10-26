import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  CreditCard,
  Tag,
  Sparkles,
  Camera,
  Activity,
  Heart,
  Droplet,
  Radio,
  Building2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  User,
  Phone,
  HelpCircle,
  Award,
  MessageSquare,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { EmpaneledDoctor } from '../types/doctorFinder';
import { ConsultationSession, VitalsPayload } from '../types/consultationBooking';
import { WaitingRoomAdCarousel } from './WaitingRoomAdCarousel';
import {
  buildWhatsAppConfirmation,
  triggerDeepLinkRedirection,
  WhatsAppReceiptPayload,
} from '../utils/whatsappDispatch';
import { ConsultationVideoRoom } from './ConsultationVideoRoom';

interface DoctorCheckoutModalProps {
  doctor: EmpaneledDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'Immediate Connect' | 'Scheduled Slot';
  initialDate?: string;
  initialSlot?: string;
  initialSymptoms?: string;
  onConsultationConfirmed?: (session: ConsultationSession) => void;
}

// Available Valid Promo Coupons
const AVAILABLE_COUPONS: Record<string, { type: 'flat' | 'percent'; value: number; label: string }> = {
  NHEALTHLIVE: { type: 'flat', value: 150, label: 'Flat ₹150 OFF Welcome Bonus' },
  WELCOME20: { type: 'percent', value: 20, label: '20% OFF First Tele-Consult' },
  HEALTH50: { type: 'percent', value: 50, label: '50% OFF (Max ₹300)' },
  VITAL100: { type: 'flat', value: 100, label: 'Flat ₹100 OFF Vital Scan Perk' },
  NHCARE45: { type: 'percent', value: 45, label: 'Flat 45% OFF Care Special' },
};

export const DoctorCheckoutModal: React.FC<DoctorCheckoutModalProps> = ({
  doctor,
  isOpen,
  onClose,
  initialMode = 'Immediate Connect',
  initialDate = 'Today, 25 Oct',
  initialSlot = '11:00 AM',
  initialSymptoms = '',
  onConsultationConfirmed,
}) => {
  if (!isOpen || !doctor) return null;

  // Multi-step checkout flow states:
  // 'form' -> 'processing' -> 'vitals_prompt' -> 'vitals_scan' -> 'waiting_room'
  const [step, setStep] = useState<
    'form' | 'processing' | 'vitals_prompt' | 'vitals_scan' | 'waiting_room'
  >('form');

  // Consultation Details
  const [connectMode, setConnectMode] = useState<'Immediate Connect' | 'Scheduled Slot'>(initialMode);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);

  // Patient Info
  const [patientName, setPatientName] = useState('Ananya Sharma');
  const [patientPhone, setPatientPhone] = useState('9876543210');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState('Female');
  const [symptoms, setSymptoms] = useState(
    initialSymptoms || 'Experiencing persistent mild headache, dry cough and mild body fatigue for 2 days.'
  );

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('NHEALTHLIVE');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(
    'Coupon NHEALTHLIVE applied: Flat ₹150 OFF'
  );

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');

  // Session & Vitals Payload
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [scannedVitals, setScannedVitals] = useState<VitalsPayload | null>(null);
  const [doctorNotifiedToast, setDoctorNotifiedToast] = useState(false);
  const [doctorAcceptedCall, setDoctorAcceptedCall] = useState(false);

  // WhatsApp Confirmation & Deep Link State
  const [whatsappReceipt, setWhatsappReceipt] = useState<WhatsAppReceiptPayload | null>(null);
  const [whatsappDispatchedToast, setWhatsappDispatchedToast] = useState(false);

  // E2EE Video Room State
  const [isVideoRoomOpen, setIsVideoRoomOpen] = useState(false);
  const [videoRoomRole, setVideoRoomRole] = useState<'patient' | 'doctor'>('doctor');

  // Vital Lens Camera Auto-Scan State
  const [scanSecondsElapsed, setScanSecondsElapsed] = useState(0);
  const [liveBpmTicker, setLiveBpmTicker] = useState(74);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Price Calculation
  const originalFee = doctor.consultationFee || 600;
  let discountAmount = 0;
  if (appliedCoupon && AVAILABLE_COUPONS[appliedCoupon]) {
    const cp = AVAILABLE_COUPONS[appliedCoupon];
    if (cp.type === 'flat') {
      discountAmount = cp.value;
    } else {
      discountAmount = Math.min(Math.round((originalFee * cp.value) / 100), 300);
    }
  }
  const finalAmount = Math.max(originalFee - discountAmount, 0);

  // Apply Coupon Handler
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    if (AVAILABLE_COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponSuccess(`Coupon ${code} applied: ${AVAILABLE_COUPONS[code].label}`);
      setCouponCodeInput('');
    } else {
      setCouponError('Invalid coupon code. Try NHEALTHLIVE, WELCOME20, or VITAL100.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Play a soft audio chime when doctor is notified
  const playDoctorPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed or not supported; gracefully ignore
    }
  };

  // Step 1: Submit Booking & Payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    setStep('processing');

    // Create session object
    const session: ConsultationSession = {
      sessionId: `SES-${Math.floor(100000 + Math.random() * 900000)}`,
      referenceId: `NH-CONS-${Date.now().toString().slice(-6)}`,
      doctor,
      mode: connectMode,
      scheduledDate: connectMode === 'Scheduled Slot' ? selectedDate : undefined,
      scheduledSlot: connectMode === 'Scheduled Slot' ? selectedSlot : undefined,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      symptoms,
      consultationFee: originalFee,
      couponCode: appliedCoupon || undefined,
      discountAmount,
      finalAmount,
      paymentStatus: 'paid',
      paymentTxnId: `TXN-${Date.now().toString().slice(-8)}`,
      paymentMethod,
      doctorNotified: false,
      status: 'checkout',
      createdAt: new Date().toISOString(),
    };
    setActiveSession(session);

    // Simulate Payment Gateway Authorization (1.2 seconds)
    setTimeout(() => {
      if (connectMode === 'Immediate Connect') {
        // Trigger automated Vital Lens pre-call scan prompt
        setStep('vitals_prompt');
      } else {
        // For scheduled slot, go straight to confirmed waiting/schedule room
        finalizeAndEnterWaitingRoom(session, null);
      }
    }, 1200);
  };

  // Launch Camera Auto-Scan
  const handleStartVitalScan = async () => {
    setStep('vitals_scan');
    setScanSecondsElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      // Camera permission denied or not available; proceed with simulated high-accuracy scan
    }
  };

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  };

  // Auto-run 60-second MediaPipe vital scan ticker when on 'vitals_scan'
  const PRE_SCAN_DURATION_SECONDS = 60;
  useEffect(() => {
    if (step !== 'vitals_scan') return;

    const interval = setInterval(() => {
      setScanSecondsElapsed((prev) => {
        const next = prev + 1;
        setLiveBpmTicker(72 + Math.floor(Math.sin(next * 0.35) * 4));
        if (next >= PRE_SCAN_DURATION_SECONDS) {
          clearInterval(interval);
          completeVitalsScan();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Complete Vitals Auto-Scan & Attach to Consultation Payload
  const completeVitalsScan = () => {
    stopCameraStream();

    const vitals: VitalsPayload = {
      heartRate: 74,
      oxygenSaturation: 98,
      bloodPressure: '118/78 mmHg',
      respiratoryRate: 16,
      stressLevel: 'Normal',
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setScannedVitals(vitals);

    if (activeSession) {
      const updatedSession: ConsultationSession = {
        ...activeSession,
        vitals,
        doctorNotified: true,
        status: 'waiting_room',
      };
      setActiveSession(updatedSession);
      finalizeAndEnterWaitingRoom(updatedSession, vitals);
    }
  };

  // Skip Vitals option
  const handleSkipVitals = () => {
    stopCameraStream();
    if (activeSession) {
      const defaultVitals: VitalsPayload = {
        heartRate: 72,
        oxygenSaturation: 99,
        bloodPressure: '120/80 mmHg',
        respiratoryRate: 15,
        stressLevel: 'Normal',
        scannedAt: 'Baseline Presumed',
      };
      setScannedVitals(defaultVitals);
      const updatedSession: ConsultationSession = {
        ...activeSession,
        vitals: defaultVitals,
        doctorNotified: true,
        status: 'waiting_room',
      };
      setActiveSession(updatedSession);
      finalizeAndEnterWaitingRoom(updatedSession, defaultVitals);
    }
  };

  // Enter Waiting Room & Notify Doctor
  const finalizeAndEnterWaitingRoom = (
    session: ConsultationSession,
    vitals: VitalsPayload | null
  ) => {
    setStep('waiting_room');
    setDoctorNotifiedToast(true);
    playDoctorPing();

    // Trigger Automated WhatsApp Message Dispatch with Receipt & Deep Link
    const wa = buildWhatsAppConfirmation(session);
    setWhatsappReceipt(wa);
    setWhatsappDispatchedToast(true);

    const updatedSession: ConsultationSession = {
      ...session,
      whatsappDispatched: true,
      deepLinkUrl: wa.deepLinkAppUrl,
      webVideoUrl: wa.webFallbackUrl,
    };
    setActiveSession(updatedSession);

    if (onConsultationConfirmed) {
      onConsultationConfirmed(updatedSession);
    }

    // Auto-dismiss notification toasts
    setTimeout(() => {
      setDoctorNotifiedToast(false);
    }, 4500);

    setTimeout(() => {
      setWhatsappDispatchedToast(false);
    }, 5500);

    // Simulate doctor accepting the consultation in waiting room after 5 seconds
    setTimeout(() => {
      setDoctorAcceptedCall(true);
      playDoctorPing();
    }, 5500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 relative flex flex-col my-auto">
        {/* ============================================================== */}
        {/* TOP HEADER */}
        {/* ============================================================== */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#008080] flex items-center justify-center shadow-xs">
              <Video className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#008080]">
                {step === 'waiting_room'
                  ? 'Patient Waiting Room'
                  : step === 'vitals_prompt' || step === 'vitals_scan'
                  ? 'Vital Lens™ Pre-Call Check'
                  : 'Tele-Consultation Booking Checkout'}
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#002b49] leading-tight">
                {step === 'waiting_room' ? 'Connecting to Doctor' : `Consultation with ${doctor.name}`}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Notified Toast Popup */}
        {doctorNotifiedToast && (
          <div className="fixed top-6 right-6 z-[11000] bg-[#002b49] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-teal-400 flex items-center gap-3 text-xs sm:text-sm font-bold animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="text-teal-300 font-black text-xs uppercase tracking-wider">
                Doctor Alert Sent
              </div>
              <div>Dr. {doctor.name} has been notified and sent your attached vitals.</div>
            </div>
          </div>
        )}

        {/* WhatsApp Receipt Dispatched Toast Popup */}
        {whatsappDispatchedToast && (
          <div className="fixed top-24 right-6 z-[11000] bg-emerald-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 text-xs sm:text-sm font-bold animate-in slide-in-from-top-3">
            <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-emerald-300 font-black text-xs uppercase tracking-wider">
                WhatsApp Receipt Dispatched
              </div>
              <div>Receipt, appointment slot &amp; video link sent to +91 {patientPhone}.</div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: CHECKOUT FORM & COUPON CALCULATION */}
        {/* ============================================================== */}
        {step === 'form' && (
          <form onSubmit={handleProceedToPayment} className="p-5 sm:p-7 space-y-6">
            {/* Doctor Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/70 to-slate-50 border border-teal-200/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm sm:text-base font-black text-[#002b49] truncate">
                    {doctor.name}
                  </h4>
                  {doctor.isNhealthVerified && (
                    <span className="p-0.5 rounded-full bg-amber-500 text-slate-950" title="Nhealth Verified">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-teal-800 font-bold truncate">
                  {doctor.specialization} · {doctor.degrees}
                </p>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{doctor.hospitalAffiliation}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Standard Fee
                </span>
                <span className="text-lg font-black text-[#002b49]">₹{originalFee}</span>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Consultation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConnectMode('Immediate Connect')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    connectMode === 'Immediate Connect'
                      ? 'border-[#008080] bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      connectMode === 'Immediate Connect'
                        ? 'bg-[#008080] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#002b49] flex items-center gap-1">
                      <span>Immediate Connect</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-[10px] text-teal-800 font-medium">Instant Consultation</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConnectMode('Scheduled Slot')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    connectMode === 'Scheduled Slot'
                      ? 'border-[#008080] bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      connectMode === 'Scheduled Slot'
                        ? 'bg-[#008080] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#002b49]">Schedule Slot</div>
                    <div className="text-[10px] text-slate-500">Pick Date &amp; Time</div>
                  </div>
                </button>
              </div>

              {/* Slot picker if Scheduled Slot is selected */}
              {connectMode === 'Scheduled Slot' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {['Today, 25 Oct', 'Tomorrow, 26 Oct', 'Mon, 27 Oct'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          selectedDate === d
                            ? 'bg-[#002b49] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:30 PM', '07:00 PM'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSlot(s)}
                        className={`py-1.5 px-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          selectedSlot === s
                            ? 'bg-[#008080] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Patient Symptoms & Health Issue */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Patient Basic Symptoms / Health Problem *</span>
                <span className="text-[10px] text-teal-700 font-bold">Shared with Dr. {doctor.name}</span>
              </label>
              <textarea
                rows={2}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. High fever for 2 days, persistent headache, chest discomfort, skin rash..."
                className="w-full text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-slate-900 resize-none shadow-2xs"
              />
            </div>

            {/* Patient Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Patient Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-slate-900"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* COUPON / DISCOUNT CODE & INSTANT CALCULATION */}
            {/* ============================================================== */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Discount / Coupon Code
                  </span>
                </div>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Instant Price Calculation
                </span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-300 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                          {appliedCoupon}
                        </span>
                        <span className="text-emerald-700">Applied</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {AVAILABLE_COUPONS[appliedCoupon]?.label || 'Discount applied'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-700">-₹{discountAmount}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon: NHEALTHLIVE, WELCOME20, VITAL100"
                    className="flex-1 text-xs font-bold px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{couponError}</span>
                </p>
              )}
              {couponSuccess && !appliedCoupon && (
                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{couponSuccess}</span>
                </p>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Payment Method (Instant Gateway)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                  { id: 'Card', label: 'Credit / Debit', desc: 'Visa, Master, RuPay' },
                  { id: 'NetBanking', label: 'NetBanking', desc: 'All Major Banks' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-[#008080] bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#002b49]">{m.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown & Instant Calculation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Doctor Consultation Fee</span>
                <span className="font-semibold text-slate-900">₹{originalFee}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Nhealth Platform &amp; Encryption Fee</span>
                <span className="text-emerald-700 font-bold">FREE (₹0)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm sm:text-base font-black text-[#002b49]">
                <span>Total Amount to Pay</span>
                <span className="text-lg sm:text-xl text-[#008080]">₹{finalAmount}</span>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#008080] to-[#004d40] hover:from-[#006666] hover:to-[#003830] text-white font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {connectMode === 'Immediate Connect'
                  ? `Pay ₹${finalAmount} & Connect Immediately`
                  : `Pay ₹${finalAmount} & Confirm Appointment`}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* PAYMENT PROCESSING ANIMATION */}
        {/* ============================================================== */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-teal-50 border-4 border-teal-500 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-base sm:text-lg font-black text-[#002b49]">
              Authorizing Payment with Bank Gateway...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please wait while your transaction of ₹{finalAmount} is being securely authenticated.
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: PROMPT MODAL - "RECORD VITALS BEFORE CONNECTING" */}
        {/* ============================================================== */}
        {step === 'vitals_prompt' && (
          <div className="p-6 sm:p-8 space-y-6 text-center my-auto">
            {/* Header / Icon */}
            <div className="w-16 h-16 rounded-3xl bg-teal-50 border-2 border-teal-300 text-[#008080] flex items-center justify-center mx-auto shadow-sm">
              <Camera className="w-8 h-8 text-[#008080]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-3 py-1 rounded-full border border-teal-300 inline-block">
                Payment Successful · Ref #{activeSession?.referenceId}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#002b49]">
                Record Vitals Before Connecting
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Nhealth Vital Lens™ (MediaPipe Clinical Scan) allows you to capture your contactless vital signs (Heart Rate, SpO2, Blood Pressure, Respiration) via camera in 60 seconds so Dr. {doctor.name} has your accurate clinical baseline.
              </p>
            </div>

            {/* Perk Badges Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-left max-w-lg mx-auto">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <Heart className="w-4 h-4 text-rose-500 mb-1" />
                <div className="text-xs font-black text-slate-800">Heart Rate</div>
                <div className="text-[10px] text-slate-500">vPPG Pulse</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <Droplet className="w-4 h-4 text-cyan-600 mb-1" />
                <div className="text-xs font-black text-slate-800">Blood Oxygen</div>
                <div className="text-[10px] text-slate-500">SpO2 Level</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <Activity className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-black text-slate-800">BP Estimate</div>
                <div className="text-[10px] text-slate-500">AI Photoplethys</div>
              </div>
            </div>

            {/* Actions: Record Vitals CTA vs Skip */}
            <div className="pt-2 max-w-md mx-auto space-y-2.5">
              <button
                type="button"
                onClick={handleStartVitalScan}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#008080] to-emerald-600 hover:from-[#006666] hover:to-emerald-700 text-white font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera &amp; Record Vitals Now (60s)</span>
              </button>

              <button
                type="button"
                onClick={handleSkipVitals}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Skip &amp; Connect Directly to Waiting Room &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: VITAL LENS AUTO-SCAN CAM VIEW (60-SECOND CLINICAL SCAN) */}
        {/* ============================================================== */}
        {step === 'vitals_scan' && (
          <div className="p-5 sm:p-7 space-y-5 text-center my-auto">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#008080] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#008080] animate-pulse" />
                  <span>MediaPipe Vital Lens™ 60s Clinical Scan</span>
                </span>
                <h4 className="text-base font-black text-[#002b49]">
                  Hold Still · Centered Facial Capture
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-teal-50 text-[#008080] border border-teal-200 px-2.5 py-1 rounded-lg">
                  {scanSecondsElapsed}s / 60s
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {Math.max(0, 60 - scanSecondsElapsed)}s remaining
                </div>
              </div>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-teal-400 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Biometric Face Target Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 rounded-full border-2 border-dashed border-teal-300 animate-pulse flex items-center justify-center">
                  <div className="w-44 h-52 rounded-full border border-teal-400/50" />
                </div>
              </div>

              {/* Pulse Scanner Line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-bounce" />

              {/* Live Ticker Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-teal-500/40 text-left flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                <div>
                  <div className="text-[9px] text-teal-300 uppercase font-black">Live Pulse</div>
                  <div className="text-xs font-mono font-bold">{liveBpmTicker} BPM</div>
                </div>
              </div>

              {/* Progress Ticker Overlay */}
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-teal-500/40 text-right">
                <div className="text-[9px] text-teal-300 uppercase font-black">Analyzing Signal</div>
                <div className="text-xs font-mono font-bold">
                  {Math.min(Math.round((scanSecondsElapsed / 60) * 100), 100)}%
                </div>
              </div>
            </div>

            {/* Progress Bar & Phase Status */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#008080] via-teal-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min((scanSecondsElapsed / 60) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] font-medium text-teal-700">
                  {scanSecondsElapsed < 12
                    ? 'MediaPipe face mesh locked. Calibrating capillary ROI...'
                    : scanSecondsElapsed < 28
                    ? 'Sampling green-channel photoplethysmography (vPPG)...'
                    : scanSecondsElapsed < 44
                    ? 'Measuring Inter-Beat Intervals (IBI) & Heart Rate Variability...'
                    : scanSecondsElapsed < 55
                    ? 'Computing arterial SpO2 & hemodynamic curve...'
                    : 'Finalizing 60s clinical biometric baseline...'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {Math.min(Math.round((scanSecondsElapsed / 60) * 100), 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: PATIENT WAITING ROOM WITH ADS & NOTIFICATION */}
        {/* ============================================================== */}
        {step === 'waiting_room' && (
          <div className="p-5 sm:p-7 space-y-6">
            {/* Status Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-[#002b49] to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-teal-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
                  <Radio className="w-5 h-5 animate-pulse text-teal-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                      Doctor Notified &amp; Online
                    </span>
                    <span className="text-xs font-mono text-teal-200 font-bold">Queue: #1 Priority</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                    Connecting to Doctor, Please Wait...
                  </h4>
                  <p className="text-xs text-teal-100/80">
                    Dr. {doctor.name} is reviewing your symptoms and attached biometric vitals.
                  </p>
                </div>
              </div>

              {doctorAcceptedCall ? (
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoRoomRole('doctor');
                      setIsVideoRoomOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-slate-950" />
                    <span>Join as Doctor (Split Screen)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVideoRoomRole('patient');
                      setIsVideoRoomOpen(true);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/20 transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-teal-300" />
                    <span>Patient Screen</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-teal-200/90 font-mono shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-300" />
                  <span>Wait time: &lt; 45s</span>
                </div>
              )}
            </div>

            {/* WHATSAPP RECEIPT DISPATCH & DEEP LINK CONFIRMATION CARD */}
            {whatsappReceipt && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300/80 shadow-2xs space-y-3 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                          Automated WhatsApp Confirmation Dispatched
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                          Sent to +{whatsappReceipt.recipientPhone}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Payment receipt, appointment slot, and end-to-end encrypted video call links are delivered directly to your WhatsApp.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={whatsappReceipt.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>

                {/* Deep Link Redirection Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Mobile Deep Link: </span>
                      <span className="font-mono text-emerald-800 font-bold">{whatsappReceipt.deepLinkAppUrl}</span>
                      <div className="text-[10px] text-slate-500">
                        Opens Nhealth Mobile App directly if installed, otherwise opens web browser room.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSession) {
                        triggerDeepLinkRedirection(activeSession.sessionId);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008080] font-black text-xs border border-teal-200 shrink-0 cursor-pointer"
                  >
                    Test App Deep Link &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Attached Vitals Display */}
            {scannedVitals && (
              <div className="p-4 rounded-2xl bg-white border border-teal-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#008080]" />
                    <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
                      Attached Pre-Call Vitals Payload
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    Scanned: {scannedVitals.scannedAt}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                    <span className="text-sm font-black text-[#002b49]">{scannedVitals.heartRate} BPM</span>
                    <span className="text-[9.5px] text-emerald-600 font-bold block">Normal</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Oxygen SpO2</span>
                    <span className="text-sm font-black text-[#002b49]">{scannedVitals.oxygenSaturation}%</span>
                    <span className="text-[9.5px] text-emerald-600 font-bold block">Optimal</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                    <span className="text-sm font-black text-[#002b49]">{scannedVitals.bloodPressure}</span>
                    <span className="text-[9.5px] text-emerald-600 font-bold block">Normotensive</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Respiration</span>
                    <span className="text-sm font-black text-[#002b49]">{scannedVitals.respiratoryRate} RPM</span>
                    <span className="text-[9.5px] text-emerald-600 font-bold block">Steady</span>
                  </div>
                </div>
              </div>
            )}

            {/* EMBEDDED WAITING ROOM AD CAROUSEL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>While You Wait: Recommended Health Services</span>
                </span>
                <span className="text-[10px] text-slate-400">Sponsored Carousel</span>
              </div>
              <WaitingRoomAdCarousel
                onCtaClick={(link) => {
                  alert(`Navigating to ${link}... Bookings will be linked to your patient profile.`);
                }}
              />
            </div>

            {/* Session Info Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-700">Session ID: </span>
                <span className="font-mono text-[#002b49]">{activeSession?.sessionId}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-bold text-slate-700">Patient: </span>
                <span>{patientName}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                Leave Waiting Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. DOCTOR & PATIENT END-TO-END ENCRYPTED VIDEO CONSULTATION ROOM */}
      {/* ============================================================== */}
      {isVideoRoomOpen && activeSession && (
        <ConsultationVideoRoom
          session={activeSession}
          isOpen={isVideoRoomOpen}
          initialRole={videoRoomRole}
          onClose={() => setIsVideoRoomOpen(false)}
          onPrescriptionSaved={(updated) => {
            setActiveSession(updated);
            if (onConsultationConfirmed) onConsultationConfirmed(updated);
          }}
        />
      )}
    </div>
  );
};
