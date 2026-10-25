import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdBannerItem, getActiveBanners } from '../utils/advertisingStorage';

interface WaitingRoomAdCarouselProps {
  onCtaClick?: (link: string) => void;
}

export const WaitingRoomAdCarousel: React.FC<WaitingRoomAdCarouselProps> = ({ onCtaClick }) => {
  const [ads, setAds] = useState<AdBannerItem[]>(() => getActiveBanners('waitingRoom'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setAds(getActiveBanners('waitingRoom'));
    };
    window.addEventListener('nhealth_banners_updated', handleUpdate);
    return () => window.removeEventListener('nhealth_banners_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;
    const interval = (ads[currentIndex]?.autoPlayInterval || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, interval);
    return () => clearInterval(timer);
  }, [ads, currentIndex, isPaused]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex] || ads[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-slate-700/60 text-white"
    >
      {/* 16:9 Image Background with gradient overlay */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={currentAd.imageUrl}
          alt={currentAd.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

        {/* Top Ad Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>{currentAd.tag || 'SPONSORED HEALTHCARE'}</span>
          </span>
          <span className="text-[10px] text-white/70 font-mono bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {currentIndex + 1} / {ads.length}
          </span>
        </div>

        {/* Content bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 space-y-2 text-left">
          <h4 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md">
            {currentAd.title}
          </h4>
          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {currentAd.subtitle}
          </p>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onCtaClick && onCtaClick(currentAd.ctaLink)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-xs font-black hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>{currentAd.ctaText || 'Claim Offer'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Nhealth Verified Partner</span>
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        {ads.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous advertisement"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next advertisement"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Slide Indicators */}
      {ads.length > 1 && (
        <div className="py-2 bg-slate-950 flex items-center justify-center gap-1.5">
          {ads.map((ad, idx) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-5 bg-teal-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
