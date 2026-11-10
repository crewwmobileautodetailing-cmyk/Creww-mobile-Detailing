import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2, Copy, FileText, Shield, Trash2, Calendar, Car, MapPin } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { BookingSubmissionData } from './BookingModal';

interface EmailIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailIntegrationModal: React.FC<EmailIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [bookings, setBookings] = useState<BookingSubmissionData[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'email_config'>('bookings');

  const loadBookings = () => {
    try {
      const data = localStorage.getItem('creww_booking_requests');
      if (data) {
        setBookings(JSON.parse(data));
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen]);

  const handleClearBookings = () => {
    if (window.confirm('Clear all stored booking requests?')) {
      localStorage.removeItem('creww_booking_requests');
      setBookings([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0c0e15] border border-neutral-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-[#08090e]">
          <div className="flex items-center gap-3">
            <img
              src={BUSINESS_CONFIG.officialLogoPath}
              alt="CREWW Logo Badge"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h3 className="font-heading text-xl font-bold text-white uppercase">
                Business Dispatch & Bookings Log
              </h3>
              <p className="text-xs text-neutral-400">
                Customer reservations and business email routing configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-800 bg-[#090b10] px-5">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Customer Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('email_config')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'email_config'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Email Integration Settings
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-neutral-300">
          
          {/* TAB 1: Stored Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    Recorded Customer Bookings
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Full customer contact, vehicle, address, and appointment details.
                  </p>
                </div>

                {bookings.length > 0 && (
                  <button
                    onClick={handleClearBookings}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 border border-dashed border-neutral-800 rounded-xl text-center">
                  <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">
                    No bookings logged yet.
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Fill out the "BOOK MY SERVICE" form on the page to log a test reservation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-[#080a10] border border-neutral-800 rounded-xl text-xs space-y-2 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sky-400 font-bold">
                            #{item.id}
                          </span>
                          <span className="font-semibold text-white">
                            {item.fullName}
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-300">
                            {item.vehicleYear} {item.vehicleMake} {item.vehicleModel}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-emerald-400 font-bold text-sm block">
                            ${item.price}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            Saved ${item.savings}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-neutral-300">
                        <div>
                          <span className="text-neutral-500 font-semibold block uppercase text-[10px]">Customer:</span>
                          <p className="font-medium text-white">{item.fullName}</p>
                          <p className="text-neutral-400">{item.phoneNumber}</p>
                          <p className="text-sky-400 truncate">{item.emailAddress}</p>
                        </div>

                        <div>
                          <span className="text-neutral-500 font-semibold block uppercase text-[10px]">Service & Time:</span>
                          <p className="text-white font-semibold">{item.serviceName}</p>
                          <p className="text-neutral-300">{item.preferredDate} at {item.preferredTime}</p>
                        </div>

                        <div>
                          <span className="text-neutral-500 font-semibold block uppercase text-[10px]">Service Address:</span>
                          <p className="text-neutral-300">{item.serviceAddress}</p>
                          <p className="text-neutral-400">{item.city}, {item.state} {item.zipCode}</p>
                          {item.additionalNotes && (
                            <p className="text-neutral-400 italic mt-1 line-clamp-2">
                              Note: "{item.additionalNotes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Email Configuration */}
          {activeTab === 'email_config' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>EmailJS Integration Active & Connected</span>
                </div>
                <p className="text-neutral-300">
                  Submissions from both the <strong>On-Site Booking Form</strong> and <strong>Contact Us Form</strong> are transmitted in real-time to your dispatch email via EmailJS, followed by an automated customer booking confirmation.
                </p>
              </div>

              <div className="bg-[#080a10] border border-neutral-800 rounded-xl p-5 space-y-4 text-xs">
                <div>
                  <label className="text-neutral-400 uppercase font-semibold tracking-wider block mb-1">
                    Configured Business Dispatch Email
                  </label>
                  <div className="p-3 bg-black rounded-lg border border-neutral-800 font-mono text-white flex items-center justify-between">
                    <span>{BUSINESS_CONFIG.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(BUSINESS_CONFIG.email);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 space-y-2.5">
                  <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">EmailJS Parameters:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block uppercase text-[9px]">Service ID:</span>
                      <span className="text-sky-400">service_u1vi2pp</span>
                    </div>
                    <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block uppercase text-[9px]">Public Key:</span>
                      <span className="text-neutral-300">hIfpizilYrfx4DA6t</span>
                    </div>
                    <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block uppercase text-[9px]">Admin Notification Template:</span>
                      <span className="text-sky-400">template_tuw4u0j</span>
                    </div>
                    <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block uppercase text-[9px]">Customer Auto-Reply Template:</span>
                      <span className="text-sky-400">template_jo7e19x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#08090e] flex items-center justify-between text-xs text-neutral-400">
          <span>CREWW MOBILE AUTO DETAILING · Business Dispatch Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
