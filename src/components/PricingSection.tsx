import React, { useState } from 'react';
import { Check, ArrowRight, Shield, Star, ChevronDown, ChevronUp, Droplets, Zap } from 'lucide-react';
import { BUSINESS_CONFIG, DetailPackage } from '../config/businessConfig';
import { ServiceRequirementsNotice } from './ServiceRequirementsNotice';

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
  onOpenDetails?: (pkg: DetailPackage) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPackage, onOpenDetails }) => {
  const [showFullInclusions, setShowFullInclusions] = useState<boolean>(false);

  return (
    <section id="pricing" className="py-24 bg-[#06070a] border-b border-neutral-800 scroll-mt-20 relative overflow-hidden">
      <div id="packages" className="absolute -top-20" />
      {/* Background ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-sky-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Guaranteed Transparent Pricing</span>
            <span className="text-neutral-600" aria-hidden="true">·</span>
            <span className="text-neutral-400">Zero Travel Surcharges</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            DETAILING PACKAGES & RATES
          </h2>

          <p className="text-neutral-300 text-sm sm:text-base mt-3 leading-relaxed">
            Select your service below. Our published discounted rates are final with zero surprise fees. Payment is collected only after you personally inspect the completed vehicle.
          </p>
        </div>

        {/* Prominent Service Requirement Notice: WATER & ELECTRICITY REQUIRED */}
        <ServiceRequirementsNotice />

        {/* Mobile Swipe Guidance Banner (visible only on mobile) */}
        <div className="lg:hidden flex items-center justify-between mt-8 mb-2 px-1 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Swipe packages horizontally</span>
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
            3 Signature Packages
          </span>
        </div>

        {/* Exactly 3 Unique Pricing Packages - Mobile horizontal swipe track, Desktop 3-column grid */}
        <div className="flex lg:grid lg:grid-cols-3 gap-5 lg:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-4 lg:pb-0 items-stretch no-scrollbar touch-pan-x mt-2 lg:mt-12">
          {BUSINESS_CONFIG.packages.map((pkg: DetailPackage) => {
            const isBestValue = pkg.isBestValue;
            const isFullPackage = pkg.id === 'full-detailing';
            
            const displayedInclusions = isFullPackage && !showFullInclusions
              ? pkg.inclusions.slice(0, 6)
              : pkg.inclusions;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 w-[84vw] sm:w-[380px] lg:w-auto shrink-0 lg:shrink snap-center ${
                  isBestValue
                    ? 'bg-gradient-to-b from-[#101422] via-[#0d101a] to-[#08090e] border-2 border-sky-400/90 shadow-2xl shadow-sky-500/20 lg:-translate-y-2.5 z-10'
                    : 'bg-[#0c0e15] border border-neutral-800 hover:border-neutral-700'
                } p-5 sm:p-8`}
              >
                <div>
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-xs font-black tracking-wider uppercase px-3 py-1 rounded-md flex items-center gap-1.5 ${
                        isBestValue
                          ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sm'
                          : 'bg-neutral-800 text-sky-400 border border-neutral-700'
                      }`}
                    >
                      {isBestValue && <Star className="w-3.5 h-3.5 fill-white text-white" />}
                      <span>{pkg.badge}</span>
                    </span>

                    <span className="text-xs font-bold text-emerald-400">
                      Save ${pkg.savings}
                    </span>
                  </div>

                  {/* Image Preview */}
                  <div className="relative h-36 sm:h-44 rounded-2xl overflow-hidden mb-4 bg-neutral-900 border border-neutral-800/80">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-transparent to-transparent" />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-wide mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-sky-400 font-medium mb-2.5">
                    {pkg.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed min-h-[40px] mb-5">
                    {pkg.tagline}
                  </p>

                  {/* Price Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#06070a] border border-neutral-800 mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs uppercase font-semibold text-neutral-400">
                        Regular Price:
                      </span>
                      <span className="text-base sm:text-lg font-bold text-neutral-500 line-through decoration-rose-500/80 decoration-2">
                        ${pkg.regularPrice}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                        ${pkg.offerPrice}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        Special Offer
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                      ✓ Instant ${pkg.savings} discount reflected automatically upon booking
                    </p>
                  </div>

                  {/* Inclusions List */}
                  <div className="space-y-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                      {isFullPackage ? 'All 14 Inclusions (Complete Exterior + Interior):' : 'Package Inclusions (7 Items):'}
                    </span>

                    <div className="space-y-2.5">
                      {displayedInclusions.map((inclusion, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                          <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>{inclusion}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expand/Collapse for Full Detailing package */}
                    {isFullPackage && (
                      <button
                        type="button"
                        onClick={() => setShowFullInclusions(!showFullInclusions)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors pt-1 cursor-pointer"
                      >
                        {showFullInclusions ? (
                          <>
                            <span>Show fewer inclusions</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>+ View all 14 inclusions</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Booking CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      isBestValue
                        ? 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-xl shadow-sky-500/25 border border-sky-300/40'
                        : 'bg-neutral-800 hover:bg-sky-500 text-white border border-neutral-700/80 hover:border-sky-400'
                    }`}
                  >
                    <span>BOOK YOUR SERVICE · ${pkg.offerPrice}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {onOpenDetails && (
                    <button
                      type="button"
                      onClick={() => onOpenDetails(pkg)}
                      className="w-full text-center text-[11px] text-neutral-400 hover:text-sky-400 transition-colors mt-2.5 cursor-pointer"
                    >
                      View Comprehensive Inclusions Modal →
                    </button>
                  )}

                  <p className="text-center text-[10px] text-neutral-400 mt-2">
                    Transparent pricing · Water & electricity hookup confirmed by client
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Operational Guarantee Bar */}
        <div className="mt-14 p-6 sm:p-7 rounded-2xl bg-[#0c0e15] border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <Shield className="w-7 h-7 text-sky-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                The CREWW Mobile Inspection Guarantee
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Zero advance deposits. You review the paint, wheels, and cabin in person before final payment is settled.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectPackage('full-detailing')}
            className="shrink-0 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-white border border-sky-500/40 hover:bg-sky-500/20 transition-all cursor-pointer"
          >
            Select Best Value ($229)
          </button>
        </div>

      </div>
    </section>
  );
};
