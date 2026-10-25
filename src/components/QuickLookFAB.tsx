import React, { useState, useRef, useEffect } from 'react';
import { PhoneCall, Heart, Activity, Mic, X, Eye } from 'lucide-react';

interface QuickLookFABProps {
  onOpenVitalLens: () => void;
  onOpenVoiceAssistant: () => void;
}

export const QuickLookFAB: React.FC<QuickLookFABProps> = ({
  onOpenVitalLens,
  onOpenVoiceAssistant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<any>(null);
  // Track last touch timestamp to prevent synthetic mouseEnter from colliding with touch click on mobile/tablet
  const lastTouchTimeRef = useRef<number>(0);

  // Close when clicking or tapping outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchend', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchend', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Strict hover binding: on desktop with mouse, hovering over the button can expand the menu
  const handleButtonMouseEnter = () => {
    // Ignore synthetic mouseEnter dispatched right after a touch event on mobile/tablets
    if (Date.now() - lastTouchTimeRef.current < 750) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Keep menu open while cursor is actively interacting within the options area
  const handleKeepOpen = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Quick seamless collapse as soon as pointer leaves button or options area
  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  // Single Click / Single Tap handler: immediate, seamless toggle on single click or tap
  const handleMainButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen((prev) => !prev);
  };

  const handleMainButtonTouchStart = () => {
    lastTouchTimeRef.current = Date.now();
  };

  // Stack items in vertical line, ordered bottom-to-top above the trigger:
  // 1. WhatsApp
  // 2. SOS / Emergency
  // 3. Vital Lens
  // 4. Nhealth Voice AI
  return (
    <aside
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleKeepOpen}
      aria-label="Nhealth Quick Look Action Menu"
      className="quicklook-fab-wrapper flex flex-col items-end select-none pointer-events-none"
    >
      {/* Vertically Expanding Stack Container: pointer-events active ONLY when open */}
      <div
        className={`flex flex-col items-end gap-2 md:gap-2.5 transition-all duration-200 ease-out origin-bottom ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100 mb-2 md:mb-2.5'
            : 'opacity-0 translate-y-4 pointer-events-none scale-95 max-h-0 overflow-hidden mb-0'
        }`}
      >
        {/* Child 4 (Top): Nhealth Voice AI */}
        <div className="flex items-center justify-end gap-2 group/fab-item">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00172d]/95 text-cyan-200 border border-cyan-500/30 shadow-lg backdrop-blur-md whitespace-nowrap opacity-0 group-hover/fab-item:opacity-100 transition-opacity duration-150">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Nhealth Voice AI
          </span>
          <div className="flex items-center justify-center w-11 md:w-16 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVoiceAssistant();
                setIsOpen(false);
              }}
              aria-label="Open Nhealth Voice Assistant"
              className="touch-manipulation flex items-center justify-center w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-xl hover:shadow-cyan-500/40 border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Mic className="w-4 h-4 md:w-6 md:h-6 text-white drop-shadow" />
            </button>
          </div>
        </div>

        {/* Child 3: Vital Lens */}
        <div className="flex items-center justify-end gap-2 group/fab-item">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1b0a33]/95 text-purple-200 border border-purple-500/30 shadow-lg backdrop-blur-md whitespace-nowrap opacity-0 group-hover/fab-item:opacity-100 transition-opacity duration-150">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Vital Lens (AI Health Scan)
          </span>
          <div className="flex items-center justify-center w-11 md:w-16 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVitalLens();
                setIsOpen(false);
              }}
              aria-label="Open Nhealth Vital Lens"
              className="touch-manipulation flex flex-col items-center justify-center w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white shadow-xl hover:shadow-purple-500/40 border border-purple-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <div className="relative flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 text-white fill-purple-300/40" />
                <Activity className="w-2 h-2 md:w-3 md:h-3 text-purple-100 absolute inset-0 m-auto animate-pulse" />
              </div>
              <span className="text-[5.5px] md:text-[7.5px] font-black uppercase tracking-tight text-purple-100 leading-none mt-0.5">
                VITALS
              </span>
            </button>
          </div>
        </div>

        {/* Child 2: SOS / Emergency */}
        <div className="flex items-center justify-end gap-2 group/fab-item">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#300a0a]/95 text-red-200 border border-red-500/30 shadow-lg backdrop-blur-md whitespace-nowrap opacity-0 group-hover/fab-item:opacity-100 transition-opacity duration-150">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            24/7 SOS / Emergency Care
          </span>
          <div className="flex items-center justify-center w-11 md:w-16 shrink-0">
            <a
              href="https://wa.me/919581582220?text=EMERGENCY%20MEDICAL%20SUPPORT%3A%20I%20need%20immediate%20emergency%20care%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Emergency Medical Assistance on WhatsApp: +919581582220"
              className="touch-manipulation emergency-pulse flex flex-col items-center justify-center w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-xl hover:shadow-red-500/40 border border-red-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <PhoneCall className="w-3.5 h-3.5 md:w-5 md:h-5 text-white drop-shadow-sm animate-pulse" />
              <span className="text-[6px] md:text-[8.5px] font-black uppercase tracking-tight text-white leading-none mt-0.5">
                SOS
              </span>
            </a>
          </div>
        </div>

        {/* Child 1 (Bottom): WhatsApp */}
        <div className="flex items-center justify-end gap-2 group/fab-item">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#032412]/95 text-emerald-200 border border-emerald-500/30 shadow-lg backdrop-blur-md whitespace-nowrap opacity-0 group-hover/fab-item:opacity-100 transition-opacity duration-150">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            WhatsApp: 9393934621
          </span>
          <div className="flex items-center justify-center w-11 md:w-16 shrink-0">
            <a
              href="https://wa.me/919393934621?text=Hi%20Nhealth%2C%20I%20would%20like%20to%20inquire%20about%20at-home%20healthcare%20services."
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Chat with Nhealth on WhatsApp at 9393934621"
              className="touch-manipulation whatsapp-pulse flex items-center justify-center w-9 h-9 md:w-14 md:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-emerald-500/40 border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4.5 h-4.5 md:w-7 md:h-7 text-white drop-shadow"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Trigger Button: 44px on mobile, 64px on desktop, single click/tap immediate toggle */}
      <div className="flex items-center justify-center pointer-events-auto w-11 md:w-16">
        <button
          type="button"
          onClick={handleMainButtonClick}
          onTouchStart={handleMainButtonTouchStart}
          onMouseEnter={handleButtonMouseEnter}
          aria-expanded={isOpen}
          aria-label="Quick Look - Emergency, WhatsApp, Vitals & Voice AI"
          className="touch-manipulation quicklook-pulse relative flex flex-col items-center justify-center w-11 h-11 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#001d31] via-[#002b49] to-[#005a7a] hover:from-[#00253f] hover:to-[#007096] text-white shadow-2xl hover:shadow-teal-500/30 border-2 border-teal-400/50 hover:border-teal-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-400/40"
        >
          {/* Subtle multi-layer ambient background shine */}
          <div className="absolute inset-0 rounded-full bg-teal-400/10 animate-pulse pointer-events-none" />

          {/* Icon Switcher: High-resolution Eye / Speed-insights view icon vs Close X */}
          <div className="relative z-10 flex items-center justify-center transition-transform duration-300">
            {isOpen ? (
              <X className="w-5 h-5 md:w-8 md:h-8 text-teal-200 rotate-90 animate-fade-in" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Eye className="w-5 h-5 md:w-7 md:h-7 text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
                <span className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teal-400/90 top-1 md:top-1.5 right-0.5 md:right-1 animate-ping" />
              </div>
            )}
          </div>

          <span className="relative z-10 text-[6px] md:text-[9px] font-black uppercase tracking-wider text-teal-200 leading-none mt-0.5">
            {isOpen ? 'CLOSE' : 'QUICK LOOK'}
          </span>
        </button>
      </div>
    </aside>
  );
};
