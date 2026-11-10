/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HomepageZipChecker } from './components/HomepageZipChecker';
import { PricingSection } from './components/PricingSection';
import { ReviewsSection } from './components/ReviewsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { AboutSection } from './components/AboutSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ContactModal } from './components/ContactModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { EmailIntegrationModal } from './components/EmailIntegrationModal';
import { CinematicIntroLoader } from './components/CinematicIntroLoader';
import { CuteAiCarAssistant } from './components/CuteAiCarAssistant';
import { DetailPackage } from './config/businessConfig';

export default function App() {
  // Cinematic car detailing intro state (plays automatically on website opening, skippable, repeatable)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
      return true; // Always start automatically when opening or refreshing the website
    } catch {
      return true;
    }
  });

  const [introKey, setIntroKey] = useState<number>(1);
  const [forceReplay, setForceReplay] = useState<boolean>(false);

  // Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('full-detailing');
  const [transferZip, setTransferZip] = useState<string>('');
  const [transferCity, setTransferCity] = useState<string>('');
  const [transferState, setTransferState] = useState<string>('');
  const [detailModalPackage, setDetailModalPackage] = useState<DetailPackage | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);

  // Universal handler: Every "BOOK YOUR SERVICE" button opens the booking modal popup directly
  const handleOpenBooking = (serviceId?: string, zipCode?: string, city?: string, state?: string) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    if (zipCode) {
      setTransferZip(zipCode);
      if (city) setTransferCity(city);
      if (state) setTransferState(state);
    }
    setBookingModalOpen(true);
  };

  // Handler for opening service details modal popup
  const handleOpenDetails = (pkg: DetailPackage) => {
    setDetailModalPackage(pkg);
  };

  // Scroll to packages
  const handleViewPackages = () => {
    const packagesElement = document.getElementById('pricing');
    if (packagesElement) {
      packagesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Guaranteed Replay Intro Handler with frame-1 reset
  const handleReplayIntro = () => {
    setIntroKey((prev) => prev + 1);
    setForceReplay(true);
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Transparent Cinematic Car Wash Intro Overlay (Starts automatically on initial open and refresh, with sound and replay) */}
      {showIntro && (
        <CinematicIntroLoader
          key={introKey}
          onComplete={() => {
            setShowIntro(false);
            setForceReplay(false);
          }}
          forcePlay={forceReplay}
        />
      )}

      {/* Navigation Bar – 3-Zone contract, zero top announcement bar */}
      <Navbar
        onBookService={handleOpenBooking}
        onReplayIntro={handleReplayIntro}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* 1. Hero Section with Strong Automotive Visual & Action CTAs */}
        <Hero
          onBookService={() => handleOpenBooking()}
          onViewServices={handleViewPackages}
        />

        {/* 2. Independent Homepage US ZIP Code Service Area Checker */}
        <HomepageZipChecker
          onValidatedBooking={(zip, city, state) => handleOpenBooking(undefined, zip, city, state)}
        />

        {/* 3. Packages & Pricing Section (Strictly 3 Detailing Packages - Appears ONLY ONCE on site) */}
        <PricingSection
          onSelectPackage={handleOpenBooking}
          onOpenDetails={handleOpenDetails}
        />

        {/* 4. Customer Reviews Section ("REAL EXPERIENCES. REAL RESULTS." with ready-state notice) */}
        <ReviewsSection onBookService={() => handleOpenBooking()} />

        {/* 5. The CREWW Difference (Why Choose Us - 6 Operational Pillars) */}
        <WhyChooseUs />

        {/* 6. About Section (Authentic Automotive Preservation Narrative) */}
        <AboutSection onBookService={() => handleOpenBooking()} />

        {/* 7. Final High-Converting On-Site Reservation Banner */}
        <FinalCtaSection
          onBookService={() => handleOpenBooking()}
          onOpenContact={() => setContactModalOpen(true)}
        />
      </main>

      {/* Footer – Only Instagram Profile + Guaranteed Working Replay Intro Button */}
      <Footer
        onOpenEmailConfig={() => setEmailModalOpen(true)}
        onBookService={handleOpenBooking}
        onReplayIntro={handleReplayIntro}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* POPUP 1: Compact Booking Form Modal with EmailJS Integration & Popover Calendar */}
      <BookingModal
        isOpen={bookingModalOpen}
        initialServiceId={selectedServiceId}
        initialZipCode={transferZip}
        initialCity={transferCity}
        initialState={transferState}
        onClose={() => setBookingModalOpen(false)}
      />

      {/* POPUP 2: Contact Dispatch Form Modal with EmailJS Admin Notification */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* POPUP 3: Service Detail Modal with Full Package Inclusions */}
      <ServiceDetailModal
        packageData={detailModalPackage}
        onClose={() => setDetailModalPackage(null)}
        onBookPackage={handleOpenBooking}
      />

      {/* POPUP 4: Business Dispatch & Notification Portal */}
      <EmailIntegrationModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />

      {/* Cute Floating Miniature Car AI Assistant ("Crewy") */}
      <CuteAiCarAssistant onBookService={handleOpenBooking} />
    </div>
  );
}
