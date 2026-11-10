import React from 'react';
import { Shield, Droplets, CheckCircle, Car } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';

interface AboutSectionProps {
  onBookService: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onBookService }) => {
  return (
    <section id="about" className="py-24 bg-[#06070a] border-b border-neutral-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Visual Asset Frame with Studio Photography */}
          <div className="lg:col-span-5 relative space-y-6">
            <div className="rounded-3xl overflow-hidden border border-neutral-800 bg-[#0d0f17] shadow-2xl relative group">
              <img
                src={BUSINESS_CONFIG.assets.fullDetailService}
                alt="Pristine performance vehicle detailed by CREWW"
                className="w-full h-[400px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-black/30 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#090b10]/90 backdrop-blur-md border border-neutral-700/80 shadow-md">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
                  <Shield className="w-4 h-4" />
                  <span>The CREWW Mobile Fleet</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Independent mobile rigs carrying commercial-grade steam extractors, random-orbital buffers, and closed-circuit power.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Confident Automotive Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>About CREWW Mobile Detailing</span>
              <span className="text-neutral-600" aria-hidden="true">·</span>
              <span className="text-neutral-400">American Automotive Care</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              A NEW STANDARD IN MOBILE VEHICLE PRESERVATION
            </h2>

            <p className="text-base text-neutral-300 leading-relaxed font-normal">
              <strong className="text-white font-semibold">{BUSINESS_CONFIG.name}</strong> was founded to solve a fundamental problem in automotive care: the compromise between convenient drive-thru washes that scratch clear coats and traditional detailing shops that demand leaving your vehicle for entire days.
            </p>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              We engineered a turnkey on-site solution. Our technicians arrive in self-sufficient mobile units carrying multi-stage filtered deionized water, whisper-quiet generators, and specialized automotive restoration equipment. Whether stationed in your home driveway, executive garage, or corporate campus, we treat your vehicle with the exact same meticulous precision found in dedicated detailing bays.
            </p>

            {/* Core Operational Principles */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-sky-950/50 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    Uncompromising Paint Safety
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    We exclusively employ grit-guard bucket wash systems, ultra-plush 500+ GSM microfibers, and non-abrasive pH-balanced formulations to eliminate swirl marks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-sky-950/50 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    Hospital-Grade Interior Sanitization
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    High-temperature pressurized steam penetrates cabin vents, seat tracks, and upholstery fibers to eliminate bacteria and trapped odors at their source.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-sky-950/50 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    Direct Client Accountability
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Zero automated run-throughs or rushed schedules. Every vehicle receives our full scheduled attention, concluded with a mutual walkthrough inspection.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={onBookService}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
              >
                SCHEDULE YOUR MOBILE DETAIL
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
