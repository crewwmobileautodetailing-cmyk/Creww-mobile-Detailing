import React, { useState } from 'react';
import { Search, CheckCircle2, ArrowRight, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface HomepageZipCheckerProps {
  onValidatedBooking: (zip: string, city?: string, state?: string) => void;
}

const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

function getZipValidationError(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 'Please enter a 5-digit US ZIP code (e.g. 77001 or 90210).';
  }
  if (/[^0-9-]/.test(trimmed)) {
    return 'Please enter digits only — letters and special characters are not allowed (e.g. 90210 or 90210-1234).';
  }
  const digitsOnly = trimmed.replace(/-/g, '');
  if (digitsOnly.length < 5) {
    return 'ZIP code must contain at least 5 digits (e.g. 77001 or 90210).';
  }
  if (!US_ZIP_REGEX.test(trimmed)) {
    return 'Please enter a valid 5-digit US ZIP code (e.g. 90210) or ZIP+4 format (e.g. 90210-1234).';
  }
  return null;
}

export const HomepageZipChecker: React.FC<HomepageZipCheckerProps> = ({ onValidatedBooking }) => {
  const [zipInput, setZipInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [submittedZip, setSubmittedZip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = zipInput.trim();
    const validationError = getZipValidationError(clean);

    if (validationError) {
      setError(validationError);
      setSubmittedZip(null);
      return;
    }

    setError(null);
    setIsChecking(true);

    // Smooth UI feedback transition (format validation only; no external geo lookup)
    setTimeout(() => {
      setIsChecking(false);
      setSubmittedZip(clean);
    }, 300);
  };

  return (
    <section id="coverage" className="py-16 sm:py-20 bg-[#090b10] border-b border-neutral-800 relative scroll-mt-20 overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/5 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Kicker */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-sky-400 mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Mobile Service Location Checker</span>
          <span className="text-neutral-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-neutral-300">Location Review</span>
        </div>

        {/* Heading & Supporting Text */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
          ENTER YOUR SERVICE ZIP CODE
        </h2>

        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 mb-8 leading-relaxed font-normal">
          Enter your 5-digit US ZIP code (or ZIP+4) to include your location in your detailing request. Our team will review your location and confirm service arrangements.
        </p>

        {/* Form Container */}
        <div className="max-w-xl mx-auto bg-[#0d0f17] border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <label htmlFor="homepage-zip-input" className="sr-only">
                US ZIP Code (5-digit or ZIP+4)
              </label>
              <input
                id="homepage-zip-input"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={zipInput}
                onChange={(e) => {
                  setZipInput(e.target.value);
                  if (error) setError(null);
                  if (submittedZip) setSubmittedZip(null);
                }}
                placeholder="Enter 5-digit US ZIP (e.g. 90210)"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'homepage-zip-error' : undefined}
                className={`w-full px-4 py-3.5 rounded-xl bg-[#06070a] border text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono tracking-wider min-h-[48px] ${
                  error ? 'border-red-500/80 focus:ring-red-500' : 'border-neutral-700'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isChecking}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-md shadow-sky-500/20 min-h-[48px]"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>CONTINUE WITH ZIP</span>
                </>
              )}
            </button>
          </form>

          {/* Validation error */}
          {error && (
            <p
              id="homepage-zip-error"
              role="alert"
              className="text-red-400 text-xs mt-2.5 text-left font-medium flex items-start gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
          )}

          {/* Professional Green Confirmation State (Only shown after valid ZIP format) */}
          {submittedZip && !error && (
            <div className="mt-5 text-left animate-fade-in">
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-3.5 shadow-lg shadow-emerald-950/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-black text-white text-sm sm:text-base tracking-wide uppercase">
                      Great! Your location details have been received.
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 leading-relaxed font-normal">
                      Continue to request your detailing service. Our team will review your location and confirm the arrangements.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>ZIP Code: <strong className="text-white">{submittedZip}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onValidatedBooking(submittedZip)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20 cursor-pointer min-h-[48px]"
                >
                  <span>CONTINUE TO REQUEST DETAILING SERVICE</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-neutral-500 mt-3 text-center">
            Final service availability, scheduling, and location arrangements are confirmed by our team upon review.
          </p>
        </div>
      </div>
    </section>
  );
};
