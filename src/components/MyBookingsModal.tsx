import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  User,
  ShieldCheck,
  QrCode,
  Filter,
} from 'lucide-react';
import { ConfirmedBooking } from '../types/serviceBooking';
import { SecureQrTokenCard } from './SecureQrTokenCard';
import { SecureHealthToken } from '../types/secureToken';
import {
  findTokenById,
  createOneTimeSecureToken,
  resolveDepartment,
  getDepartmentLabel,
} from '../utils/secureQrToken';

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
  const [selectedPassToken, setSelectedPassToken] = useState<SecureHealthToken | null>(null);
  const [qrFilter, setQrFilter] = useState<'all' | 'active' | 'used'>('all');

  const isBookingQrUsed = (b: ConfirmedBooking) => {
    const token = findTokenById(b.secureTokenId || b.referenceId);
    const tokenTime = token ? new Date(token.createdAt).getTime() : new Date(b.bookedAt || Date.now()).getTime();
    const isOver72Hours = !isNaN(tokenTime) && Date.now() - tokenTime > 72 * 60 * 60 * 1000;
    return (
      b.qrStatus === 'used' ||
      b.status === 'Used / Expired' ||
      token?.status === 'redeemed' ||
      token?.status === 'expired' ||
      isOver72Hours
    );
  };

  const activeCount = useMemo(
    () => bookings.filter((b) => !isBookingQrUsed(b)).length,
    [bookings]
  );
  const usedCount = useMemo(
    () => bookings.filter((b) => isBookingQrUsed(b)).length,
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    if (qrFilter === 'active') return bookings.filter((b) => !isBookingQrUsed(b));
    if (qrFilter === 'used') return bookings.filter((b) => isBookingQrUsed(b));
    return bookings;
  }, [bookings, qrFilter]);

  if (!isOpen) return null;

  const handleOpenPass = (b: ConfirmedBooking) => {
    const existing = findTokenById(b.secureTokenId || b.referenceId);
    if (existing) {
      setSelectedPassToken(existing);
      return;
    }

    const isInsurance = !!b.insuranceClaim;
    const dept = resolveDepartment('general_service', b.serviceName);
    const token = createOneTimeSecureToken(
      b.referenceId,
      'general_service',
      b.serviceName,
      {
        patientName: b.patientName,
        patientPhone: b.phone,
        deliveryAddress: `${b.address}, ${b.city}, ${b.state}`,
        totalAmount: isInsurance ? 0 : 499,
        notes: `Age: ${b.age}, Gender: ${b.gender}. Slot: ${b.preferredDate} (${b.preferredTimeSlot})`,
        insuranceClaimId: b.insuranceClaim?.claimId,
        insuranceCompany: b.insuranceClaim?.insuranceCompany,
      },
      isInsurance,
      b.insuranceClaim?.claimId,
      dept
    );
    if (b.qrStatus === 'used' || b.status === 'Used / Expired') {
      token.status = 'redeemed';
      token.redeemedAt = new Date().toISOString();
    }
    setSelectedPassToken(token);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-3 sm:p-4 md:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col p-5 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-left my-auto overflow-hidden scrollbar-thin"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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

          {/* Quick Filter Dropdown */}
          <div className="py-2.5 px-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#008080]" />
              <label htmlFor="qr-token-filter" className="text-xs font-bold text-slate-700">
                Filter QR Tokens:
              </label>
              <select
                id="qr-token-filter"
                value={qrFilter}
                onChange={(e) => setQrFilter(e.target.value as 'all' | 'active' | 'used')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080] cursor-pointer shadow-2xs"
              >
                <option value="all">All ({bookings.length})</option>
                <option value="active">Active ({activeCount})</option>
                <option value="used">Used/Expired ({usedCount})</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong>
            </div>
          </div>

          {/* Bookings List */}
          <div className="overflow-y-auto flex-1 py-4 space-y-3.5 pr-1">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b, idx) => {
                const token = findTokenById(b.secureTokenId || b.referenceId);
                const tokenTime = token ? new Date(token.createdAt).getTime() : new Date(b.bookedAt || Date.now()).getTime();
                const isOver72Hours = !isNaN(tokenTime) && Date.now() - tokenTime > 72 * 60 * 60 * 1000;
                const isQrUsed =
                  b.qrStatus === 'used' ||
                  b.status === 'Used / Expired' ||
                  token?.status === 'redeemed' ||
                  token?.status === 'expired' ||
                  isOver72Hours;
                const isPartialBalance = !isQrUsed && token?.status === 'partial';
                const categoryLabel =
                  b.serviceCategory ||
                  getDepartmentLabel(resolveDepartment('general_service', b.serviceName));
                const bookedDate = new Date(b.bookedAt || Date.now());
                const formattedDate = bookedDate.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = bookedDate.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <div
                    key={b.referenceId || idx}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/80 hover:bg-white transition-all space-y-2.5 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-[#002b49] bg-slate-200/70 px-2 py-0.5 rounded-md">
                            Ref #{b.referenceId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#002b49]/10 text-[#002b49] border border-[#002b49]/20">
                            {categoryLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-[#008080]" />
                            <span>{b.status || 'Confirmed'}</span>
                          </span>

                          {/* QR Expiration & Status Display */}
                          {isQrUsed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>QR Used / Expired</span>
                            </span>
                          ) : isPartialBalance ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                              <span>QR Partial (Active)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>QR Active (72h)</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-[#002b49] text-sm sm:text-base">
                          {b.serviceName}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenPass(b)}
                        className="px-3 py-1.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                        title="Re-check encrypted QR pass & token"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR Pass</span>
                      </button>
                    </div>

                    {/* Insurance Claim Details */}
                    {b.insuranceClaim && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">
                          Claim #{b.insuranceClaim.claimId} • {b.insuranceClaim.insuranceCompany} (Cashless Pre-Auth Verified)
                        </span>
                      </div>
                    )}

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

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Booked on: {formattedDate} at {formattedTime}</span>
                      </div>
                      <span className="text-[#008080] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#008080]" />
                        <span>Verified in Health Records</span>
                      </span>
                    </div>
                  </div>
                );
              })
            ) : bookings.length > 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  No {qrFilter === 'active' ? 'Active' : 'Used / Expired'} bookings found
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You currently have no bookings matching the selected filter.
                </p>
                <button
                  type="button"
                  onClick={() => setQrFilter('all')}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Show All ({bookings.length})
                </button>
              </div>
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

      {/* Re-check QR Pass Modal */}
      {selectedPassToken && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPassToken(null)}
          className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 text-left my-auto space-y-3 scrollbar-thin"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#008080] flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-[#008080]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#002b49]">Healthcare Security Pass</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Re-check &amp; verify booking token</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPassToken(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close QR Pass"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SecureQrTokenCard token={selectedPassToken} />
          </div>
        </div>
      )}
    </>
  );
};
