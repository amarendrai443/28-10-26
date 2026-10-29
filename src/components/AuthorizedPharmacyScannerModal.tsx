import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertOctagon,
  KeyRound,
  RotateCcw,
  Stethoscope,
  TestTube2,
  HeartHandshake,
  Car,
  Pill,
  Edit3,
  Minus,
  Plus,
  Send,
  Smartphone,
  CheckCheck,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  AuthorizedPartnerStaff,
  DecryptedTokenPayload,
  SecureHealthToken,
  TokenDepartment,
} from '../types/secureToken';
import {
  validateAndDecryptToken,
  redeemOneTimeToken,
  findTokenById,
  RedemptionResult,
  DEPARTMENT_STAFF_REGISTRY,
  getDepartmentLabel,
} from '../utils/secureQrToken';

interface DispensingMedicineItem {
  name: string;
  prescribedQty: number;
  dispenseQty: number;
  price: number;
}

interface AuthorizedPharmacyScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledTokenId?: string;
  department?: TokenDepartment;
  onTokenRedeemed?: (tokenId: string) => void;
}

export const AuthorizedPharmacyScannerModal: React.FC<AuthorizedPharmacyScannerModalProps> = ({
  isOpen,
  onClose,
  prefilledTokenId = '',
  department = 'pharmacy',
  onTokenRedeemed,
}) => {
  const [activeDepartment, setActiveDepartment] = useState<TokenDepartment>(department);

  useEffect(() => {
    setActiveDepartment(department);
  }, [department]);

  const availableStaff = useMemo(() => {
    return DEPARTMENT_STAFF_REGISTRY[activeDepartment] || DEPARTMENT_STAFF_REGISTRY.pharmacy;
  }, [activeDepartment]);

  const [selectedStaffIndex, setSelectedStaffIndex] = useState(0);
  const [staffPin, setStaffPin] = useState('9449');
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(true);
  const [authError, setAuthError] = useState('');

  const [inputTokenId, setInputTokenId] = useState(prefilledTokenId);
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanErrorResult, setScanErrorResult] = useState<RedemptionResult | null>(null);

  // Advanced Dispensing Lifecycle Workflow Steps:
  // 'scan' -> 'edit_items' -> 'patient_otp' -> 'completed'
  const [dispenseStep, setDispenseStep] = useState<'scan' | 'edit_items' | 'patient_otp' | 'completed'>('scan');

  const [activeToken, setActiveToken] = useState<SecureHealthToken | null>(null);
  const [activePayload, setActivePayload] = useState<DecryptedTokenPayload | null>(null);
  const [dispenseItems, setDispenseItems] = useState<DispensingMedicineItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(true);
  const [lastRedemptionResult, setLastRedemptionResult] = useState<RedemptionResult | null>(null);


  // OTP Verification state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState(false);

  useEffect(() => {
    if (prefilledTokenId) {
      setInputTokenId(prefilledTokenId);
    }
  }, [prefilledTokenId]);

  useEffect(() => {
    setSelectedStaffIndex(0);
  }, [activeDepartment]);

  if (!isOpen) return null;

  const currentStaff: AuthorizedPartnerStaff =
    availableStaff[selectedStaffIndex] || availableStaff[0];

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffPin === '9449' || staffPin === '1234') {
      setIsStaffAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Security PIN. Authorized staff PIN is 9449');
    }
  };

  const handleVerifyAndDecrypt = (tokenToVerify?: string) => {
    const targetToken = (tokenToVerify || inputTokenId).trim();
    if (!targetToken) return;

    setIsProcessing(true);
    setScanErrorResult(null);

    setTimeout(() => {
      // Non-destructive validation & decryption: do NOT immediately redeem the token
      const result = validateAndDecryptToken(targetToken, currentStaff);
      setIsProcessing(false);

      if (!result.success) {
        setScanErrorResult(result);
        setDispenseStep('scan');
        return;
      }

      if (result.token && result.payload) {
        setActiveToken(result.token);
        setActivePayload(result.payload);

        // Normalize approved prescribed medicines
        let initialItems: DispensingMedicineItem[] = [];
        if (result.payload.items && result.payload.items.length > 0) {
          initialItems = result.payload.items.map((it) => ({
            name: it.name,
            prescribedQty: it.quantity,
            dispenseQty: it.quantity,
            price: it.price || 45,
          }));
        } else {
          // Standard clinical prescription template if prescription image was uploaded
          initialItems = [
            { name: 'Amoxicillin + Clavulanate 625mg', prescribedQty: 10, dispenseQty: 10, price: 22 },
            { name: 'Paracetamol 650mg Dolo', prescribedQty: 10, dispenseQty: 10, price: 3.5 },
            { name: 'Pantoprazole Gastro-Resistant 40mg', prescribedQty: 7, dispenseQty: 7, price: 11 },
            { name: 'Cetirizine 10mg Antihistamine', prescribedQty: 10, dispenseQty: 10, price: 4 },
          ];
        }

        setDispenseItems(initialItems);
        setIsEditMode(true);
        setDispenseStep('edit_items');
      }
    }, 600);
  };

  const handleSimulatedCameraScan = () => {
    setIsScanningMode(true);
    setTimeout(() => {
      let foundId = inputTokenId;
      if (!foundId) {
        const stored = findTokenById(prefilledTokenId) || null;
        if (stored) foundId = stored.tokenId;
      }
      setIsScanningMode(false);
      if (foundId) {
        handleVerifyAndDecrypt(foundId);
      }
    }, 1200);
  };

  // Modify / Reduce Quantity logic (Stock Shortage Support)
  const handleUpdateQuantity = (index: number, newQty: number) => {
    setDispenseItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        // Restrict to max prescribedQty and min 0
        const clamped = Math.max(0, Math.min(item.prescribedQty, newQty));
        return { ...item, dispenseQty: clamped };
      })
    );
  };

  // Calculations
  const hasShortage = useMemo(() => {
    return dispenseItems.some((it) => it.dispenseQty < it.prescribedQty);
  }, [dispenseItems]);

  const currentTotalAmount = useMemo(() => {
    return dispenseItems.reduce((acc, curr) => acc + curr.dispenseQty * curr.price, 0);
  }, [dispenseItems]);

  const totalDispensedUnits = useMemo(() => {
    return dispenseItems.reduce((acc, curr) => acc + curr.dispenseQty, 0);
  }, [dispenseItems]);

  // Trigger Patient Approval OTP
  const handleProceedToOtp = () => {
    if (totalDispensedUnits === 0) {
      alert('Cannot dispense 0 units across all items. Please dispense at least 1 medicine.');
      return;
    }

    // Generate random 4-digit OTP (default simulated OTP: 7421)
    const newOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOtp(newOtp);
    setEnteredOtp('');
    setOtpError('');
    setOtpSentNotice(true);
    setDispenseStep('patient_otp');
  };

  // Confirm Dispense upon Patient OTP validation
  const handleVerifyOtpAndDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken) return;

    // Validate OTP against generated OTP or universal simulation PIN
    if (enteredOtp.trim() !== generatedOtp && enteredOtp.trim() !== '7421' && enteredOtp.trim() !== '1234') {
      setOtpError('Invalid OTP. Please enter the 4-digit approval OTP sent to the patient.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    setTimeout(() => {
      // Execute final irreversible token redemption & dispense logging
      const originalManifest = dispenseItems.map((it) => ({
        name: it.name,
        quantity: it.prescribedQty,
        price: it.price,
      }));
      const dispensedManifest = dispenseItems.map((it) => ({
        name: it.name,
        quantity: it.dispenseQty,
        price: it.price,
      }));

      const result = redeemOneTimeToken(activeToken.tokenId, currentStaff, {
        originalItems: originalManifest,
        dispensedItems: dispensedManifest,
        isPartial: hasShortage,
        patientOtpVerified: true,
        totalAmount: currentTotalAmount,
      });

      setIsVerifyingOtp(false);

      if (result.success) {
        setLastRedemptionResult(result);
        if (result.token) {
          setActiveToken(result.token);
        }
        setDispenseStep('completed');
        // Only trigger full invalidation callback if 100% of items are redeemed
        if (onTokenRedeemed && !result.token?.remainingItems?.length) {
          onTokenRedeemed(activeToken.tokenId);
        }
      } else {
        setOtpError(result.message || 'Dispense failed during invalidation.');
      }
    }, 700);
  };

  const handleResetScanner = () => {
    setInputTokenId('');
    setActiveToken(null);
    setActivePayload(null);
    setDispenseItems([]);
    setScanErrorResult(null);
    setEnteredOtp('');
    setGeneratedOtp('');
    setOtpError('');
    setDispenseStep('scan');
  };

  const getDeptIcon = (dept: TokenDepartment) => {
    switch (dept) {
      case 'doctor':
        return <Stethoscope className="w-4 h-4 text-sky-400" />;
      case 'diagnostics':
        return <TestTube2 className="w-4 h-4 text-emerald-400" />;
      case 'nursing':
        return <HeartHandshake className="w-4 h-4 text-rose-400" />;
      case 'ambulance':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'pharmacy':
      default:
        return <Pill className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl text-slate-100 scrollbar-thin my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Authorized Partner Dispensing Hub</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Staff Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Department Decryption, Quantity Verification &amp; OTP Dispense Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close scanner dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Verification Guard */}
        {!isStaffAuthenticated ? (
          <div className="p-8 max-w-md mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <KeyRound className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Staff Authentication Required</h4>
            <p className="text-xs text-slate-400 mb-6">
              Enter authorized personnel PIN to access the prescription decryption &amp; dispensing terminal.
            </p>
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 text-left mb-1">
                  Active Department
                </label>
                <select
                  value={activeDepartment}
                  onChange={(e) => setActiveDepartment(e.target.value as TokenDepartment)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="pharmacy">Pharmacy &amp; Medicines</option>
                  <option value="diagnostics">Lab &amp; Diagnostics</option>
                  <option value="nursing">Nursing &amp; Home Care</option>
                  <option value="doctor">Doctor Consultations</option>
                  <option value="ambulance">Transit &amp; Ambulance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 text-left mb-1">
                  Select Staff Member
                </label>
                <select
                  value={selectedStaffIndex}
                  onChange={(e) => setSelectedStaffIndex(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  {availableStaff.map((p, idx) => (
                    <option key={`staff-opt-${p.staffId}-${idx}`} value={idx}>
                      {p.facilityName} ({p.staffName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 text-left mb-1">
                  Staff Passcode PIN (Demo: 9449)
                </label>
                <input
                  type="password"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 text-center tracking-widest font-mono"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 font-semibold">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#008080] hover:bg-[#006666] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Authenticate &amp; Open Scanner
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Authenticated Staff Signature Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-teal-500/20 rounded-lg">
                  {getDeptIcon(activeDepartment)}
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {currentStaff.facilityName || currentStaff.pharmacyName}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Logged Staff: <strong className="text-slate-200">{currentStaff.staffName}</strong> (License: {currentStaff.licenseNumber})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-lg font-mono font-bold text-[11px] border border-teal-500/30">
                  {getDepartmentLabel(activeDepartment)} Hub
                </span>
                <button
                  onClick={() => setIsStaffAuthenticated(false)}
                  className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
                >
                  Switch
                </button>
              </div>
            </div>

            {/* STEP 1: SCAN OR INPUT QR TOKEN */}
            {dispenseStep === 'scan' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      Scan or Enter Patient QR Token
                    </label>
                    <span className="text-[11px] text-teal-400 font-mono">100% AES Decrypted</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputTokenId}
                      onChange={(e) => setInputTokenId(e.target.value)}
                      placeholder="e.g. NHT-QR-2026-XXXX or NH-Booking ID"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyAndDecrypt()}
                      disabled={isProcessing || !inputTokenId.trim()}
                      className="px-4 py-2.5 bg-[#008080] hover:bg-[#006666] disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      {isProcessing ? 'Decrypting...' : 'Scan & Verify'}
                    </button>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleSimulatedCameraScan}
                      disabled={isScanningMode}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>{isScanningMode ? 'Simulating Optical QR Scan...' : 'Optical Camera Scan Simulation'}</span>
                    </button>

                    {prefilledTokenId && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputTokenId(prefilledTokenId);
                          handleVerifyAndDecrypt(prefilledTokenId);
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Quick fill recent token ({prefilledTokenId})
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Banner if validation failed */}
                {scanErrorResult && (
                  <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 text-slate-200 space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0">
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-300">
                          {scanErrorResult.isDepartmentMismatch
                            ? 'Unauthorized Department QR'
                            : scanErrorResult.alreadyRedeemedAt
                            ? 'Token Already Redeemed & Permanently Expired'
                            : 'Token Decryption Failed'}
                        </h4>
                        <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                          {scanErrorResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PARTNER QR SCAN & EDITABLE QUANTITIES */}
            {dispenseStep === 'edit_items' && activeToken && activePayload && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Patient Summary Card */}
                <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white font-mono">
                        Pass {activeToken.tokenId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        Decrypted &amp; Verified
                      </span>
                    </div>
                    {activeToken.isInsuranceCovered && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        IRDAI Cashless Claim #{activePayload.insuranceClaimId || activeToken.insuranceClaimId}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                      <span className="font-bold text-white text-sm">{activePayload.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Registered Phone</span>
                      <span className="font-mono text-white text-sm">{activePayload.patientPhone}</span>
                    </div>
                    {activePayload.deliveryAddress && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Fulfillment Address</span>
                        <span className="text-slate-300 text-xs">{activePayload.deliveryAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approved List of Prescribed Medicines with Active Edit Option */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-teal-400" />
                      <h4 className="text-sm font-bold text-white">Approved Prescribed Medicines</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasShortage ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Stock Shortage (Partial)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>100% Stock Available</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-teal-300" />
                        <span>{isEditMode ? 'Hide Steppers' : 'Edit Quantities'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stock shortage instructions */}
                  <div className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-[11px] text-slate-300 flex items-center justify-between gap-2">
                    <span className="leading-snug">
                      Adjust quantities below if your pharmacy faces stock shortages. Patient OTP approval is required to confirm modified dispensations.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        // Reset all to full prescribed
                        setDispenseItems((prev) =>
                          prev.map((it) => ({ ...it, dispenseQty: it.prescribedQty }))
                        );
                      }}
                      className="text-teal-400 hover:underline text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Items list with quantity modifiers */}
                  <div className="divide-y divide-slate-700/60 space-y-2">
                    {dispenseItems.map((item, idx) => {
                      const isShort = item.dispenseQty < item.prescribedQty;
                      const isOutOfStock = item.dispenseQty === 0;

                      return (
                        <div
                          key={`dispense-item-${item.name}-${idx}`}
                          className={`pt-2.5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl px-2 transition ${
                            isOutOfStock
                              ? 'bg-rose-950/20 text-slate-400'
                              : isShort
                              ? 'bg-amber-950/20 text-slate-200'
                              : 'bg-transparent text-slate-200'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {item.name}
                              </span>
                              {isOutOfStock ? (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold uppercase border border-rose-500/30">
                                  Out of Stock
                                </span>
                              ) : isShort ? (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase border border-amber-500/30">
                                  Reduced ({item.dispenseQty}/{item.prescribedQty})
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase border border-emerald-500/30">
                                  Full ({item.prescribedQty})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>Prescribed: <strong className="text-slate-300">{item.prescribedQty} units</strong></span>
                              <span>•</span>
                              <span>₹{item.price.toFixed(2)}/unit</span>
                            </div>
                          </div>

                          {/* Editable Quantities Control */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(idx, item.dispenseQty - 1)}
                                disabled={item.dispenseQty <= 0}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer active:scale-95 transition"
                                title="Reduce dispensing quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="number"
                                min={0}
                                max={item.prescribedQty}
                                value={item.dispenseQty}
                                onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value) || 0)}
                                className="w-12 text-center text-xs font-bold text-white bg-transparent focus:outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(idx, item.dispenseQty + 1)}
                                disabled={item.dispenseQty >= item.prescribedQty}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer active:scale-95 transition"
                                title="Increase dispensing quantity up to prescribed limit"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right min-w-[70px]">
                              <span className="text-xs font-bold text-emerald-400 block">
                                ₹{(item.dispenseQty * item.price).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Dispensing {item.dispenseQty}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & Value */}
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Total Items to Dispense: </span>
                      <strong className="text-white">{totalDispensedUnits} units</strong>
                      {hasShortage && (
                        <span className="text-amber-400 ml-1.5 font-bold text-[11px]">
                          (Stock Shortage Modified)
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase">Final Dispense Total</span>
                      <span className="text-base font-black text-emerald-400">
                        ₹{currentTotalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Proceed to Patient OTP */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetScanner}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Back to Scan
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToOtp}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#008080] to-[#006666] hover:from-[#006666] hover:to-[#004d4d] text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
                  >
                    <span>Confirm Dispense (Request Patient OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PATIENT DISPENSE APPROVAL OTP */}
            {dispenseStep === 'patient_otp' && activeToken && activePayload && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-teal-400" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">Patient Dispense Approval OTP</h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                      A 4-digit verification code has been dispatched to patient <strong>{activePayload.patientName}</strong> at registered mobile number <strong>{activePayload.patientPhone}</strong>.
                    </p>
                  </div>

                  {/* Simulated SMS Alert Banner */}
                  <div className="bg-teal-950/40 border border-teal-500/40 rounded-xl p-3 text-left space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-teal-300">
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3 h-3 text-teal-400" /> Patient SMS / WhatsApp Dispatch
                      </span>
                      <span className="text-[10px] text-teal-400 uppercase font-mono">Simulated Sandbox</span>
                    </div>
                    <p className="text-xs text-slate-200 font-mono">
                      "Nhealth Dispense Verification: Your code is <strong className="text-emerald-400 text-sm">{generatedOtp}</strong>. Share with the pharmacy partner to approve dispensation of {totalDispensedUnits} units."
                    </p>
                  </div>

                  {/* Summary of what is being approved */}
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>Dispense Type:</span>
                      <span className={hasShortage ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {hasShortage ? 'Partial Dispense (Stock Shortage)' : 'Full Dispense (All Prescribed)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Approved Amount:</span>
                      <span className="text-white font-bold">₹{currentTotalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* OTP Input Form */}
                  <form onSubmit={handleVerifyOtpAndDispense} className="space-y-4 max-w-xs mx-auto pt-2">
                    <div>
                      <input
                        type="text"
                        autoFocus
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Enter 4-Digit OTP"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-teal-400 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white text-center tracking-[0.3em] focus:outline-none"
                      />
                    </div>

                    {otpError && (
                      <p className="text-xs text-rose-400 font-semibold">{otpError}</p>
                    )}

                    <div className="space-y-2">
                      <button
                        type="submit"
                        disabled={isVerifyingOtp || !enteredOtp.trim()}
                        className="w-full py-3 bg-[#008080] hover:bg-[#006666] disabled:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md active:scale-95"
                      >
                        {isVerifyingOtp ? 'Verifying & Completing...' : 'Verify OTP & Authorize Dispense'}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setDispenseStep('edit_items')}
                          className="text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Modify Quantities
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
                            setGeneratedOtp(newOtp);
                            setEnteredOtp('');
                            setOtpError('');
                            alert(`New OTP sent to patient: ${newOtp}`);
                          }}
                          className="text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* STEP 4: COMPLETED DISPENSE & SPLIT REDEMPTION / FULL INVALIDATION */}
            {dispenseStep === 'completed' && activeToken && (
              <div className="p-6 bg-emerald-950/30 border border-emerald-800/60 rounded-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCheck className="w-7 h-7 text-emerald-400" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-emerald-300">
                    {hasShortage && lastRedemptionResult?.token?.remainingItems?.length
                      ? 'Partial Dispense Confirmed — QR Pass Remains Active'
                      : '100% Prescribed Medicines Fully Redeemed!'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                    {hasShortage && lastRedemptionResult?.token?.remainingItems?.length
                      ? `Patient approval OTP verified. Patient's QR pass ${activeToken.tokenId} remains ACTIVE so they can redeem the remaining items later within the 3-day (72-hour) validity window.`
                      : `Patient approval OTP verified. All prescribed items have been fully redeemed across redemptions. QR pass ${activeToken.tokenId} is now permanently Used / Expired.`}
                  </p>
                </div>

                {/* Remaining items banner if partial split redemption */}
                {hasShortage && lastRedemptionResult?.token?.remainingItems && lastRedemptionResult.token.remainingItems.length > 0 && (
                  <div className="p-3.5 bg-teal-950/60 border border-teal-500/40 rounded-2xl text-left text-xs space-y-2">
                    <div className="flex items-center justify-between text-teal-300 font-bold border-b border-teal-800/40 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-teal-400" /> Remaining Balance for Patient's Next Scan:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-200 text-[10px] uppercase font-mono">
                        Active for 72h
                      </span>
                    </div>
                    <div className="divide-y divide-teal-800/40">
                      {lastRedemptionResult.token.remainingItems.map((rem, idx) => (
                        <div key={`rem-${rem.name}-${idx}`} className="py-1.5 flex justify-between text-slate-200">
                          <span>{rem.name}</span>
                          <strong className="text-teal-300 font-mono">{rem.quantity} units remaining</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-left text-xs space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Dispensation Status:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {hasShortage && lastRedemptionResult?.token?.remainingItems?.length
                        ? 'Partial Dispense (Active QR Retained)'
                        : '100% Full Dispense (Permanently Expired)'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Patient Name:</span>
                    <span className="text-white font-bold">{activePayload?.patientName}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Authorized Facility:</span>
                    <span className="text-white font-medium">{currentStaff.facilityName}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Staff Attendant:</span>
                    <span className="text-slate-200">{currentStaff.staffName} ({currentStaff.staffId})</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1 font-bold text-[10px] uppercase">
                      Dispensed Items Log:
                    </span>
                    <div className="space-y-1">
                      {dispenseItems.map((it, idx) => (
                        <div key={`completed-item-${it.name}-${idx}`} className="flex justify-between text-[11px]">
                          <span className="text-slate-300">
                            {it.name} (Dispensed: <strong className="text-white">{it.dispenseQty}</strong> of {it.prescribedQty})
                          </span>
                          <span className="text-emerald-400 font-bold">
                            ₹{(it.dispenseQty * it.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-xs">
                    <span className="text-white">Total Value Logged:</span>
                    <span className="text-emerald-400 text-sm">₹{currentTotalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetScanner}
                  className="px-6 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Next Token</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AuthorizedDepartmentScannerModal = AuthorizedPharmacyScannerModal;
