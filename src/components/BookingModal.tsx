import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Tag, Loader2, MapPin, AlertCircle, Mail, Send } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { CompactDateTimePicker } from './CompactDateTimePicker';
import { validateUsZipCode } from '../services/zipValidationService';
import { sendBookingEmails } from '../services/emailService';

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
  waterConfirmed: boolean;
  electricityConfirmed: boolean;
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

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialServiceId,
  initialZipCode,
  initialCity,
  initialState,
  onClose,
}) => {
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
  const [preferredTime, setPreferredTime] = useState('09:30 AM');
  const [serviceAddress, setServiceAddress] = useState('');
  const [city, setCity] = useState(initialCity || '');
  const [state, setState] = useState(initialState || '');
  const [zipCode, setZipCode] = useState(initialZipCode || '');

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Service requirements confirmation (Mandatory)
  const [waterConfirmed, setWaterConfirmed] = useState(false);
  const [electricityConfirmed, setElectricityConfirmed] = useState(false);

  // Status & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isValidatingZip, setIsValidatingZip] = useState(false);
  const [zipValidationStatus, setZipValidationStatus] = useState<string | null>(null);
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

  // Handle escape key and body scroll lock
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

  // Active package
  const activePackage = BUSINESS_CONFIG.packages.find(
    (p) => p.id === selectedServiceId
  ) || BUSINESS_CONFIG.packages[2];

  // Real-time ZIP Code verification handler when leaving ZIP field
  const handleZipBlur = async () => {
    const clean = zipCode.replace(/\D/g, '');
    if (clean.length === 5) {
      setIsValidatingZip(true);
      const res = await validateUsZipCode(clean);
      setIsValidatingZip(false);

      if (!res.isValidUsZip) {
        setErrors((prev) => ({ ...prev, zipCode: res.message }));
        setZipValidationStatus(null);
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.zipCode;
          return updated;
        });
        if (res.city && !city) setCity(res.city);
        if (res.stateAbbr && !state) setState(res.stateAbbr);
        setZipValidationStatus(res.isServiceable ? 'Standard Service Zone' : 'Custom Route Zone');
      }
    }
  };

  const validate = async (): Promise<boolean> => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      errs.phoneNumber = 'Valid 10-digit customer phone number is required.';
    }

    if (!emailAddress.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      errs.emailAddress = 'Valid email address is required.';
    }

    if (!vehicleMake.trim()) errs.vehicleMake = 'Vehicle make is required.';
    if (!vehicleModel.trim()) errs.vehicleModel = 'Vehicle model is required.';
    if (!vehicleYear.trim() || !/^(19|20)\d{2}$/.test(vehicleYear.trim())) {
      errs.vehicleYear = 'Valid 4-digit year is required.';
    }

    if (!preferredDate) errs.preferredDate = 'Appointment date is required.';
    if (!preferredTime) errs.preferredTime = 'Appointment time is required.';
    if (!serviceAddress.trim()) errs.serviceAddress = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!state.trim()) errs.state = 'State is required.';

    // Strict US ZIP Validation
    const cleanZip = zipCode.replace(/\D/g, '');
    if (!cleanZip || cleanZip.length !== 5) {
      errs.zipCode = 'Valid 5-digit US ZIP code is required.';
    } else {
      setIsValidatingZip(true);
      const zipRes = await validateUsZipCode(cleanZip);
      setIsValidatingZip(false);
      if (!zipRes.isValidUsZip) {
        errs.zipCode = zipRes.message;
      }
    }

    // Water & Electricity Location Requirements (Mandatory)
    if (!waterConfirmed) {
      errs.waterConfirmed = 'Please confirm that water will be available at your service location.';
    }
    if (!electricityConfirmed) {
      errs.electricityConfirmed = 'Please confirm that electricity will be available at your service location.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmissionError(null);
    const isValid = await validate();
    if (!isValid) return;

    setIsSubmitting(true);

    const submissionId = `CRW-${Math.floor(10000 + Math.random() * 90000)}`;
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
      preferredTime,
      serviceAddress: serviceAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      waterConfirmed,
      electricityConfirmed,
      additionalNotes: additionalNotes.trim(),
    };

    try {
      // Step 1 & Step 2: Send EmailJS Admin Notification & Customer Auto-Reply
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
        timestamp: new Date().toISOString(),
        emailStatus: {
          adminSent: emailResult.adminSent,
          customerSent: emailResult.customerSent,
          partialNotice: emailResult.partialNotice,
        },
      };

      try {
        const existingRaw = localStorage.getItem('creww_booking_requests');
        const existing: BookingSubmissionData[] = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem('creww_booking_requests', JSON.stringify([submission, ...existing]));
      } catch {
        // fallback
      }

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
    setZipValidationStatus(null);
    setAdditionalNotes('');
    setWaterConfirmed(false);
    setElectricityConfirmed(false);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c0e15] border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-content">
        
        {/* Compact Header with Official Logo Badge */}
        <div className="px-5 py-3.5 border-b border-neutral-800 bg-[#090b10] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={BUSINESS_CONFIG.officialBadgePath}
              alt="CREWW Official Badge"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide leading-tight">
                BOOK MOBILE DETAILING
              </h2>
              <p className="text-[11px] text-neutral-400">
                Self-contained units dispatched to your driveway or workplace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Compact Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {submittedData ? (
            /* Confirmation Screen */
            <div className="py-6 text-center max-w-lg mx-auto space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-widest block">
                  Reservation Reference #{submittedData.id}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Thank You! Your Request Has Been Received.
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  Your request has been successfully submitted to CREWW MOBILE AUTO DETAILING. Our team will review your details and contact you shortly.
                </p>
              </div>

              {/* Order Recap */}
              <div className="p-4 rounded-xl bg-[#07080b] border border-neutral-800 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400">Selected Service:</span>
                  <span className="font-bold text-white">{submittedData.serviceName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400">Vehicle:</span>
                  <span className="font-medium text-white">
                    {submittedData.vehicleYear} {submittedData.vehicleMake} {submittedData.vehicleModel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400">Scheduled Time:</span>
                  <span className="font-medium text-white">
                    {submittedData.preferredDate} at {submittedData.preferredTime}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                  <span className="text-neutral-400">Service Location:</span>
                  <span className="font-medium text-white">
                    {submittedData.serviceAddress}, {submittedData.city}, {submittedData.state} {submittedData.zipCode}
                  </span>
                </div>
                <div className="flex justify-between pt-1 items-baseline">
                  <div>
                    <span className="text-sky-400 font-bold block text-xs">Due At Walkthrough Inspection:</span>
                    <span className="text-[10px] text-emerald-400">Saved ${submittedData.savings} off regular rate</span>
                  </div>
                  <span className="font-heading text-2xl font-black text-white font-mono">
                    ${submittedData.price}
                  </span>
                </div>
              </div>

              {/* Email Delivery Status (Strict handling of partial failure per Rule 10) */}
              {submittedData.emailStatus?.customerSent ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Confirmation auto-reply delivered to <strong className="text-white">{submittedData.emailAddress}</strong></span>
                </div>
              ) : submittedData.emailStatus?.partialNotice ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">Dispatch Notification Delivered</span>
                    <span className="text-[11px] leading-relaxed">{submittedData.emailStatus.partialNotice}</span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all cursor-pointer shadow-md"
                >
                  Book Another Vehicle
                </button>
              </div>
            </div>
          ) : (
            /* Clean Compact Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {submissionError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">Transmission Error</span>
                    <span>{submissionError}</span>
                  </div>
                </div>
              )}
              
              {/* Package Selector: Exactly 3 Compact Cards */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Select Detailing Package *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BUSINESS_CONFIG.packages.map((pkg) => {
                    const isSelected = selectedServiceId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedServiceId(pkg.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-400 shadow-sm'
                            : 'bg-[#07080b] border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded block truncate ${
                          pkg.isBestValue ? 'bg-sky-500 text-white' : 'bg-neutral-800 text-sky-400'
                        }`}>
                          {pkg.isBestValue ? 'Best Value' : `Save $${pkg.savings}`}
                        </span>
                        <span className="font-heading text-xs sm:text-sm font-bold text-white uppercase block mt-1 truncate">
                          {pkg.name}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
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

              {/* Customer Row (2 columns desktop, 1 col mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.fullName ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 234-5678"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Email & Year Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="alex@domain.com"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.emailAddress ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.emailAddress && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.emailAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Vehicle Year *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="2024"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.vehicleYear ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.vehicleYear && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.vehicleYear}</p>
                  )}
                </div>
              </div>

              {/* Vehicle Make & Model Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Vehicle Make *
                  </label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="e.g. Porsche, Tesla, BMW"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.vehicleMake ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.vehicleMake && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.vehicleMake}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. 911 GT3, Model S, M5"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.vehicleModel ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.vehicleModel && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.vehicleModel}</p>
                  )}
                </div>
              </div>

              {/* Compact Date & Time Popovers */}
              <div>
                <CompactDateTimePicker
                  selectedDate={preferredDate}
                  selectedTime={preferredTime}
                  onDateChange={(d) => setPreferredDate(d)}
                  onTimeChange={(t) => setPreferredTime(t)}
                  error={errors.preferredDate}
                />
              </div>

              {/* Service Address Row */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  On-Site Service Address *
                </label>
                <input
                  type="text"
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Street Address, Driveway, or Building Parking"
                  className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    errors.serviceAddress ? 'border-red-500' : 'border-neutral-700'
                  }`}
                />
                {errors.serviceAddress && (
                  <p className="text-red-400 text-[10px] mt-0.5">{errors.serviceAddress}</p>
                )}
              </div>

              {/* Real US ZIP Code, City, State in 3 columns */}
              <div className="grid grid-cols-5 gap-2.5">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      US ZIP Code *
                    </label>
                    {isValidatingZip && (
                      <span className="flex items-center gap-1 text-[9px] text-sky-400">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Verifying...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    inputMode="numeric"
                    value={zipCode}
                    onBlur={handleZipBlur}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setZipCode(val);
                      if (errors.zipCode) {
                        setErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.zipCode;
                          return updated;
                        });
                      }
                    }}
                    placeholder="90210"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono tracking-wider ${
                      errors.zipCode ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-400 text-[10px] mt-0.5 leading-tight">{errors.zipCode}</p>
                  )}
                  {zipValidationStatus && !errors.zipCode && (
                    <p className="text-emerald-400 text-[10px] mt-0.5 font-medium">✓ {zipValidationStatus}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Austin"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      errors.city ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.city}</p>
                  )}
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="TX"
                    className={`w-full px-3 py-2 rounded-lg bg-[#07080b] border text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono uppercase ${
                      errors.state ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {errors.state && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.state}</p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Specific Requests or Gate Code (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Gate instructions, vehicle color, parking space specifics..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#07080b] border border-neutral-700 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Water & Electricity Location Requirements (Mandatory Confirmation) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-[#0a0d14] to-blue-950/40 border border-sky-500/30 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">
                    !
                  </div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Service Location Requirements (Water & Electricity)
                  </h4>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Our mobile detailing service requires access to water and electricity at your service location. Please confirm both utilities will be accessible for our technicians:
                </p>

                <div className="space-y-2 pt-1">
                  {/* Water Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={waterConfirmed}
                      onChange={(e) => {
                        setWaterConfirmed(e.target.checked);
                        if (e.target.checked && errors.waterConfirmed) {
                          setErrors((prev) => {
                            const upd = { ...prev };
                            delete upd.waterConfirmed;
                            return upd;
                          });
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer accent-sky-500 shrink-0"
                    />
                    <span className="text-xs text-neutral-200 group-hover:text-white select-none transition-colors">
                      I confirm that <strong className="text-sky-300">water</strong> will be available at my service location.
                    </span>
                  </label>
                  {errors.waterConfirmed && (
                    <p className="text-red-400 text-[10px] pl-6.5 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.waterConfirmed}
                    </p>
                  )}

                  {/* Electricity Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={electricityConfirmed}
                      onChange={(e) => {
                        setElectricityConfirmed(e.target.checked);
                        if (e.target.checked && errors.electricityConfirmed) {
                          setErrors((prev) => {
                            const upd = { ...prev };
                            delete upd.electricityConfirmed;
                            return upd;
                          });
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer accent-sky-500 shrink-0"
                    />
                    <span className="text-xs text-neutral-200 group-hover:text-white select-none transition-colors">
                      I confirm that <strong className="text-sky-300">electricity</strong> will be available at my service location.
                    </span>
                  </label>
                  {errors.electricityConfirmed && (
                    <p className="text-red-400 text-[10px] pl-6.5 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.electricityConfirmed}
                    </p>
                  )}
                </div>
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
                  disabled={isSubmitting || isValidatingZip}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-md shadow-sky-500/25 border border-sky-400/30 cursor-pointer disabled:opacity-50 whitespace-nowrap min-h-[44px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Submitting your request...</span>
                    </>
                  ) : (
                    <span>CONFIRM RESERVATION</span>
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
