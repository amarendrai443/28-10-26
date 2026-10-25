import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  SwitchCamera,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  FileText,
  TestTube2,
  Pill,
  Heart,
  Droplet,
  Activity,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Download,
  AlertCircle,
  Stethoscope,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { ConsultationSession, PrescriptionItem } from '../types/consultationBooking';
import { PatientFeedbackModal } from './PatientFeedbackModal';

interface ConsultationVideoRoomProps {
  session: ConsultationSession;
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'patient' | 'doctor';
  onPrescriptionSaved?: (session: ConsultationSession) => void;
}

export const ConsultationVideoRoom: React.FC<ConsultationVideoRoomProps> = ({
  session,
  isOpen,
  onClose,
  initialRole = 'doctor',
  onPrescriptionSaved,
}) => {
  if (!isOpen) return null;

  // Active view switcher (Doctor vs. Patient) for seamless testing
  const [activeRole, setActiveRole] = useState<'patient' | 'doctor'>(initialRole);

  // AV Call Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Post-Consultation Wrap-up & Feedback Modals
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleEndCall = () => {
    // Safely stop video and audio tracks
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraOn(false);
    setShowCompletionModal(true);

    // Instantly trigger the feedback popup for patient after a brief 1.5s wrap-up intro
    if (activeRole === 'patient') {
      setTimeout(() => {
        setShowFeedbackModal(true);
      }, 1500);
    }
  };

  // Doctor Workspace State
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionItem[]>([
    {
      id: 'med-1',
      name: 'Paracetamol 650mg (Dolo)',
      dosage: '650mg',
      frequency: '1-0-1 (After Meals)',
      duration: '3 Days',
      instructions: 'For fever & headache',
    },
    {
      id: 'med-2',
      name: 'Levocetirizine 5mg',
      dosage: '5mg',
      frequency: '0-0-1 (Night Before Sleep)',
      duration: '5 Days',
      instructions: 'For dry cough & nasal congestion',
    },
  ]);

  // New Medicine input draft
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('1-0-1 (After Food)');
  const [newMedDuration, setNewMedDuration] = useState('5 Days');

  // Lab Tests
  const [labTests, setLabTests] = useState<string[]>([
    'Complete Blood Count (CBC) with ESR',
    'Serum C-Reactive Protein (CRP)',
  ]);
  const [newLabTestInput, setNewLabTestInput] = useState('');

  // Clinical Notes & Diagnosis
  const [clinicalNotes, setClinicalNotes] = useState(
    `Provisional Diagnosis: Acute Viral Upper Respiratory Tract Infection.\nObservations: Mild pharyngeal congestion noted. Patient vitals steady (HR 74 BPM, SpO2 98%). Advised hydration, warm saline gargles, and prescribed symptomatic antipyretic therapy. Review in 3 days if fever persists.`
  );

  const [prescriptionSavedNotice, setPrescriptionSavedNotice] = useState(false);

  // Video Streams
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera stream initialization
  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      if (!isCameraOn) {
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((t) => t.stop());
          cameraStreamRef.current = null;
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (active) {
          cameraStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }
      } catch {
        // Fallback gracefully to simulated video if hardware unavailable
      }
    };

    startCamera();
    return () => {
      active = false;
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [isCameraOn, facingMode]);

  const handleToggleMic = () => setIsMicOn((prev) => !prev);
  const handleToggleCamera = () => setIsCameraOn((prev) => !prev);
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const item: PrescriptionItem = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || 'Standard',
      frequency: newMedFreq,
      duration: newMedDuration,
    };
    setPrescriptionMedicines((prev) => [...prev, item]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptionMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabTestInput.trim()) return;
    setLabTests((prev) => [...prev, newLabTestInput.trim()]);
    setNewLabTestInput('');
  };

  const handleRemoveLabTest = (index: number) => {
    setLabTests((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePrescription = () => {
    const updated: ConsultationSession = {
      ...session,
      prescription: {
        medicines: prescriptionMedicines,
        labTests,
        clinicalNotes,
        issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      status: 'completed',
    };
    if (onPrescriptionSaved) {
      onPrescriptionSaved(updated);
    }
    setPrescriptionSavedNotice(true);
    setTimeout(() => setPrescriptionSavedNotice(false), 4000);
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[12000] bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200"
    >
      {/* ============================================================== */}
      {/* TOP STATUS BAR & ROLE TOGGLE */}
      {/* ============================================================== */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <Lock className="w-3 h-3" />
            <span>E2EE 256-BIT ENCRYPTED</span>
          </div>
          <span className="hidden sm:inline text-xs font-mono text-slate-400">
            Session: #{session.sessionId}
          </span>
        </div>

        {/* Call Timer */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-xs font-mono font-bold text-white border border-slate-700">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>{formatCallTime(callDurationSeconds)}</span>
        </div>

        {/* View Switcher (Doctor vs. Patient) & End Call */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveRole('doctor')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeRole === 'doctor'
                  ? 'bg-[#008080] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Doctor Screen (Split)
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('patient')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeRole === 'patient'
                  ? 'bg-[#008080] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Patient Screen (Clean)
            </button>
          </div>

          <button
            type="button"
            onClick={handleEndCall}
            className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
            title="End Call & Wrap-Up"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Prescription Saved Toast */}
      {prescriptionSavedNotice && (
        <div className="fixed top-18 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>E-Prescription &amp; Clinical Notes Successfully Saved and Dispatched!</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. PATIENT SCREEN: FULL CLEAN IMMERSIVE VIDEO LAYOUT */}
      {/* ============================================================== */}
      {activeRole === 'patient' && (
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-slate-950 overflow-hidden">
          {/* Main Remote Feed (Doctor's Feed) */}
          <div className="relative w-full h-full max-w-5xl rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
            <img
              src={session.doctor.profileImage}
              alt={session.doctor.name}
              className="w-full h-full object-cover filter brightness-95"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Doctor Info Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-left">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1">
                  <span>Dr. {session.doctor.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-[10px] text-teal-300 font-semibold">
                  {session.doctor.specialization} · {session.doctor.hospitalAffiliation}
                </div>
              </div>
            </div>

            {/* PIP Self-View (Patient Camera) */}
            <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-teal-400 shadow-xl">
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px]">
                  <VideoOff className="w-5 h-5 mb-1" />
                  <span>Cam Off</span>
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[9px] font-mono text-white/80 drop-shadow">
                {session.patientName} (You)
              </div>
            </div>

            {/* Vitals Summary Pill on Patient Screen */}
            {session.vitals && (
              <div className="absolute bottom-20 sm:bottom-24 left-4 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{session.vitals.heartRate} BPM</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>{session.vitals.oxygenSaturation}% SpO2</span>
                </span>
              </div>
            )}

            {/* In-Call Floating Control Bar (Clean Layout) */}
            <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3 z-20">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-3.5 sm:p-4 rounded-full transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isMicOn
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-red-600 text-white'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={handleToggleCamera}
                className={`p-3.5 sm:p-4 rounded-full transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isCameraOn
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-red-600 text-white'
                }`}
                title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={handleSwitchCamera}
                className="p-3.5 sm:p-4 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer shadow-lg active:scale-95"
                title="Switch Front/Back Camera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-3.5 sm:py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
                title="End Consultation & Wrap-Up"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DOCTOR SCREEN: SPLIT-SCREEN LAYOUT */}
      {/* Left: Frozen E2EE Video | Right: Scrollable Workspace */}
      {/* ============================================================== */}
      {activeRole === 'doctor' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ========================================================== */}
          {/* LEFT SIDE: FIXED / FROZEN NO-SCROLL E2EE VIDEO CALL */}
          {/* ========================================================== */}
          <div className="w-full lg:w-[48%] xl:w-[45%] bg-slate-950 border-r border-slate-800 p-3 sm:p-4 flex flex-col justify-between shrink-0 h-auto lg:h-full overflow-hidden">
            <div className="relative w-full flex-1 min-h-[260px] sm:min-h-[320px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
              {/* Patient Live Feed Simulation */}
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
                alt={session.patientName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

              {/* Patient Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-left">
                <div className="text-xs font-black text-white">{session.patientName}</div>
                <div className="text-[10px] text-teal-300">
                  {session.patientAge} Yrs · {session.patientGender} · Phone: {session.patientPhone}
                </div>
              </div>

              {/* PIP Doctor Camera Feed */}
              <div className="absolute top-3 right-3 w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-950 border-2 border-teal-400 shadow-md">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-[9px]">
                    Dr. Cam Off
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 text-[8px] font-mono text-white/90">
                  Dr. {session.doctor.name} (You)
                </div>
              </div>

              {/* In-Call Controls for Doctor */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2.5 z-10">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-2.5 rounded-full cursor-pointer ${
                    isMicOn ? 'bg-slate-800/90 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`p-2.5 rounded-full cursor-pointer ${
                    isCameraOn ? 'bg-slate-800/90 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End Session</span>
                </button>
              </div>
            </div>

            {/* REAL-TIME PATIENT SCANNED VITALS (LEFT BOTTOM BAR) */}
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-teal-500/30 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-400" />
                  <span>Real-Time Patient Scanned Vitals (Vital Lens™)</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {session.vitals?.scannedAt || 'Pre-Call Active'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Pulse</div>
                  <div className="text-xs sm:text-sm font-black text-rose-400">
                    {session.vitals?.heartRate || 74} BPM
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">SpO2</div>
                  <div className="text-xs sm:text-sm font-black text-cyan-400">
                    {session.vitals?.oxygenSaturation || 98}%
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Blood Press.</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-400">
                    {session.vitals?.bloodPressure || '118/78'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Resp. Rate</div>
                  <div className="text-xs sm:text-sm font-black text-amber-400">
                    {session.vitals?.respiratoryRate || 16} RPM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT SIDE: SCROLLABLE WORKSPACE */}
          {/* 1. History & Symptoms, 2. Vitals, 3. E-Prescription, */}
          {/* 4. Lab Requisition, 5. Clinical Notes */}
          {/* ========================================================== */}
          <div className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-6 space-y-5 text-left text-slate-200">
            {/* 1. Patient Previous History & Reported Symptoms */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>1. Patient Case Summary &amp; Reported Symptoms</span>
                </h4>
                <span className="text-[10px] font-mono bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  Ref #{session.referenceId}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-white">
                  Chief Complaint: <span className="text-teal-200 font-medium">{session.symptoms || 'Fever, cough & headache.'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Past Medical History: No known chronic hypertension. Non-diabetic. No reported drug allergies.
                </div>
              </div>
            </div>

            {/* 2. E-Prescription Builder */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-400" />
                  <span>2. E-Prescription Builder (Medicines &amp; Dosage)</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  {prescriptionMedicines.length} Medicines Added
                </span>
              </div>

              {/* Medicine List */}
              <div className="space-y-2">
                {prescriptionMedicines.map((med, idx) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-xs font-black text-white flex items-center gap-2">
                        <span>#{idx + 1} {med.name}</span>
                        <span className="text-[10px] font-bold text-teal-400 font-mono bg-teal-950 px-1.5 py-0.5 rounded">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Freq: <strong>{med.frequency}</strong></span>
                        <span>•</span>
                        <span>Duration: <strong>{med.duration}</strong></span>
                        {med.instructions && <span>• {med.instructions}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(med.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Medicine Form */}
              <form onSubmit={handleAddMedicine} className="pt-2 border-t border-slate-700/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">+ Add New Prescription Item</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg / 1 tab)"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="1-0-1 (After Food)">1-0-1 (Morning &amp; Night)</option>
                    <option value="1-0-0 (Morning)">1-0-0 (Morning Only)</option>
                    <option value="0-0-1 (Night)">0-0-1 (Before Bed)</option>
                    <option value="1-1-1 (Thrice a day)">1-1-1 (Thrice a Day)</option>
                    <option value="SOS (When Required)">SOS (When In Pain)</option>
                  </select>

                  <select
                    value={newMedDuration}
                    onChange={(e) => setNewMedDuration(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="3 Days">3 Days</option>
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="10 Days">10 Days</option>
                    <option value="1 Month">1 Month (Chronic)</option>
                  </select>

                  <button
                    type="submit"
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Lab Test Requisition Order Field */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <TestTube2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>3. Lab Diagnostics &amp; Radiology Requisition</span>
                </h4>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {labTests.length} Tests Ordered
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {labTests.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-200 text-xs font-semibold"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabTest(idx)}
                      className="text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddLabTest} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Order Lab Test (e.g. Lipid Profile, Chest X-Ray, HbA1c)..."
                  value={newLabTestInput}
                  onChange={(e) => setNewLabTestInput(e.target.value)}
                  className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Order Test
                </button>
              </form>
            </div>

            {/* 4. Clinical Notes Text Area */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>4. Clinical Diagnosis &amp; Consultation Notes</span>
              </h4>
              <textarea
                rows={4}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter medical observations, provisional diagnosis, diet advice, precautions..."
                className="w-full text-xs font-medium p-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 text-white resize-none leading-relaxed"
              />
            </div>

            {/* Action Bar: Finalize & Dispatch Prescription */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                Signing as <strong>Dr. {session.doctor.name}</strong> ({session.doctor.degrees})
              </div>
              <button
                type="button"
                onClick={handleSavePrescription}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Save &amp; Dispatch Digital E-Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. "CONSULTATION COMPLETED SUCCESSFULLY" POPUP MODAL */}
      {/* ============================================================== */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[13000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 text-slate-800">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-300 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Call Ended &amp; Encrypted Log Closed
              </span>
              <h3 className="text-xl font-black text-[#002b49] leading-tight">
                Consultation Completed Successfully
              </h3>
              <p className="text-xs text-slate-500">
                Your video consultation session with Dr. {session.doctor.name} has concluded safely.
              </p>
            </div>

            {/* Session Stats Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-left space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Doctor:</span>
                <span className="font-black text-slate-900">Dr. {session.doctor.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{session.patientName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Call Duration:</span>
                <span className="font-mono font-bold text-teal-700">{formatCallTime(callDurationSeconds)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Booking Ref ID:</span>
                <span className="font-mono font-bold text-slate-800">{session.referenceId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/80">
                <span className="font-semibold text-slate-500">E-Prescription:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{prescriptionMedicines.length} Medicines Prescribed</span>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              {activeRole === 'patient' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Rate Doctor &amp; Provide Patient Feedback</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Done &amp; Return to Home Portal &rarr;
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Close &amp; Return to Clinic Queue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('patient');
                      setShowFeedbackModal(true);
                    }}
                    className="w-full py-2 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Test Patient Star Rating &amp; Feedback Popup &rarr;</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. PATIENT FEEDBACK MODAL (AUTOMATICALLY TRIGGERED) */}
      {/* ============================================================== */}
      <PatientFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setShowCompletionModal(false);
          onClose();
        }}
        serviceName={`Online Doctor Consultation - Dr. ${session.doctor.name}`}
        patientName={session.patientName}
        defaultCity="Hyderabad"
      />
    </div>
  );
};
