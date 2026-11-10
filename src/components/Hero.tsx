import React from 'react';
import { ArrowRight, Shield, Award, CheckCircle2 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';

interface HeroProps {
  onBookService: () => void;
  onViewServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookService, onViewServices }) => {
  return (
    <section id="home" className="relative overflow-hidden bg-[#06070a] pt-6 pb-14 sm:pt-10 sm:pb-20 md:py-24 border-b border-neutral-800">
      {/* Background Volumetric Glow */}
      <div 
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Asymmetric Editorial Typography & Direct Action */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-7 text-left">
            
            {/* Domain Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/40 border border-sky-500/30 text-[11px] sm:text-xs text-neutral-300 font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-sky-300 font-bold">Mobile Detailing Fleet</span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span>Direct To Your Door</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white uppercase tracking-tight leading-[1.05]">
              PRECISION AUTOMOTIVE RESTORATION. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">
                WHEREVER YOU ARE PARKED.
              </span>
            </h1>

            {/* Original Supporting Copy */}
            <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl leading-relaxed font-normal">
              CREWW deploys fully equipped mobile detailing units with commercial pressure washing, foam sanitation, and machine buffing directly to your home driveway or workplace parking. Flawless showroom results without leaving your property.
            </p>

            {/* Mobile Car Visual Snapshot - Visible only on mobile for immediate visual impact */}
            <div className="lg:hidden relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#0d0f17] shadow-xl my-4">
              <img
                src={BUSINESS_CONFIG.assets.heroCar}
                alt="Immaculate black luxury performance sedan detailed by CREWW Mobile Auto Detailing"
                className="w-full h-52 sm:h-64 object-cover"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-sky-400 block">
                    Showroom Standard
                  </span>
                  <span className="text-xs font-bold text-white font-heading">
                    Deep Gloss & Interior Sanitation
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-sky-300 px-2 py-0.5 bg-sky-500/20 rounded border border-sky-400/30">
                  On-Site Detailing
                </span>
              </div>
            </div>

            {/* Primary Action Row - High conversion prominent tap targets on mobile */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onBookService}
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-xl shadow-sky-500/25 border border-sky-300/40 cursor-pointer whitespace-nowrap"
              >
                <span>BOOK ON-SITE DETAILING</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </button>

              <button
                type="button"
                onClick={onViewServices}
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold text-neutral-200 hover:text-white bg-[#0e111a] hover:bg-neutral-800 active:scale-[0.98] border border-neutral-700/80 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>VIEW 3 PACKAGES</span>
              </button>
            </div>

            {/* Key Operational Differentiators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-2 text-xs sm:text-sm text-neutral-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Water & electricity access required at location</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Commercial pressure rinse & foam hand wash</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Dual-action machine buffer clear coat wax</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Pay only after personal walkthrough inspection</span>
              </div>
            </div>

            {/* Trust Evidence Strip */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-neutral-300 font-medium">100% Mobile Fleet</span>
              </div>
              <span className="text-neutral-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                <span className="text-neutral-300 font-medium">Transparent Published Rates</span>
              </div>
              <span className="text-neutral-700 hidden sm:inline">·</span>
              <span className="text-sky-400 font-medium">Zero Travel Fees</span>
            </div>
          </div>

          {/* Right Column: Creative Automotive Visual Frame (Desktop only to prevent redundant stack on mobile) */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-800/90 bg-[#0d0f17] shadow-2xl group">
              <img
                src={BUSINESS_CONFIG.assets.heroCar}
                alt="Immaculate black luxury performance sedan detailed by CREWW Mobile Auto Detailing"
                className="w-full h-[380px] sm:h-[460px] lg:h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-black/25 to-transparent" />

              {/* Lower Overlay Card */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#090b10]/90 backdrop-blur-md border border-neutral-700/80 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] tracking-wider uppercase font-bold text-sky-400">
                      Signature Finish
                    </span>
                    <h3 className="text-base font-bold text-white font-heading tracking-wide">
                      Flawless Clear Coat Depth
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-1 bg-sky-500/10 rounded-md border border-sky-500/30">
                    At Your Location
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Gentle foam hand wash, paint decontamination, machine buffer wax & deep cabin extraction.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
