import React, { useEffect } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { DetailPackage } from '../config/businessConfig';

interface ServiceDetailModalProps {
  packageData: DetailPackage | null;
  onClose: () => void;
  onBookPackage: (packageId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  packageData,
  onClose,
  onBookPackage,
}) => {
  useEffect(() => {
    if (packageData) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [packageData, onClose]);

  if (!packageData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c0e15] border border-neutral-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-modal-content">
        
        {/* Header Image Strip */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-neutral-900 shrink-0">
          <img
            src={packageData.image}
            alt={packageData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-black/40 to-transparent" />
          
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm border border-sky-400/30 inline-block mb-1">
                {packageData.badge}
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                {packageData.name}
              </h3>
              {packageData.subtitle && (
                <p className="text-xs text-sky-400 font-medium">
                  {packageData.subtitle}
                </p>
              )}
            </div>

            <div className="text-right bg-black/70 px-3 py-1.5 rounded-lg border border-neutral-700 backdrop-blur-sm">
              <span className="text-[11px] text-neutral-400 line-through block">
                ${packageData.regularPrice}
              </span>
              <span className="font-heading text-2xl font-black text-white font-mono leading-none">
                ${packageData.offerPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-300 text-xs sm:text-sm">
          <p className="text-neutral-300 leading-relaxed">
            {packageData.tagline}
          </p>

          {/* Categorized detailed breakdown */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-white text-xs border-b border-neutral-800 pb-2">
              Comprehensive Service Breakdown
            </h4>

            {packageData.detailedInclusions.map((cat, idx) => (
              <div key={idx} className="bg-[#07080b] p-3.5 rounded-xl border border-neutral-800/80 space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wide block">
                  {cat.category}
                </span>
                <div className="space-y-1.5">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Mobile Service: We arrive with spot-free water & self-contained power.</span>
          </div>
        </div>

        {/* Modal Footer with Direct Booking Action */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-[#090b10] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onBookPackage(packageData.id);
            }}
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2 cursor-pointer"
          >
            <span>BOOK THIS PACKAGE · ${packageData.specialOfferPrice}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
