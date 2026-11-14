import React, { useEffect, useRef } from 'react';
import { X, Shield, FileText, Mail } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { OptimizedImage } from './OptimizedImage';

export type LegalTab = 'privacy' | 'terms';

interface LegalModalProps {
  activeTab: LegalTab | null;
  onSelectTab: (tab: LegalTab) => void;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  activeTab,
  onSelectTab,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeTab) return;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, onClose]);

  if (!activeTab) return null;

  const isPrivacy = activeTab === 'privacy';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90dvh] bg-[#0c0e15] border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-content">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-neutral-800 bg-[#090b10] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <OptimizedImage
              src={BUSINESS_CONFIG.officialBadgePath}
              alt="CREWW Official Badge"
              className="h-8 w-auto object-contain shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="legal-modal-title"
                className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide leading-tight truncate"
              >
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <p className="text-[11px] text-neutral-400 truncate">
                {BUSINESS_CONFIG.name}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex border-b border-neutral-800 bg-[#090b10] px-4 sm:px-5 shrink-0"
          role="tablist"
          aria-label="Legal policies"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isPrivacy}
            onClick={() => onSelectTab('privacy')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              isPrivacy
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={!isPrivacy}
            onClick={() => onSelectTab('terms')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              !isPrivacy
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {isPrivacy ? (
            <>
              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  1. Information You Provide
                </h3>
                <p>
                  When you submit a booking request or contact inquiry through our website, we collect the details you voluntarily enter, including your name, phone number, email address, vehicle year/make/model, service address, ZIP code, preferred appointment date and time, water and electricity availability answers, and any optional notes.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  2. How We Use Your Information
                </h3>
                <p>
                  We use the details you submit solely to review your service location, verify water and electricity availability when needed, communicate with you regarding scheduling and appointment confirmation, and deliver requested mobile auto detailing services.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  3. Third-Party Services &amp; AI Assistant
                </h3>
                <p>
                  Booking and contact form submissions are transmitted via EmailJS so our team receives your request and sends an automated confirmation email when applicable. Questions sent to our Crewy AI Concierge chat assistant are processed through our backend API to generate helpful responses. Please avoid sharing sensitive payment card numbers or confidential personal data inside chat messages or form notes.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  4. Browser Preferences &amp; Contact
                </h3>
                <p>
                  Our website stores your intro sound mute preference locally in your browser so your audio setting is remembered on return visits. If you have questions about your submitted booking or contact information, please contact us at{' '}
                  <a
                    href={`mailto:${BUSINESS_CONFIG.email}`}
                    className="text-sky-400 hover:underline font-medium"
                  >
                    {BUSINESS_CONFIG.email}
                  </a>
                  .
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  1. Booking Requests &amp; Team Confirmation
                </h3>
                <p>
                  Submitting the online booking form creates a service request, not an automatically confirmed appointment. Your preferred date, preferred time, and service location are subject to review and manual confirmation by the {BUSINESS_CONFIG.name} team.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  2. Water &amp; Electricity Requirements
                </h3>
                <p>
                  On-site water access and electrical power are required for our standard mobile detailing service. If either water or electricity is marked &ldquo;No&rdquo; on your booking request, your request will be flagged as <strong>Availability Verification Required</strong>. Our team will review your location and contact you to confirm whether service can be arranged before confirming any appointment.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  3. Packages, Pricing &amp; Walkthrough Inspection
                </h3>
                <p>
                  Published package rates apply to standard service packages selected on our website. No advance payment is collected through the website form; payment is collected after completion of the service and your walkthrough inspection.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  4. Rescheduling &amp; Questions
                </h3>
                <p>
                  If you need to update, reschedule, or cancel a pending request, please reach out directly by email at{' '}
                  <a
                    href={`mailto:${BUSINESS_CONFIG.email}`}
                    className="text-sky-400 hover:underline font-medium"
                  >
                    {BUSINESS_CONFIG.email}
                  </a>
                  .
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3.5 border-t border-neutral-800 bg-[#090b10] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{BUSINESS_CONFIG.email}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
