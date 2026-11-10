import React from 'react';
import { Calendar, ArrowRight, Check } from 'lucide-react';

interface FinalCtaSectionProps {
  onBookService: () => void;
  onOpenContact?: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onBookService, onOpenContact }) => {
  return (
    <section id="contact" className="py-24 bg-[#08090e] border-b border-neutral-800 scroll-mt-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="bg-gradient-to-b from-[#0f1422] to-[#0a0d16] border border-sky-500/30 rounded-3xl p-5 sm:p-14 shadow-2xl shadow-sky-950/50 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-sky-400 mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Mobile Detailing Dispatched Across The United States</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight max-w-3xl mx-auto">
            SHOWROOM REFLECTION. RESTORED AT YOUR DRIVEWAY.
          </h2>

          <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed font-normal">
            Select your preferred detailing package and lock in our active promotional rates. Our self-contained units bring purified spot-free water, independent electricity, and certified detailing specialists directly to you.
          </p>

          {/* Quick value markers */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-300 my-6 sm:my-8">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Check className="w-4 h-4 text-sky-400 shrink-0" />
              <span>100% On-Site Mobile Service</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Check className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Fixed Upfront Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Check className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Post-Service Walkthrough Approval</span>
            </div>
          </div>

          {/* Primary Action Row */}
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">
              <button
                onClick={onBookService}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-10 py-4 sm:py-5 rounded-xl text-sm sm:text-base font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-xl shadow-sky-500/25 border border-sky-300/40 cursor-pointer min-h-[48px]"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                <span>RESERVE ON-SITE DETAILING</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
              </button>
              {onOpenContact && (
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 sm:py-5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-200 hover:text-white bg-[#0e111a] hover:bg-neutral-800 active:scale-[0.98] border border-neutral-700/80 transition-all cursor-pointer whitespace-nowrap min-h-[48px]"
                >
                  <span>HAVE QUESTIONS? CONTACT US</span>
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-3">
              Instant appointment popup · Zero advance credit card requirement
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
