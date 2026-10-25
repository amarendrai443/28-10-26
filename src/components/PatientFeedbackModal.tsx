import React, { useState } from 'react';
import {
  X,
  Star,
  MessageSquare,
  AlertTriangle,
  PhoneCall,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Send,
  HelpCircle,
  ThumbsUp,
} from 'lucide-react';
import { submitPatientFeedback, FeedbackSubmissionPayload } from '../utils/testimonialsStorage';

interface PatientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceName?: string;
  defaultPatientName?: string;
  defaultCity?: string;
  serviceName?: string;
  patientName?: string;
  city?: string;
}

export const PatientFeedbackModal: React.FC<PatientFeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultServiceName = 'Home Healthcare Service',
  defaultPatientName = '',
  defaultCity = 'Hyderabad',
  serviceName: propServiceName,
  patientName: propPatientName,
  city: propCity,
}) => {
  const effectiveServiceName = propServiceName || defaultServiceName;
  const effectivePatientName = propPatientName || defaultPatientName;
  const effectiveCity = propCity || defaultCity;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [patientName, setPatientName] = useState(effectivePatientName || '');
  const [serviceName, setServiceName] = useState(effectiveServiceName);
  const [city] = useState(effectiveCity);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [complaintNote, setComplaintNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    submitted: boolean;
    isAutoPublished: boolean;
    isFlagged: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;

    setIsSubmitting(true);
    const payload: FeedbackSubmissionPayload = {
      patientName: patientName.trim() || 'Valued Patient',
      serviceName: serviceName || 'Home Healthcare Service',
      rating,
      feedbackNote: feedbackNote.trim(),
      complaintNote: complaintNote.trim() || undefined,
      city: defaultCity || 'Hyderabad',
    };

    const res = submitPatientFeedback(payload);

    setTimeout(() => {
      setIsSubmitting(false);
      if (res.isAutoPublished) {
        setSubmissionResult({
          submitted: true,
          isAutoPublished: true,
          isFlagged: false,
          message: 'Thank you! Your verified review passed AI quality verification and is now live on our Customer Testimonials carousel.',
        });
      } else if (res.item.status === 'flagged_danger') {
        setSubmissionResult({
          submitted: true,
          isAutoPublished: false,
          isFlagged: true,
          message: 'Your feedback contains words flagged by automated AI moderation. It has been routed to our Senior Care Quality Admin team for manual review.',
        });
      } else {
        setSubmissionResult({
          submitted: true,
          isAutoPublished: false,
          isFlagged: false,
          message: 'Thank you for your valuable feedback. Our healthcare coordinator team has received your comments for continuous service improvement.',
        });
      }
    }, 400);
  };

  const handleResetAndClose = () => {
    setSubmissionResult(null);
    setFeedbackNote('');
    setComplaintNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99995] flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-teal-500/30 overflow-hidden relative text-slate-800">
        {/* Top Accent Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#008080] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#002b49] leading-tight">
                Patient Experience &amp; Feedback
              </h3>
              <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                AI-Driven Care Quality Assurance · Doorstep Care
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close feedback modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {submissionResult ? (
            <div className="py-6 text-center space-y-3">
              <div
                className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                  submissionResult.isAutoPublished
                    ? 'bg-emerald-100 text-emerald-600'
                    : submissionResult.isFlagged
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-teal-100 text-[#008080]'
                }`}
              >
                {submissionResult.isAutoPublished ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : submissionResult.isFlagged ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <ThumbsUp className="w-8 h-8" />
                )}
              </div>

              <h4 className="text-base font-black text-slate-900">
                {submissionResult.isAutoPublished
                  ? 'Review Published Live!'
                  : submissionResult.isFlagged
                  ? 'Feedback Under Administrative Review'
                  : 'Feedback Received with Gratitude'}
              </h4>

              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {submissionResult.message}
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#001d31] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Star Rating Control */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>How would you rate your overall experience? *</span>
                  <span className="text-amber-600 font-black">{rating} of 5 Stars</span>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Service & Patient Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Service Completed</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    placeholder="e.g. Home Diagnostics, Doctor Visit"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Patient / Family Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    placeholder="Your Name (e.g. Priya Sharma)"
                  />
                </div>
              </div>

              {/* Feedback Note Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Your Experience &amp; Feedback Note *
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    ⭐ 4-5 stars auto-publishes upon AI verification
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Share details about the doctor, turnaround time, bedside manners, or reports quality..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                />
              </div>

              {/* Complaints / Grievance Textarea (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Any specific complaints or service grievances? (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={complaintNote}
                  onChange={(e) => setComplaintNote(e.target.value)}
                  placeholder="Help us improve: delay in arrival, sample query, or app issues..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Customer Support Contact Display (Mandatory Display) */}
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-teal-800 font-bold uppercase">Customer Support Helpdesk</div>
                    <a
                      href="tel:9393934621"
                      className="font-black text-[#002b49] hover:text-[#008080] text-xs transition-colors"
                    >
                      +91 9393934621
                    </a>
                  </div>
                </div>

                <a
                  href="mailto:support@nhealth.in"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-[#008080]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@nhealth.in</span>
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackNote.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-[#008080] hover:from-teal-500 hover:to-[#006666] text-white text-xs font-bold shadow-md shadow-teal-900/15 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying with AI Filter...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Patient Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
