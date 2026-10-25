import React from 'react';
import { CheckCircle2, Calendar, MapPin, Clock, Phone, User, FileText, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConfirmedBooking } from '../types/serviceBooking';

interface BookingConfirmationModalProps {
  booking: ConfirmedBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onViewHistory?: () => void;
  isLoggedIn: boolean;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  isOpen,
  onClose,
  onViewHistory,
  isLoggedIn,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-start bg-black/65 p-4 pt-20 sm:pt-24 pb-8 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100vh-6.5rem)] sm:max-h-[calc(100vh-7.5rem)] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-left my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close confirmation modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Success Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#008080] flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-7 h-7 text-[#008080]" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#008080]">
              Booking Request Confirmed
            </div>
            <h3 className="text-xl font-black text-[#002b49] leading-tight">
              {booking.serviceName}
            </h3>
          </div>
        </div>

        {/* Reference ID Pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Booking Reference ID
            </span>
            <span className="text-lg font-black text-[#002b49] font-mono tracking-wide">
              {booking.referenceId}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Dispatched</span>
          </span>
        </div>

        {/* Booking Details Summary */}
        <div className="space-y-3 text-xs text-slate-700 bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs mb-5">
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-500">Patient: </span>
              <span className="font-bold text-slate-900">{booking.patientName}</span>
              <span className="text-slate-500"> ({booking.age} yrs, {booking.gender})</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-500">Schedule: </span>
              <span className="font-bold text-slate-900">{booking.preferredDate}</span>
              <span className="text-slate-600 block text-[11px]">{booking.preferredTimeSlot}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-500">Address: </span>
              <span className="font-bold text-slate-900">{booking.address}, {booking.city}, {booking.state}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-500">Contact: </span>
              <span className="font-bold text-slate-900">+91 {booking.phone}</span>
              {booking.whatsapp && <span className="text-emerald-600 ml-2 font-medium">(WhatsApp: +91 {booking.whatsapp})</span>}
            </div>
          </div>
        </div>

        {/* History Status Callout */}
        {booking.isGuest ? (
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 mb-5 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Booked as Guest:</strong> Please keep reference ID <strong>{booking.referenceId}</strong> safe for SMS and phone coordination.
            </span>
          </div>
        ) : (
          <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-3 text-xs text-teal-900 mb-5 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0 mt-0.5" />
            <span>
              <strong>Saved to Your Health Records:</strong> This booking has been saved to your account history for future verification and report tracking.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {isLoggedIn && onViewHistory && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewHistory();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#002b49] hover:bg-[#001d31] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-sm"
            >
              View In My Bookings History
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
