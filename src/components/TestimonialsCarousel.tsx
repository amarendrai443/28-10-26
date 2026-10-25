import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Quote,
  CheckCircle2,
  MessageSquarePlus,
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  TestimonialItem,
  getApprovedTestimonials,
} from '../utils/testimonialsStorage';

interface TestimonialsCarouselProps {
  onOpenFeedbackModal: () => void;
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  onOpenFeedbackModal,
}) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(getApprovedTestimonials);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setTestimonials(getApprovedTestimonials());
    };
    window.addEventListener('nhealth_testimonials_updated', handleUpdate);
    return () => window.removeEventListener('nhealth_testimonials_updated', handleUpdate);
  }, []);

  if (testimonials.length === 0) return null;

  // Triplicate testimonials to guarantee seamless infinite single-line marquee loop
  const marqueeItems = [...testimonials, ...testimonials, ...testimonials];

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="w-full py-8 sm:py-10 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      <style>{`
        @keyframes testimonials-marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .testimonials-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: testimonials-marquee-scroll 45s linear infinite;
        }
        .testimonials-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-6">
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#008080] text-[10.5px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#008080]" />
              <span>Verified Patient Stories &amp; Ratings</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#002b49] tracking-tight">
              Trusted by 50,000+ Families Across Bharat
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Real doorstep care experiences verified by our automated patient feedback system.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenFeedbackModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-[#008080] hover:from-teal-500 hover:to-[#006666] text-white text-xs font-bold shadow-md shadow-teal-900/15 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Share Feedback</span>
            </button>

            {/* Manual Scroll Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleManualScroll('left')}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleManualScroll('right')}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTINUOUS AUTO-MOVE SINGLE-LINE MARQUEE CONTAINER */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Horizontal Marquee Track with Strict 2:1.5 Aspect Ratio Cards */}
        <div
          ref={scrollContainerRef}
          className="testimonials-marquee-track flex flex-row flex-nowrap items-center py-2"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{ aspectRatio: '2 / 1.5' }}
              className="w-[280px] sm:w-[310px] md:w-[330px] shrink-0 mx-2.5 sm:mx-3 rounded-2xl p-4 sm:p-4.5 bg-gradient-to-br from-[#00172b] via-[#002844] to-[#003859] border border-teal-500/30 text-white shadow-md hover:shadow-xl hover:border-teal-400/60 transition-all flex flex-col justify-between group relative overflow-hidden select-none"
            >
              {/* Subtle Ambient Light Pill */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

              {/* Card Top: Patient Identity & Star Rating */}
              <div className="flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-teal-400/60 bg-slate-800 shrink-0 shadow-xs">
                    <img
                      src={
                        item.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.patientName)}`
                      }
                      alt={item.patientName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.patientName)}`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white flex items-center gap-1 leading-tight truncate">
                      <span className="truncate">{item.patientName}</span>
                      <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                    </h4>
                    <span className="text-[10px] text-teal-300 font-semibold flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 shrink-0 text-teal-400" />
                      <span className="truncate">{item.city}</span>
                    </span>
                  </div>
                </div>

                {/* 5-Star Rating Pill */}
                <div className="flex items-center gap-0.5 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-2.5 h-2.5 ${
                        star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-[9.5px] font-black text-amber-300 ml-0.5">
                    {item.rating}.0
                  </span>
                </div>
              </div>

              {/* Card Center: Feedback Quote (Compact 2:1.5 fit) */}
              <div className="my-auto py-1 z-10">
                <div className="flex items-start gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-teal-400/60 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] sm:text-xs text-slate-100 font-normal leading-snug line-clamp-3 italic">
                    "{item.feedbackNote}"
                  </p>
                </div>
              </div>

              {/* Card Bottom: Service Name & Verification */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9.5px] sm:text-[10px] text-slate-300 z-10">
                <span className="inline-flex items-center gap-1 font-semibold text-teal-300 truncate max-w-[65%]">
                  <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="truncate">{item.serviceName}</span>
                </span>
                <span className="text-slate-400 font-mono shrink-0">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
