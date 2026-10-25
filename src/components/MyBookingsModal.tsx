import React from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, FileText, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConfirmedBooking } from '../types/serviceBooking';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: ConfirmedBooking[];
  userName: string;
  onBookNew: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  userName,
  onBookNew,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-start bg-black/65 p-4 pt-20 sm:pt-24 pb-8 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100vh-6.5rem)] sm:max-h-[calc(100vh-7.5rem)] flex flex-col p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-left my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#008080]">
              Patient Health Portal
            </div>
            <h3 className="text-xl font-black text-[#002b49] leading-tight">
              My Bookings &amp; Verification History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified records for <strong>{userName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close my bookings modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="overflow-y-auto flex-1 py-4 space-y-3.5 pr-1">
          {bookings.length > 0 ? (
            bookings.map((b, idx) => (
              <div
                key={b.referenceId || idx}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/70 hover:bg-white transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ref #{b.referenceId}
                    </span>
                    <h4 className="font-bold text-[#002b49] text-sm sm:text-base">
                      {b.serviceName}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#008080]" />
                    <span>{b.status || 'Confirmed'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Patient: <strong>{b.patientName}</strong> ({b.age} yrs, {b.gender})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Schedule: <strong>{b.preferredDate}</strong> ({b.preferredTimeSlot.split('(')[0].trim()})</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.address}, {b.city}, {b.state}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Booked on: {new Date(b.bookedAt).toLocaleDateString()}</span>
                  <span className="text-[#008080] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#008080]" />
                    <span>Verified in Health Records</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No bookings found yet</p>
              <p className="text-xs text-slate-500 mt-1">Book any service to track your appointments and reports here.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNew();
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#008080] text-white text-xs font-bold hover:bg-[#006666] cursor-pointer"
              >
                Book a Service Now
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Bookings: {bookings.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
