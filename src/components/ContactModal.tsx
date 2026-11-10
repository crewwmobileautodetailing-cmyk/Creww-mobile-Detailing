import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { sendContactEmail } from '../services/emailService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subject, setSubject] = useState('General Question');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name';
    }

    if (!emailAddress.trim()) {
      errs.emailAddress = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      errs.emailAddress = 'Please enter a valid email address';
    }

    if (!message.trim()) {
      errs.message = 'Please enter your message or question';
    } else if (message.trim().length < 10) {
      errs.message = 'Please provide a few more details (minimum 10 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    setErrorMessage(null);
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await sendContactEmail({
        fullName: fullName.trim(),
        emailAddress: emailAddress.trim(),
        phoneNumber: phoneNumber.trim(),
        subject,
        message: message.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to send message. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFullName('');
    setEmailAddress('');
    setPhoneNumber('');
    setSubject('General Question');
    setMessage('');
    setErrors({});
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#0c0e15] border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-content">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-[#090b10] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={BUSINESS_CONFIG.officialBadgePath}
              alt="CREWW Official Badge"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide leading-tight">
                CONTACT DISPATCH TEAM
              </h2>
              <p className="text-[11px] text-neutral-400">
                Direct inquiry to CREWW Mobile Detailing specialists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close contact modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                  Delivered To Dispatch
                </span>
                <h3 className="font-heading text-2xl font-black text-white uppercase tracking-tight mt-1">
                  MESSAGE SENT SUCCESSFULLY
                </h3>
                <p className="text-xs text-neutral-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{fullName}</strong>. Your inquiry has been delivered directly to our dispatch inbox. A team member will respond to <strong className="text-white">{emailAddress}</strong> promptly.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/40 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold block">Transmission Failed</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Full Name <span className="text-sky-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. John Miller"
                    disabled={isSubmitting}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#07080b] border ${
                      errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-700 focus:border-sky-500'
                    } text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Email Address <span className="text-sky-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        if (errors.emailAddress) setErrors((prev) => ({ ...prev, emailAddress: '' }));
                      }}
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#07080b] border ${
                        errors.emailAddress ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-700 focus:border-sky-500'
                      } text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none`}
                    />
                  </div>
                  {errors.emailAddress && <p className="text-[11px] text-rose-400 mt-1">{errors.emailAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(555) 000-0000"
                      disabled={isSubmitting}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#07080b] border border-neutral-700 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#07080b] border border-neutral-700 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="General Question">General Question</option>
                  <option value="Fleet & Multi-Vehicle Detailing">Fleet & Multi-Vehicle Detailing</option>
                  <option value="Location & Service Area Question">Location & Service Area Question</option>
                  <option value="Pricing & Custom Quote">Pricing & Custom Quote</option>
                  <option value="Reschedule / Existing Appointment">Reschedule / Existing Appointment</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Message / Question <span className="text-sky-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    placeholder="Describe how we can help you with your vehicle detailing..."
                    disabled={isSubmitting}
                    className={`w-full p-3 rounded-xl bg-[#07080b] border ${
                      errors.message ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-700 focus:border-sky-500'
                    } text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none resize-none`}
                  />
                </div>
                {errors.message && <p className="text-[11px] text-rose-400 mt-1">{errors.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending To Dispatch via EmailJS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SEND INQUIRY TO DISPATCH</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  Responses typically delivered within 2 hours · Direct dispatch inbox
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
