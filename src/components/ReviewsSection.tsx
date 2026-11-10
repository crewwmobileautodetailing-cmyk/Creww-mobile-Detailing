import React from 'react';
import { Star, MessageSquarePlus, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ReviewsSectionProps {
  onBookService?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onBookService }) => {
  return (
    <section id="reviews" className="py-14 sm:py-24 bg-[#08090e] border-b border-neutral-800 scroll-mt-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-sky-400 mb-3">
          <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
          <span>Client Satisfaction</span>
          <span className="text-neutral-600" aria-hidden="true">·</span>
          <span className="text-neutral-400">Post-Walkthrough Verified</span>
        </div>

        {/* Section Heading (Exact requested headline) */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
          REAL EXPERIENCES. REAL RESULTS.
        </h2>

        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 mb-8 sm:mb-12 leading-relaxed">
          We pride ourselves on transparent workmanship. Every service concludes with a personal walkthrough to ensure your expectations are exceeded.
        </p>

        {/* Reviews Layout Container - Ready for genuine reviews */}
        <div className="max-w-4xl mx-auto">
          
          {/* Featured Ready-State Card with Required Message */}
          <div className="bg-gradient-to-b from-[#0c0f18] to-[#090b12] border border-neutral-800/90 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden group hover:border-sky-500/40 transition-all duration-300">
            <div className="flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto">
              
              {/* Star Rating Display */}
              <div className="flex items-center gap-1.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Exact Requested Display Text */}
              <h3 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                YOUR EXPERIENCE COULD BE FEATURED HERE.
              </h3>

              <p className="text-sm text-neutral-300 leading-relaxed">
                We are actively detailing vehicles across the United States. Following your appointment walkthrough, our dispatch team welcomes your honest feedback and photography to be highlighted on our official portal.
              </p>

              {/* Verified Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 w-full text-xs text-neutral-300 border-t border-neutral-800/80">
                <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#06070a]/60 border border-neutral-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>100% Verified Service</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#06070a]/60 border border-neutral-800">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Personal Walkthrough</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#06070a]/60 border border-neutral-800">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>5-Star Craftsmanship</span>
                </div>
              </div>

              {onBookService && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onBookService}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>BOOK YOUR SERVICE & SHARE FEEDBACK</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
