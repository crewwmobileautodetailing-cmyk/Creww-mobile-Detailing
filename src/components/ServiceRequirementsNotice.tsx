import React from 'react';
import { Droplets, Zap, AlertCircle } from 'lucide-react';

export const ServiceRequirementsNotice: React.FC = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#0d121f] to-sky-950/40 border border-sky-500/30 p-5 sm:p-7 shadow-xl max-w-4xl mx-auto my-10 sm:my-12 text-left relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-xs font-bold tracking-wider uppercase text-sky-300">
            <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>BEFORE WE ARRIVE</span>
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
            WATER &amp; ELECTRICITY ACCESS REQUIRED
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Water and electricity are required for our mobile detailing service. If either is unavailable at your location, you may still submit a booking request by selecting &ldquo;No&rdquo;—our team will manually review your location to confirm whether service can be arranged.
          </p>
        </div>

        {/* Requirements Pills */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <div className="flex-1 md:flex-initial flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#06080e] border border-neutral-800 text-xs font-semibold text-neutral-200 shadow-sm">
            <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Water Access (Spigot)</span>
          </div>

          <div className="flex-1 md:flex-initial flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#06080e] border border-neutral-800 text-xs font-semibold text-neutral-200 shadow-sm">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Electricity (120V Outlet)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
