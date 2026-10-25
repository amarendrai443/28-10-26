import React from 'react';
import { AlertTriangle, LogIn, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface GuestWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRedirect: () => void;
  onProceedGuest: () => void;
  serviceName?: string;
}

export const GuestWarningModal: React.FC<GuestWarningModalProps> = ({
  isOpen,
  onClose,
  onLoginRedirect,
  onProceedGuest,
  serviceName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="warning-modal-title"
      aria-describedby="warning-modal-desc"
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-start bg-black/65 p-4 pt-20 sm:pt-24 pb-8 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[calc(100vh-6.5rem)] sm:max-h-[calc(100vh-7.5rem)] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-amber-200 relative animate-in zoom-in-95 duration-200 text-center my-auto">
        {/* Subtle Ambient Top Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

        {/* Close icon button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close warning modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon with Amber Glow */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 mt-2 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        {/* Title */}
        <h3 id="warning-modal-title" className="text-xl font-black text-[#002b49] tracking-tight">
          Guest Booking Notice
        </h3>

        {/* Service context if available */}
        {serviceName && (
          <p className="text-xs font-semibold text-[#008080] mt-1 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-100">
            Booking: {serviceName}
          </p>
        )}

        {/* Strictly Defined Warning Text from Prompt */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 my-5 text-left flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p id="warning-modal-desc" className="text-sm font-semibold text-amber-950 leading-relaxed">
            Services booked without login cannot be saved in history for future verification.but still you can see the details in whatsapp updates. 
          </p>
        </div>

        {/* Action Buttons Container */}
        <div className="space-y-3 pt-1">
          {/* Strictly Defined Primary Call-To-Action Button */}
          <button
            type="button"
            onClick={onLoginRedirect}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#002b49] hover:bg-[#001d31] text-white font-extrabold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer group"
          >
            <LogIn className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
            <span>Please login for great experience</span>
          </button>

          {/* Strictly Defined Secondary Text/Button Link */}
          <button
            type="button"
            onClick={onProceedGuest}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-600 hover:text-[#008080] hover:underline transition-colors cursor-pointer"
          >
            <span>Proceed without login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
          Logging in allows you to download authenticated lab reports, track dispatched clinicians, and manage appointments.
        </p>
      </div>
    </div>
  );
};
