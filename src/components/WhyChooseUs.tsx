import React from 'react';
import { Droplets, Zap, Shield, Sparkles, DollarSign, UserCheck } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';

export const WhyChooseUs: React.FC = () => {
  const pillarIcons = [Droplets, Zap, Shield, Sparkles, DollarSign, UserCheck];

  return (
    <section id="why-us" className="py-24 bg-[#08090e] border-b border-neutral-800 scroll-mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-sky-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>The CREWW Operational Standard</span>
            <span className="text-neutral-600" aria-hidden="true">·</span>
            <span className="text-neutral-400">Mobile Engineering</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            ENGINEERED MOBILE ADVANTAGES
          </h2>

          <p className="text-neutral-300 text-sm sm:text-base mt-3 leading-relaxed">
            We eliminate the compromises of traditional car washes and static detailing shops by bringing laboratory-grade equipment and spot-free water directly to your location.
          </p>
        </div>

        {/* 6 Core Pillars Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BUSINESS_CONFIG.pillars.map((pillar, idx) => {
            const Icon = pillarIcons[idx] || Sparkles;

            return (
              <div
                key={pillar.title}
                className="bg-[#0c0e15] border border-neutral-800 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-sky-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-sky-950/30 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 group-hover:bg-sky-900/60 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-xs font-mono text-neutral-500 font-bold uppercase tracking-wider block mb-1">
                    PILLAR 0{idx + 1}
                  </span>

                  <h3 className="font-heading text-xl font-bold text-white mb-2.5 group-hover:text-sky-400 transition-colors uppercase tracking-wide">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Banner */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-[#0d121f] via-[#090c14] to-[#0d121f] border border-sky-900/40 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left shadow-lg">
          <div className="space-y-1">
            <h4 className="font-heading text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
              DISPATCHED ACROSS THE UNITED STATES
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300">
              No long queues, no vehicle drop-offs, and zero waiting rooms. Work or relax while our crew transforms your car.
            </p>
          </div>

          <a
            href="#pricing"
            className="shrink-0 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/20"
          >
            VIEW SPECIAL OFFERS
          </a>
        </div>

      </div>
    </section>
  );
};
