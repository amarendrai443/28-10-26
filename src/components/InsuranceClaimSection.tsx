import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building2,
  Phone,
  Hash,
  Sparkles,
  ArrowRight,
  RotateCcw,
  KeyRound,
  Check,
  Lock,
} from 'lucide-react';
import {
  InsuranceClaimDetails,
  InsurancePaymentOption,
  POPULAR_INSURANCE_COMPANIES,
} from '../types/insurance';

export interface InsuranceClaimSectionProps {
  amount?: number;
  serviceOrProductName?: string;
  serviceTitle?: string;
  defaultPhone?: string;
  patientPhone?: string;
  defaultName?: string;
  selectedOption: InsurancePaymentOption;
  onChangeOption: (option: InsurancePaymentOption) => void;
  onClaimConfirmed: (claimDetails: InsuranceClaimDetails) => void;
  isCompact?: boolean;
  isLoggedIn?: boolean;
  onPromptLogin?: () => void;
}

export const InsuranceClaimSection: React.FC<InsuranceClaimSectionProps> = ({
  amount = 0,
  serviceOrProductName,
  serviceTitle,
  defaultPhone = '',
  patientPhone,
  defaultName = '',
  selectedOption,
  onChangeOption,
  onClaimConfirmed,
  isCompact = false,
  isLoggedIn = true,
  onPromptLogin,
}) => {
  const effectiveProductName = serviceTitle || serviceOrProductName || 'Healthcare Service';
  const effectivePhone = patientPhone || defaultPhone || '';

  // Enforce guest restriction: If user is not logged in, force selection to pay_now
  useEffect(() => {
    if (!isLoggedIn && selectedOption === 'claim_insurance') {
      onChangeOption('pay_now');
    }
  }, [isLoggedIn, selectedOption, onChangeOption]);

  // Form fields
  const [policyNumber, setPolicyNumber] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState<string>(POPULAR_INSURANCE_COMPANIES[0]);
  const [customCompany, setCustomCompany] = useState('');
  const [registeredMobile, setRegisteredMobile] = useState(effectivePhone);

  // Validation & OTP state
  const [validationState, setValidationState] = useState<
    'idle' | 'validating' | 'validated' | 'otp_step' | 'verifying_otp' | 'verified'
  >('idle');
  const [validationProgressMessage, setValidationProgressMessage] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('4921');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  // Sync default phone
  useEffect(() => {
    if (defaultPhone && !registeredMobile) {
      setRegisteredMobile(defaultPhone);
    }
  }, [defaultPhone]);

  // Resend OTP countdown
  useEffect(() => {
    let interval: any;
    if (validationState === 'otp_step' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [validationState, resendTimer]);

  // Simulate API Validation with Insurance TPA Network
  const handleValidateInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim() || !registeredMobile.trim()) {
      alert('Please provide your policy number and registered mobile number.');
      return;
    }

    setValidationState('validating');
    setValidationProgressMessage('Pinging National Insurance TPA Gateway (ABHA / IRDAI)...');

    setTimeout(() => {
      setValidationProgressMessage(`Verifying coverage with ${insuranceCompany === 'Other Empaneled TPA Provider' ? customCompany || 'TPA' : insuranceCompany}...`);
    }, 600);

    setTimeout(() => {
      setValidationProgressMessage('Pre-Authorization Approved: Cashless Domiciliary & OPD Care Confirmed.');
    }, 1200);

    setTimeout(() => {
      const demoOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedOtp(demoOtp);
      setValidationState('otp_step');
      setResendTimer(30);
    }, 1800);
  };

  // Verify OTP to Confirm Claim
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      setOtpError('Please enter the verification OTP.');
      return;
    }

    // In demo environment, accept entered OTP or default demo code
    setValidationState('verifying_otp');
    setOtpError(null);

    setTimeout(() => {
      const finalClaim: InsuranceClaimDetails = {
        policyNumber: policyNumber.trim().toUpperCase(),
        insuranceCompany: insuranceCompany === 'Other Empaneled TPA Provider' ? (customCompany || 'Empaneled TPA') : insuranceCompany,
        registeredMobile: registeredMobile.trim(),
        claimId: `CLM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        preAuthAmount: amount > 0 ? amount : 1500,
        approvalStatus: 'Approved',
        approvalTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        otpVerified: true,
      };

      setValidationState('verified');
      onClaimConfirmed(finalClaim);
    }, 800);
  };

  const handleResendOtp = () => {
    const demoOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOtp(demoOtp);
    setResendTimer(30);
    setOtpError(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. PAYMENT & INSURANCE TOGGLE SELECTOR */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Payment &amp; Billing Option
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Option A: Pay & Proceed */}
          <button
            type="button"
            onClick={() => {
              onChangeOption('pay_now');
              setValidationState('idle');
            }}
            className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
              selectedOption === 'pay_now'
                ? 'border-[#002b49] bg-slate-900 text-white shadow-md ring-2 ring-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${selectedOption === 'pay_now' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold leading-tight">Pay &amp; Proceed</p>
              <p className={`text-[10px] mt-0.5 ${selectedOption === 'pay_now' ? 'text-slate-300' : 'text-slate-500'}`}>
                UPI, Cards, NetBanking or Cash on Delivery
              </p>
            </div>
          </button>

          {/* Option B: Claim with Insurance */}
          <button
            type="button"
            disabled={!isLoggedIn}
            onClick={() => {
              if (!isLoggedIn) return;
              onChangeOption('claim_insurance');
            }}
            className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
              !isLoggedIn
                ? 'border-slate-200 bg-slate-100/90 text-slate-400 cursor-not-allowed opacity-80'
                : selectedOption === 'claim_insurance'
                ? 'border-teal-600 bg-teal-900 text-white shadow-md ring-2 ring-teal-500/50 cursor-pointer'
                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500/40 hover:bg-teal-50/20 cursor-pointer'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                !isLoggedIn
                  ? 'bg-slate-200 text-slate-500'
                  : selectedOption === 'claim_insurance'
                  ? 'bg-teal-500/30 text-teal-300'
                  : 'bg-teal-50 text-teal-700'
              }`}
            >
              {!isLoggedIn ? <Lock className="w-4 h-4 text-slate-500" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="text-xs sm:text-sm font-extrabold leading-tight">Claim with Insurance</p>
                {!isLoggedIn ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    LOGGED-IN ONLY
                  </span>
                ) : (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      selectedOption === 'claim_insurance' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    CASHLESS
                  </span>
                )}
              </div>
              <p
                className={`text-[10px] mt-0.5 ${
                  !isLoggedIn ? 'text-slate-500' : selectedOption === 'claim_insurance' ? 'text-teal-200' : 'text-slate-500'
                }`}
              >
                {!isLoggedIn
                  ? 'Sign in to link policy & claim cashless care'
                  : 'Instant pre-auth & zero payment gateway bypass'}
              </p>
            </div>
          </button>
        </div>

        {/* Guest Mode Restriction Warning Banner */}
        {!isLoggedIn && (
          <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5 sm:mt-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 leading-snug">
                  Cashless Insurance Claims Require Account Login
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Guest Mode restricts cashless pre-authorization. Log in or create a free patient account to claim insurance.
                </p>
              </div>
            </div>
            {onPromptLogin && (
              <button
                type="button"
                onClick={onPromptLogin}
                className="px-3.5 py-1.5 rounded-xl bg-[#002b49] hover:bg-[#003e6b] text-white text-xs font-bold shrink-0 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Log In / Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. DYNAMIC INSURANCE CLAIM INPUTS & OTP FLOW */}
      {selectedOption === 'claim_insurance' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-slate-50 to-teal-50/40 border border-teal-200 space-y-4 animate-in fade-in duration-200 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#002b49]">
                  Cashless Insurance Claim Pre-Authorization
                </h4>
                <p className="text-[11px] text-teal-800">
                  Direct TPA cashless settlement for {effectiveProductName}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
              IRDAI Compliant
            </span>
          </div>

          {/* STATE A: Initial Policy Details Entry Form */}
          {validationState === 'idle' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Health Insurance Provider / TPA <span className="text-red-500">*</span>
                </label>
                <select
                  value={insuranceCompany}
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {POPULAR_INSURANCE_COMPANIES.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {insuranceCompany === 'Other Empaneled TPA Provider' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Provider Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. Medi Assist / Vidal Health TPA"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Policy / Member ID Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. POL-88921-STAR"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm uppercase font-mono rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={registeredMobile}
                      onChange={(e) => setRegisteredMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-teal-100 flex items-start gap-2 text-[11px] text-slate-600">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Validating your policy verifies pre-authorization cashless eligibility. No payment gateway charge will be levied to your card or UPI.
                </span>
              </div>

              <button
                type="button"
                onClick={handleValidateInsurance}
                disabled={!policyNumber.trim() || !registeredMobile.trim()}
                className="w-full py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Validate Policy &amp; Request Cashless Pre-Auth</span>
              </button>
            </div>
          )}

          {/* STATE B: API Validation in Progress */}
          {validationState === 'validating' && (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-[#002b49] animate-pulse">
                {validationProgressMessage}
              </p>
              <p className="text-[11px] text-slate-500">
                Bypassing standard gateway · Negotiating direct electronic pre-authorization
              </p>
            </div>
          )}

          {/* STATE C: OTP Step (Triggered after successful validation) */}
          {validationState === 'otp_step' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Policy Verified: 100% Cashless Coverage Approved!</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Pre-auth generated for {registeredMobile}.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded text-emerald-800 border border-emerald-200">
                  Demo OTP: {generatedOtp}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Enter 4-Digit Security OTP sent to {registeredMobile} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value);
                        if (otpError) setOtpError(null);
                      }}
                      placeholder={`Enter OTP (${generatedOtp})`}
                      className="w-full px-3.5 py-2.5 text-center font-mono font-bold tracking-widest text-base rounded-xl border border-teal-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setEnteredOtp(generatedOtp)}
                    className="px-3 py-2.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-bold cursor-pointer shrink-0"
                    title="Auto-fill Demo OTP"
                  >
                    Auto-Fill
                  </button>
                </div>

                {otpError && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {resendTimer > 0 ? (
                    `Resend code in ${resendTimer}s`
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-teal-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </span>
                <span className="text-slate-400">Payment Gateway Bypassed</span>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Verify OTP &amp; Confirm Cashless Booking</span>
              </button>
            </div>
          )}

          {/* STATE D: Verifying OTP */}
          {validationState === 'verifying_otp' && (
            <div className="py-5 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                Authorizing Cashless Claim &amp; Locking Reservation...
              </p>
            </div>
          )}

          {/* STATE E: Verified & Approved */}
          {validationState === 'verified' && (
            <div className="p-3.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-center space-y-1">
              <p className="text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Insurance Authorization Confirmed!</span>
              </p>
              <p className="text-[11px] text-emerald-800">
                Cashless Claim ID generated. Direct gateway bypass complete.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
