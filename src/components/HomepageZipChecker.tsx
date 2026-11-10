import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, XCircle, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { validateUsZipCode, ZipValidationResult } from '../services/zipValidationService';

interface HomepageZipCheckerProps {
  onValidatedBooking: (zip: string, city?: string, state?: string) => void;
}

export const HomepageZipChecker: React.FC<HomepageZipCheckerProps> = ({ onValidatedBooking }) => {
  const [zipInput, setZipInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ZipValidationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput.trim()) return;

    setIsChecking(true);
    setResult(null);

    const res = await validateUsZipCode(zipInput);
    setIsChecking(false);
    setResult(res);
  };

  return (
    <section id="coverage" className="py-20 bg-[#090b10] border-b border-neutral-800 relative scroll-mt-20 overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-semibold tracking-wider uppercase text-sky-400 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>Real-Time US Postal Verification</span>
          <span className="text-neutral-600" aria-hidden="true">·</span>
          <span className="text-neutral-300">Nationwide Mobile Dispatch</span>
        </div>

        {/* Heading & Supporting Text (Exact requested text) */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
          IS CREWW AVAILABLE IN YOUR AREA?
        </h2>

        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 mb-8 leading-relaxed font-normal">
          Enter your ZIP code to check whether our mobile detailing service is available at your location.
        </p>

        {/* Form Container */}
        <div className="max-w-xl mx-auto bg-[#0d0f17] border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={5}
                inputMode="numeric"
                pattern="[0-9]*"
                value={zipInput}
                onChange={(e) => {
                  setZipInput(e.target.value.replace(/\D/g, ''));
                  if (result) setResult(null);
                }}
                placeholder="Enter 5-digit US ZIP (e.g. 90210, 75201)"
                className="w-full px-4 py-3.5 rounded-xl bg-[#06070a] border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono tracking-wider"
                aria-label="5-digit US ZIP code"
              />
            </div>

            <button
              type="submit"
              disabled={isChecking || zipInput.length === 0}
              className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-md shadow-sky-500/20"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying USPS Data...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>CHECK MY AREA</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div className="mt-5 text-left animate-fade-in">
              {/* State A: Valid and Standard Serviceable */}
              {result.statusType === 'success' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide">
                        {result.message}
                      </p>
                      {result.city && result.state && (
                        <p className="text-xs text-emerald-300 mt-1">
                          Verified Location: <strong className="text-white">{result.city}, {result.state} ({result.zipCode})</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onValidatedBooking(result.zipCode, result.city, result.state)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md cursor-pointer"
                  >
                    <span>BOOK YOUR SERVICE FOR {result.city ? `${result.city.toUpperCase()}` : result.zipCode}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* State B: Valid US Postal Code, but Out of Standard Daily Route */}
              {result.statusType === 'out_of_zone' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-200 text-xs sm:text-sm">
                        {result.message}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Our units travel nationwide. You may submit an appointment reservation, and our dispatch team will confirm mobile unit scheduling within 2 business hours.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onValidatedBooking(result.zipCode, result.city, result.state)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                  >
                    <span>Proceed with Reservation Request for {result.zipCode} →</span>
                  </button>
                </div>
              )}

              {/* State C: Invalid US Postal Code or Foreign (e.g. Pakistani 54000) */}
              {result.statusType === 'invalid' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-300 text-xs sm:text-sm">
                      {result.message}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      CREWW operates exclusively within United States postal jurisdictions. Please provide a valid 5-digit US ZIP code.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-neutral-500 mt-3 text-center">
            Zero travel surcharges or trip fees apply within confirmed service routes.
          </p>
        </div>

      </div>
    </section>
  );
};
