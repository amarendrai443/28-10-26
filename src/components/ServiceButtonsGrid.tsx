import React from 'react';
import { ServiceItem } from '../types/serviceBooking';
import { EXTRACTED_SERVICES } from '../data/servicesData';

interface ServiceButtonsGridProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServiceButtonsGrid: React.FC<ServiceButtonsGridProps> = ({ onSelectService }) => {
  return (
    <div className="w-full mt-6 sm:mt-8 lg:mt-10">
      {/* Strict 4x4 Grid layout across ALL screen sizes (Mobile, Tablet, and Desktop) */}
      <div
        className="grid grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3.5 md:gap-4 lg:gap-5 xl:gap-6 w-full"
        style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        {EXTRACTED_SERVICES.map((service, idx) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelectService(service)}
            className="group relative flex flex-col bg-white rounded-lg xs:rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-[#008080] shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5 cursor-pointer overflow-hidden text-center p-1 xs:p-1.5 sm:p-2.5 md:p-3 lg:p-3.5 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-[#008080]/30 w-full active:scale-[0.98]"
            aria-label={`Book ${service.name}`}
          >
            {/* Service Image extracted from https://ibb.co/4wQnyzJB */}
            <div className="w-full aspect-[370/236] bg-slate-50 rounded-md xs:rounded-lg sm:rounded-xl overflow-hidden mb-1 sm:mb-2 md:mb-3 border border-slate-100 flex items-center justify-center shrink-0">
              <img
                src={service.cardImage}
                alt={service.name}
                loading={idx < 4 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-300 will-change-transform"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== window.location.origin + service.iconImage) {
                    target.src = service.iconImage;
                  }
                }}
              />
            </div>

            {/* Under each service image: ONLY the exact service name as shown in the source image */}
            <div className="w-full py-0.5 sm:py-1 px-0.5 flex items-center justify-center flex-1 min-h-[26px] xs:min-h-[30px] sm:min-h-[36px] md:min-h-[44px]">
              <h3 className="font-bold text-[#002b49] group-hover:text-[#008080] text-[8.5px] xs:text-[10px] sm:text-xs md:text-sm lg:text-[15px] leading-[1.15] sm:leading-snug transition-colors text-center break-words hyphens-auto">
                {service.name}
              </h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
