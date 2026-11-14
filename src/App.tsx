/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HomepageZipChecker } from './components/HomepageZipChecker';
import { PricingSection } from './components/PricingSection';
import { ReviewsSection } from './components/ReviewsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { AboutSection } from './components/AboutSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { CinematicIntroLoader } from './components/CinematicIntroLoader';
import { CuteAiCarAssistant } from './components/CuteAiCarAssistant';
import { DetailPackage } from './config/businessConfig';
import type { LegalTab } from './components/LegalModal';

const BookingModal = lazy(() =>
  import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))
);
const ContactModal = lazy(() =>
  import('./components/ContactModal').then((m) => ({ default: m.ContactModal }))
);
const ServiceDetailModal = lazy(() =>
  import('./components/ServiceDetailModal').then((m) => ({ default: m.ServiceDetailModal }))
);
const LegalModal = lazy(() =>
  import('./components/LegalModal').then((m) => ({ default: m.LegalModal }))
);

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
      return true;
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
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);

  const handleOpenBooking = (
    serviceId?: string,
    zipCode?: string,
    city?: string,
    state?: string
  ) => {
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

  const handleOpenDetails = (pkg: DetailPackage) => {
    setDetailModalPackage(pkg);
  };

  const handleViewPackages = () => {
    const packagesElement = document.getElementById('pricing');
    if (packagesElement) {
      packagesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReplayIntro = () => {
    setIntroKey((prev) => prev + 1);
    setForceReplay(true);
    setShowIntro(true);
  };

  const isAnyModalOpen =
    bookingModalOpen ||
    contactModalOpen ||
    Boolean(detailModalPackage) ||
    Boolean(legalModalTab);

  return (
    <div className="min-h-screen bg-[#06070a] text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Transparent Cinematic Car Wash Intro Overlay */}
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

      {/* Navigation Bar */}
      <Navbar
        onBookService={handleOpenBooking}
        onReplayIntro={handleReplayIntro}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Hero
          onBookService={() => handleOpenBooking()}
          onViewServices={handleViewPackages}
        />

        <HomepageZipChecker
          onValidatedBooking={(zip, city, state) =>
            handleOpenBooking(undefined, zip, city, state)
          }
        />

        <PricingSection
          onSelectPackage={handleOpenBooking}
          onOpenDetails={handleOpenDetails}
        />

        <ReviewsSection onBookService={() => handleOpenBooking()} />

        <WhyChooseUs />

        <AboutSection onBookService={() => handleOpenBooking()} />

        <FinalCtaSection
          onBookService={() => handleOpenBooking()}
          onOpenContact={() => setContactModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onBookService={handleOpenBooking}
        onReplayIntro={handleReplayIntro}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
      />

      {/* Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {bookingModalOpen && (
          <BookingModal
            isOpen={bookingModalOpen}
            initialServiceId={selectedServiceId}
            initialZipCode={transferZip}
            initialCity={transferCity}
            initialState={transferState}
            onClose={() => setBookingModalOpen(false)}
          />
        )}

        {contactModalOpen && (
          <ContactModal
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />
        )}

        {detailModalPackage && (
          <ServiceDetailModal
            packageData={detailModalPackage}
            onClose={() => setDetailModalPackage(null)}
            onBookPackage={handleOpenBooking}
          />
        )}

        {legalModalTab && (
          <LegalModal
            activeTab={legalModalTab}
            onSelectTab={(tab) => setLegalModalTab(tab)}
            onClose={() => setLegalModalTab(null)}
          />
        )}
      </Suspense>

      {/* Cute Floating Miniature Car AI Assistant ("Crewy") */}
      <CuteAiCarAssistant
        onBookService={handleOpenBooking}
        isModalOpen={isAnyModalOpen}
      />
    </div>
  );
}
