import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Quote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Sparkles,
  MapPin,
  Heart,
  ShieldCheck,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTestimonials(getApprovedTestimonials());
    };
    window.addEventListener('nhealth_testimonials_updated', handleUpdate);
    return () => window.removeEventListener('nhealth_testimonials_updated', handleUpdate);
  }, []);

  // Auto-slide effect (cycles every 4.5s)
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [testimonials, currentIndex, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="w-full py-10 sm:py-16 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#008080] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
              <span>Verified Patient Stories &amp; Ratings</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#002b49] tracking-tight">
              Trusted by 50,000+ Families Across Bharat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real doorstep care experiences verified by our automated patient feedback system.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenFeedbackModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-[#008080] hover:from-teal-500 hover:to-[#006666] text-white text-xs font-bold shadow-md shadow-teal-900/15 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Share Your Feedback</span>
            </button>

            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* TRENDY CARD SLIDER (STRICT 3:1.5 ASPECT RATIO) */}
        <div
          className="testimonial-slider-frame relative rounded-3xl overflow-hidden shadow-xl border border-teal-500/30 bg-gradient-to-br from-[#00172b] via-[#002a4a] to-[#003d63] text-white group select-none"
          style={{ aspectRatio: '3 / 1.5', width: '100%', objectFit: 'cover' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {testimonials.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={item.id}
                className={`absolute inset-0 w-full h-full p-4 sm:p-7 md:p-9 lg:p-11 flex flex-col justify-between transition-all duration-700 ease-in-out ${
                  isActive
                    ? 'opacity-100 translate-x-0 pointer-events-auto z-10'
                    : 'opacity-0 translate-x-8 pointer-events-none z-0'
                }`}
              >
                {/* Top Row: Service & Star Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider bg-teal-500/25 border border-teal-400/40 text-teal-300 backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3 text-teal-300" />
                      <span>{item.serviceName}</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs text-slate-300">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{item.city}</span>
                    </span>
                  </div>

                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 sm:px-3 py-1 rounded-full border border-amber-400/30">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            star <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-500'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 ml-1">
                      {item.rating}.0
                    </span>
                  </div>
                </div>

                {/* Center: Quote / Patient Feedback Text */}
                <div className="my-auto py-2">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Quote className="w-5 h-5 sm:w-8 sm:h-8 text-teal-400/50 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-base md:text-lg lg:text-xl font-medium text-slate-100 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-4 italic drop-shadow-xs">
                      "{item.feedbackNote}"
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Patient Identity & Verified Tag */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-teal-400/60 bg-slate-800 shrink-0 shadow-md">
                      <img
                        src={
                          item.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.patientName)}`
                        }
                        alt={item.patientName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 leading-tight">
                        <span>{item.patientName}</span>
                        <span title="Verified Home Patient">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                        </span>
                      </h4>
                      <p className="text-[10px] sm:text-xs text-teal-300 font-semibold">
                        Verified Healthcare Patient
                      </p>
                    </div>
                  </div>

                  <span className="text-[9.5px] sm:text-xs text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-5 bg-teal-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
