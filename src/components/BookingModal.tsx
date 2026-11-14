import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { CompactDateTimePicker } from './CompactDateTimePicker';
import { sendBookingEmails } from '../services/emailService';
import { OptimizedImage } from './OptimizedImage';

export type AvailabilityStatus =
  | 'Availability Verification Required'
  | 'Utilities Available — Pending Team Confirmation';

export interface BookingSubmissionData {
  id: string;
  timestamp: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceId: string;
  serviceName: string;
  price: number;
  savings: number;
  preferredDate: string;
  preferredTime: string;
  serviceAddress: string;
  city: string;
  state: string;
  zipCode: string;
  waterAvailability: 'yes' | 'no';
  electricityAvailability: 'yes' | 'no';
  availabilityStatus: AvailabilityStatus;
  waterConfirmed?: boolean;
  electricityConfirmed?: boolean;
  additionalNotes: string;
  emailStatus?: {
    adminSent: boolean;
    customerSent: boolean;
    partialNotice?: string;
  };
}

interface BookingModalProps {
  isOpen: boolean;
  initialServiceId?: string;
  initialZipCode?: string;
  initialCity?: string;
  initialState?: string;
  onClose: () => void;
}

const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialServiceId,
  initialZipCode,
  initialCity,
  initialState,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Customer details
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Vehicle details
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  // Service package selection (Default to Full Detailing - Best Value)
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || 'full-detailing'
  );

  // Appointment details
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const [preferredDate, setPreferredDate] = useState(defaultDate);
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [serviceAddress, setServiceAddress] = useState('');
  const [city, setCity] = useState(initialCity || '');
  const [state, setState] = useState(initialState || '');
  const [zipCode, setZipCode] = useState(initialZipCode || '');

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Water & Electricity Availability selections (Required, 'no' triggers manual verification and never blocks booking)
  const [waterAvailability, setWaterAvailability] = useState<'yes' | 'no' | ''>('');
  const [electricityAvailability, setElectricityAvailability] = useState<'yes' | 'no' | ''>('');

  // Status & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<BookingSubmissionData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync initial props when opened or changed
  useEffect(() => {
    if (initialServiceId) setSelectedServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    if (initialZipCode) {
      setZipCode(initialZipCode);
      if (initialCity) setCity(initialCity);
      if (initialState) setState(initialState);
    }
  }, [initialZipCode, initialCity, initialState]);

  // Handle escape key, focus management, and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, isSubmitting, onClose]);

  // Active package
  const activePackage =
    BUSINESS_CONFIG.packages.find((p) => p.id === selectedServiceId) ||
    BUSINESS_CONFIG.packages[2];

  const requiresAvailabilityVerification =
    waterAvailability === 'no' || electricityAvailability === 'no';

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required.';

    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      errs.phoneNumber = 'Valid 10-digit customer phone number is required.';
    }

    if (!emailAddress.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      errs.emailAddress = 'Valid email address is required.';
    }

    if (!vehicleMake.trim()) errs.vehicleMake = 'Vehicle make is required.';
    if (!vehicleModel.trim()) errs.vehicleModel = 'Vehicle model is required.';
    if (!vehicleYear.trim() || !/^(19|20)\d{2}$/.test(vehicleYear.trim())) {
      errs.vehicleYear = 'Valid 4-digit year is required.';
    }

    if (!preferredDate) {
      errs.preferredDate = 'Please select your preferred date.';
    }
    if (!preferredTime || !preferredTime.trim()) {
      errs.preferredTime = 'Please select or enter your preferred time.';
    }

    if (!serviceAddress.trim()) errs.serviceAddress = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!state.trim() || !/^[A-Za-z]{2}$/.test(state.trim())) {
      errs.state = '2-letter state code required.';
    }

    // Strict US ZIP Code format validation (5-digit or ZIP+4; independent from homepage checker; no geographic restrictions)
    const trimmedZip = zipCode.trim();
    if (!trimmedZip) {
      errs.zipCode = 'ZIP code is required.';
    } else if (!US_ZIP_REGEX.test(trimmedZip)) {
      errs.zipCode = 'Enter a valid 5-digit US ZIP code (e.g. 90210 or 90210-1234).';
    }

    // Water & Electricity Availability Selections (Required, but 'no' never blocks submission)
    if (!waterAvailability) {
      errs.waterAvailability = 'Please select water availability.';
    }
    if (!electricityAvailability) {
      errs.electricityAvailability = 'Please select electricity availability.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmissionError(null);
    if (!validate()) return;

    setIsSubmitting(true);

    const submissionId = `CRW-${Math.floor(10000 + Math.random() * 90000)}`;
    const availabilityStatus: AvailabilityStatus =
      waterAvailability === 'no' || electricityAvailability === 'no'
        ? 'Availability Verification Required'
        : 'Utilities Available — Pending Team Confirmation';

    const submissionPayload = {
      id: submissionId,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      emailAddress: emailAddress.trim(),
      vehicleMake: vehicleMake.trim(),
      vehicleModel: vehicleModel.trim(),
      vehicleYear: vehicleYear.trim(),
      serviceId: selectedServiceId,
      serviceName: activePackage.name,
      price: activePackage.offerPrice,
      savings: activePackage.savings,
      preferredDate,
      preferredTime: preferredTime.trim(),
      serviceAddress: serviceAddress.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zipCode: zipCode.trim(),
      waterAvailability: waterAvailability as 'yes' | 'no',
      electricityAvailability: electricityAvailability as 'yes' | 'no',
      waterConfirmed: waterAvailability === 'yes',
      electricityConfirmed: electricityAvailability === 'yes',
      additionalNotes: additionalNotes.trim(),
    };

    try {
      // Send EmailJS Admin Notification & Customer Auto-Reply
      const emailResult = await sendBookingEmails(submissionPayload);

      if (!emailResult.success) {
        setSubmissionError(
          "Something went wrong. We couldn't submit your request. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      const submission: BookingSubmissionData = {
        ...submissionPayload,
        availabilityStatus,
        timestamp: new Date().toISOString(),
        emailStatus: {
          adminSent: emailResult.adminSent,
          customerSent: emailResult.customerSent,
          partialNotice: emailResult.partialNotice,
        },
      };

      setSubmittedData(submission);
    } catch {
      setSubmissionError("Something went wrong. We couldn't submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setSubmissionError(null);
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear('');
    setServiceAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setAdditionalNotes('');
    setWaterAvailability('');
    setElectricityAvailability('');
    setErrors({});
  };

  const handleSelectWater = (val: 'yes' | 'no') => {
    setWaterAvailability(val);
    clearFieldError('waterAvailability');
  };

  const handleSelectElectricity = (val: 'yes' | 'no') => {
    setElectricityAvailability(val);
    clearFieldError('electricityAvailability');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] bg-[#0c0e15] border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-content">
        {/* Compact Header with Official Logo Badge */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-neutral-800 bg-[#090b10] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <OptimizedImage
              src={BUSINESS_CONFIG.officialBadgePath}
              alt="CREWW Official Badge"
              className="h-8 w-auto object-contain shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="booking-modal-title"
                className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide leading-tight truncate"
              >
                BOOK MOBILE DETAILING
              </h2>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Mobile detailing at your driveway or workplace (water &amp; electricity required)
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 disabled:opacity-50"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Compact Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {submittedData ? (
            /* Confirmation Screen */
            <div className="py-4 sm:py-6 text-center max-w-lg mx-auto space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-widest block">
                  Request Reference #{submittedData.id}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Thank You! Your Request Has Been Received.
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {submittedData.availabilityStatus === 'Availability Verification Required'
                    ? 'Your request has been flagged for Availability Verification Required because water or electricity was marked unavailable. Our team will review utility arrangements with you before confirming any appointment.'
                    : 'Your request has been submitted to CREWW MOBILE AUTO DETAILING. Our team will review your location, utility details, and preferred time before confirming your appointment.'}
                </p>
              </div>

              {/* Order Recap */}
              <div className="p-4 rounded-xl bg-[#07080b] border border-neutral-800 text-left text-xs space-y-2">
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Selected Service:</span>
                  <span className="font-bold text-white text-right">{submittedData.serviceName}</span>
                </div>
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Vehicle:</span>
                  <span className="font-medium text-white text-right">
                    {submittedData.vehicleYear} {submittedData.vehicleMake} {submittedData.vehicleModel}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Preferred Appointment:</span>
                  <span className="font-medium text-white text-right">
                    {submittedData.preferredDate} at {submittedData.preferredTime}
                    <span className="block text-[10px] text-sky-400 font-normal">
                      Subject to confirmation by our team
                    </span>
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Water Availability:</span>
                  <span
                    className={`font-medium text-right ${
                      submittedData.waterAvailability === 'yes' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {submittedData.waterAvailability === 'yes'
                      ? 'Yes, water is available.'
                      : 'No, water is not available.'}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Electricity Availability:</span>
                  <span
                    className={`font-medium text-right ${
                      submittedData.electricityAvailability === 'yes'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {submittedData.electricityAvailability === 'yes'
                      ? 'Yes, electricity is available.'
                      : 'No, electricity is not available.'}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Availability Status:</span>
                  <span
                    className={`font-bold text-right ${
                      submittedData.availabilityStatus === 'Availability Verification Required'
                        ? 'text-amber-400'
                        : 'text-sky-400'
                    }`}
                  >
                    {submittedData.availabilityStatus}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400 shrink-0">Service Location:</span>
                  <span className="font-medium text-white text-right">
                    {submittedData.serviceAddress}, {submittedData.city}, {submittedData.state}{' '}
                    {submittedData.zipCode}
                  </span>
                </div>
                <div className="flex justify-between pt-1 items-baseline gap-2">
                  <div>
                    <span className="text-sky-400 font-bold block text-xs">
                      Due At Walkthrough Inspection:
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      Saved ${submittedData.savings} off regular rate
                    </span>
                  </div>
                  <span className="font-heading text-2xl font-black text-white font-mono">
                    ${submittedData.price}
                  </span>
                </div>
              </div>

              {/* Email Delivery Status */}
              {submittedData.emailStatus?.customerSent ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Confirmation auto-reply delivered to{' '}
                    <strong className="text-white break-all">{submittedData.emailAddress}</strong>
                  </span>
                </div>
              ) : submittedData.emailStatus?.partialNotice ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">Dispatch Notification Delivered</span>
                    <span className="text-[11px] leading-relaxed">
                      {submittedData.emailStatus.partialNotice}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer min-h-[44px]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all cursor-pointer shadow-md min-h-[44px]"
                >
                  Book Another Vehicle
                </button>
              </div>
            </div>
          ) : (
            /* Clean Compact Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {submissionError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">Transmission Error</span>
                    <span>{submissionError}</span>
                  </div>
                </div>
              )}

              {/* Package Selector: Stack gracefully on < 640px, 3 columns on sm+ */}
              <div>
                <span
                  id="booking-package-label"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5"
                >
                  Select Detailing Package *
                </span>
                <div
                  role="group"
                  aria-labelledby="booking-package-label"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  {BUSINESS_CONFIG.packages.map((pkg) => {
                    const isSelected = selectedServiceId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedServiceId(pkg.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex sm:block items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-400 shadow-sm'
                            : 'bg-[#07080b] border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block sm:block truncate ${
                              pkg.isBestValue ? 'bg-sky-500 text-white' : 'bg-neutral-800 text-sky-400'
                            }`}
                          >
                            {pkg.isBestValue ? 'Best Value' : `Save $${pkg.savings}`}
                          </span>
                          <span className="font-heading text-xs sm:text-sm font-bold text-white uppercase block mt-1 truncate">
                            {pkg.name}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5 shrink-0">
                          <span className="text-[10px] text-neutral-500 line-through">
                            ${pkg.regularPrice}
                          </span>
                          <span className="font-mono text-sm sm:text-base font-black text-white">
                            ${pkg.offerPrice}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="booking-full-name"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    Customer Full Name *
                  </label>
                  <input
                    id="booking-full-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearFieldError('fullName');
                    }}
                    placeholder="Alex Morgan"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'booking-full-name-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.fullName ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.fullName && (
                    <p id="booking-full-name-error" role="alert" className="text-red-400 text-[10px] mt-0.5">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      clearFieldError('phoneNumber');
                    }}
                    placeholder="(555) 234-5678"
                    aria-invalid={Boolean(errors.phoneNumber)}
                    aria-describedby={errors.phoneNumber ? 'booking-phone-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p id="booking-phone-error" role="alert" className="text-red-400 text-[10px] mt-0.5">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Year Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-email"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    autoComplete="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      clearFieldError('emailAddress');
                    }}
                    placeholder="alex@domain.com"
                    aria-invalid={Boolean(errors.emailAddress)}
                    aria-describedby={errors.emailAddress ? 'booking-email-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.emailAddress ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.emailAddress && (
                    <p id="booking-email-error" role="alert" className="text-red-400 text-[10px] mt-0.5">
                      {errors.emailAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-vehicle-year"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    Vehicle Year *
                  </label>
                  <input
                    id="booking-vehicle-year"
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    value={vehicleYear}
                    onChange={(e) => {
                      setVehicleYear(e.target.value);
                      clearFieldError('vehicleYear');
                    }}
                    placeholder="2024"
                    aria-invalid={Boolean(errors.vehicleYear)}
                    aria-describedby={errors.vehicleYear ? 'booking-vehicle-year-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.vehicleYear ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.vehicleYear && (
                    <p
                      id="booking-vehicle-year-error"
                      role="alert"
                      className="text-red-400 text-[10px] mt-0.5"
                    >
                      {errors.vehicleYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Make & Model Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="booking-vehicle-make"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    Vehicle Make *
                  </label>
                  <input
                    id="booking-vehicle-make"
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => {
                      setVehicleMake(e.target.value);
                      clearFieldError('vehicleMake');
                    }}
                    placeholder="e.g. Porsche, Tesla, BMW"
                    aria-invalid={Boolean(errors.vehicleMake)}
                    aria-describedby={errors.vehicleMake ? 'booking-vehicle-make-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.vehicleMake ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.vehicleMake && (
                    <p
                      id="booking-vehicle-make-error"
                      role="alert"
                      className="text-red-400 text-[10px] mt-0.5"
                    >
                      {errors.vehicleMake}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-vehicle-model"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    Vehicle Model *
                  </label>
                  <input
                    id="booking-vehicle-model"
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => {
                      setVehicleModel(e.target.value);
                      clearFieldError('vehicleModel');
                    }}
                    placeholder="e.g. 911 GT3, Model S, M5"
                    aria-invalid={Boolean(errors.vehicleModel)}
                    aria-describedby={errors.vehicleModel ? 'booking-vehicle-model-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.vehicleModel ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.vehicleModel && (
                    <p
                      id="booking-vehicle-model-error"
                      role="alert"
                      className="text-red-400 text-[10px] mt-0.5"
                    >
                      {errors.vehicleModel}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer-Selected Appointment Date & Time */}
              <div>
                <CompactDateTimePicker
                  selectedDate={preferredDate}
                  selectedTime={preferredTime}
                  onDateChange={(d) => {
                    setPreferredDate(d);
                    clearFieldError('preferredDate');
                  }}
                  onTimeChange={(t) => {
                    setPreferredTime(t);
                    clearFieldError('preferredTime');
                  }}
                  error={errors.preferredDate}
                  timeError={errors.preferredTime}
                />
              </div>

              {/* Service Address Row */}
              <div>
                <label
                  htmlFor="booking-service-address"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  On-Site Service Address *
                </label>
                <input
                  id="booking-service-address"
                  type="text"
                  autoComplete="street-address"
                  value={serviceAddress}
                  onChange={(e) => {
                    setServiceAddress(e.target.value);
                    clearFieldError('serviceAddress');
                  }}
                  placeholder="Street Address, Driveway, or Building Parking"
                  aria-invalid={Boolean(errors.serviceAddress)}
                  aria-describedby={errors.serviceAddress ? 'booking-service-address-error' : undefined}
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    errors.serviceAddress ? 'border-red-500' : 'border-neutral-700'
                  }`}
                />
                {errors.serviceAddress && (
                  <p
                    id="booking-service-address-error"
                    role="alert"
                    className="text-red-400 text-[10px] mt-0.5"
                  >
                    {errors.serviceAddress}
                  </p>
                )}
              </div>

              {/* US ZIP Code, City, State (Responsive stack on mobile, 5-column split on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-zip"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    ZIP Code *
                  </label>
                  <input
                    id="booking-zip"
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={zipCode}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9-]/g, '');
                      setZipCode(sanitized);
                      clearFieldError('zipCode');
                    }}
                    placeholder="e.g. 90210"
                    aria-invalid={Boolean(errors.zipCode)}
                    aria-describedby={errors.zipCode ? 'booking-zip-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono tracking-wider ${
                      errors.zipCode ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.zipCode && (
                    <p
                      id="booking-zip-error"
                      role="alert"
                      className="text-red-400 text-[10px] mt-0.5 leading-tight"
                    >
                      {errors.zipCode}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-city"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    City *
                  </label>
                  <input
                    id="booking-city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldError('city');
                    }}
                    placeholder="e.g. Austin"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'booking-city-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.city ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.city && (
                    <p id="booking-city-error" role="alert" className="text-red-400 text-[10px] mt-0.5">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="booking-state"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                  >
                    State *
                  </label>
                  <input
                    id="booking-state"
                    type="text"
                    maxLength={2}
                    autoComplete="address-level1"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase());
                      clearFieldError('state');
                    }}
                    placeholder="TX"
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={errors.state ? 'booking-state-error' : undefined}
                    className={`w-full px-3 py-2.5 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono uppercase ${
                      errors.state ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.state && (
                    <p id="booking-state-error" role="alert" className="text-red-400 text-[10px] mt-0.5">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  Specific Requests or Gate Code (Optional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Gate instructions, vehicle color, parking space specifics..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07080b] border border-neutral-700 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Water & Electricity Location Availability (Required fields, 'No' triggers manual review and never blocks submission) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-[#0a0d14] to-blue-950/40 border border-sky-500/30 space-y-3.5">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0 mt-0.5">
                    !
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Water &amp; Electricity Availability (Required for Service)
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-snug mt-0.5">
                      Water and electricity are required for our standard mobile detailing service. Please answer both questions below. Selecting &ldquo;No&rdquo; will not block your submission — our team will flag your request for availability verification before confirming your appointment.
                    </p>
                  </div>
                </div>

                {/* Water Availability Field */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 min-h-[18px]">
                    <span
                      id="water-availability-label"
                      className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300"
                    >
                      Water Availability *
                    </span>
                    {errors.waterAvailability && (
                      <span
                        role="alert"
                        className="text-red-400 text-[10px] flex items-center gap-1 font-medium"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.waterAvailability}
                      </span>
                    )}
                  </div>
                  <div
                    role="radiogroup"
                    aria-labelledby="water-availability-label"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={waterAvailability === 'yes'}
                      onClick={() => handleSelectWater('yes')}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-colors select-none ${
                        waterAvailability === 'yes'
                          ? 'bg-sky-500/15 border-sky-400 text-white shadow-sm shadow-sky-500/20'
                          : 'bg-[#07080b] border-neutral-700/80 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          waterAvailability === 'yes'
                            ? 'border-sky-400 bg-sky-500'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {waterAvailability === 'yes' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs font-medium">Yes, water is available.</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={waterAvailability === 'no'}
                      onClick={() => handleSelectWater('no')}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-colors select-none ${
                        waterAvailability === 'no'
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm shadow-amber-500/20'
                          : 'bg-[#07080b] border-neutral-700/80 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          waterAvailability === 'no'
                            ? 'border-amber-400 bg-amber-500'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {waterAvailability === 'no' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs font-medium">No, water is not available.</span>
                    </button>
                  </div>
                </div>

                {/* Electricity Availability Field */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 min-h-[18px]">
                    <span
                      id="electricity-availability-label"
                      className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300"
                    >
                      Electricity Availability *
                    </span>
                    {errors.electricityAvailability && (
                      <span
                        role="alert"
                        className="text-red-400 text-[10px] flex items-center gap-1 font-medium"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.electricityAvailability}
                      </span>
                    )}
                  </div>
                  <div
                    role="radiogroup"
                    aria-labelledby="electricity-availability-label"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={electricityAvailability === 'yes'}
                      onClick={() => handleSelectElectricity('yes')}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-colors select-none ${
                        electricityAvailability === 'yes'
                          ? 'bg-sky-500/15 border-sky-400 text-white shadow-sm shadow-sky-500/20'
                          : 'bg-[#07080b] border-neutral-700/80 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          electricityAvailability === 'yes'
                            ? 'border-sky-400 bg-sky-500'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {electricityAvailability === 'yes' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs font-medium">Yes, electricity is available.</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={electricityAvailability === 'no'}
                      onClick={() => handleSelectElectricity('no')}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-colors select-none ${
                        electricityAvailability === 'no'
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm shadow-amber-500/20'
                          : 'bg-[#07080b] border-neutral-700/80 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          electricityAvailability === 'no'
                            ? 'border-amber-400 bg-amber-500'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {electricityAvailability === 'no' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-xs font-medium">No, electricity is not available.</span>
                    </button>
                  </div>
                </div>

                {/* Inline Status Callout when No is selected */}
                {requiresAvailabilityVerification && (
                  <div
                    role="status"
                    className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-200 text-[11px] flex items-start gap-2 animate-fade-in"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Availability Verification Required:</strong> You can still submit this request. Our team will review your location&apos;s utility setup and contact you before confirming an appointment.
                    </span>
                  </div>
                )}
              </div>

              {/* Compact Submit Row */}
              <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex sm:block items-baseline justify-between">
                  <span className="text-[10px] uppercase text-neutral-400 block font-semibold">
                    Payable After Inspection:
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-2xl font-black text-white font-mono">
                      ${activePackage.offerPrice}
                    </span>
                    <span className="text-[11px] text-neutral-500 line-through">
                      ${activePackage.regularPrice}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold ml-1">
                      Save ${activePackage.savings}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-md shadow-sky-500/25 border border-sky-400/30 cursor-pointer disabled:opacity-50 whitespace-nowrap min-h-[44px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Submitting your request...</span>
                    </>
                  ) : (
                    <span>SUBMIT BOOKING REQUEST</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
