import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Video,
  Calendar,
  CheckCircle2,
  Phone,
  Award,
  Globe,
  Radio,
  Sparkles,
} from 'lucide-react';
import { EmpaneledDoctor } from '../types/doctorFinder';
import {
  isDoctorAvailable,
  setDoctorAvailability,
  DOCTOR_AVAILABILITY_EVENT,
} from '../utils/doctorAvailabilityStore';

interface DoctorProfileModalProps {
  doctor: EmpaneledDoctor | null;
  onClose: () => void;
  onBookImmediate: (doctor: EmpaneledDoctor) => void;
  onScheduleSlot: (doctor: EmpaneledDoctor, date: string, timeSlot: string) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  onClose,
  onBookImmediate,
  onScheduleSlot,
}) => {
  if (!doctor) return null;

  // Real-time status state synced via doctorAvailabilityStore
  const [isAvailable, setIsAvailable] = useState<boolean>(() =>
    isDoctorAvailable(doctor.id, doctor.isAvailableNow ?? true)
  );

  // Scheduling state for when Doctor is OFF
  const dates = [
    { label: 'Today', date: 'Today, 25 Oct' },
    { label: 'Tomorrow', date: 'Tomorrow, 26 Oct' },
    { label: 'Mon, 27 Oct', date: 'Mon, 27 Oct' },
  ];
  const timeSlots = [
    '09:30 AM',
    '11:00 AM',
    '02:00 PM',
    '03:30 PM',
    '05:30 PM',
    '07:00 PM',
  ];
  const [selectedDate, setSelectedDate] = useState(dates[0].date);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Listen to availability events in real-time
  useEffect(() => {
    const handleAvailabilityChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ doctorId: string; isAvailable: boolean }>;
      if (customEvent.detail.doctorId === 'all' || customEvent.detail.doctorId === doctor.id) {
        setIsAvailable(customEvent.detail.isAvailable);
      }
    };

    window.addEventListener(DOCTOR_AVAILABILITY_EVENT, handleAvailabilityChange);
    return () => {
      window.removeEventListener(DOCTOR_AVAILABILITY_EVENT, handleAvailabilityChange);
    };
  }, [doctor.id]);

  const isBadged = doctor.isNhealthBadged !== false && doctor.isNhealthVerified;

  const handleToggleDoctorStatus = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    setDoctorAvailability(doctor.id, nextState);
    setActionNotice(
      nextState
        ? 'Real-Time Sync: Doctor status is now LIVE! "Immediate Connect" is active.'
        : 'Real-Time Sync: Doctor status set to OFFLINE. "Schedule Time Slot" grid active.'
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleConnectNow = () => {
    onBookImmediate(doctor);
  };

  const handleConfirmSchedule = () => {
    onScheduleSlot(doctor, selectedDate, selectedSlot);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 relative flex flex-col">
        {/* Top Header Bar with Close Button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Doctor Clinical Profile
            </span>
            {isBadged ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
                <span>Nhealth Badged (Verified)</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Empaneled Specialist
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Notification Bar if status just flipped */}
        {actionNotice && (
          <div className="bg-[#002b49] text-white text-xs px-5 py-2 font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        <div className="p-5 sm:p-7 space-y-6">
          {/* Main Info Section */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-100 border-2 shadow-md ${
                  isBadged ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-200'
                }`}
              >
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
              {isBadged && (
                <div
                  className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 rounded-full p-1.5 shadow-md border-2 border-white"
                  title="Nhealth Verified Badged Doctor"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#002b49]">
                  {doctor.name}
                </h3>
                <span className="text-xs font-bold text-[#008080] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {doctor.specialization}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-700">{doctor.degrees}</p>
              <p className="text-xs text-slate-500">{doctor.title}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <Award className="w-3.5 h-3.5 text-[#008080]" />
                  <span>{doctor.experienceYears}+ Years Exp</span>
                </span>
                <span className="flex items-center gap-1 font-extrabold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">({doctor.reviewCount}+ reviews)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px]">{doctor.hospitalAffiliation}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doctor.locality}, {doctor.city}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doctor.languages.join(', ')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Bio */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
            <h4 className="text-xs font-black text-[#002b49] uppercase tracking-wider">
              About Doctor &amp; Clinical Focus
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {doctor.bio}
            </p>
            {doctor.subSpecialty && (
              <p className="text-[11px] text-teal-800 font-semibold pt-1">
                Focus Areas: {doctor.subSpecialty}
              </p>
            )}
          </div>

          {/* Consultation Fee & Consultation Modes */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                Consultation Fee
              </span>
              <span className="text-2xl font-black text-[#002b49]">
                ₹{doctor.consultationFee}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Supported Modes:</span>
              <div className="flex gap-1.5">
                {doctor.modes.map((m) => (
                  <span
                    key={m}
                    className="text-[10px] font-bold bg-white text-teal-800 border border-teal-200 px-2 py-1 rounded-lg"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* REAL-TIME AVAILABILITY CARD */}
          <div className="rounded-2xl border p-4 sm:p-5 transition-all bg-white shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                {isAvailable ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                ) : (
                  <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                )}
                <div>
                  <h4 className="text-sm font-black text-[#002b49]">
                    {isAvailable ? 'Doctor is Online & Ready' : 'Doctor is Offline for Instant Calls'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isAvailable
                      ? 'Immediate video/audio connect available right now.'
                      : 'Currently in surgery/OPD. Please choose an advance appointment slot below.'}
                  </p>
                </div>
              </div>

              {/* Status Simulation Toggle: Lets users verify real-time logic instantly */}
              <button
                type="button"
                onClick={handleToggleDoctorStatus}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50 text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                title="Simulate doctor flipping availability toggle in Doctor Dashboard"
              >
                <Radio className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>Doctor Portal Status: <strong>{isAvailable ? 'ON' : 'OFF'}</strong> (Toggle)</span>
              </button>
            </div>

            {/* CONDITIONAL ACTION AREA */}
            <div className="pt-4">
              {isAvailable ? (
                /* STATE 1: DOCTOR STATUS IS ON -> Immediate Connect */
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Doctor is in consultation room · Queue: 0 Ahead</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                      Wait Time &lt; 2 Mins
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectNow}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Immediate Connect (Instant Consultation)</span>
                  </button>
                </div>
              ) : (
                /* STATE 2: DOCTOR STATUS IS OFF -> Schedule Time Slot Selection Grid */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-2">
                      Select Consultation Date:
                    </span>
                    <div className="flex gap-2">
                      {dates.map((d) => (
                        <button
                          key={d.date}
                          type="button"
                          onClick={() => setSelectedDate(d.date)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedDate === d.date
                              ? 'bg-[#002b49] text-white border-[#002b49] shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-2">
                      Select Available Time Slot:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedSlot === slot
                              ? 'bg-[#008080] text-white border-[#008080] shadow-xs ring-2 ring-teal-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{slot}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmSchedule}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#002b49] hover:bg-[#00172b] text-white font-black text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-teal-300" />
                    <span>Confirm Scheduled Consultation ({selectedDate} @ {selectedSlot})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
