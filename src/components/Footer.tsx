import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Mail, MapPin, Shield, ArrowRight, Instagram, RotateCcw } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onBookService: (serviceId?: string) => void;
  onReplayIntro: () => void;
  onOpenContact?: () => void;
  onOpenLegal: (tab: LegalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onBookService,
  onReplayIntro,
  onOpenContact,
  onOpenLegal,
}) => {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="site-footer" className="bg-[#040508] border-t border-neutral-800 text-neutral-400 text-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-neutral-800/80">
          {/* Brand Info & Mission (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center">
              <BrandLogo variant="footer" />
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Professional mobile auto detailing delivered directly to your driveway or workplace across the United States. Commercial restoration tools, deep cabin sanitization, and showroom paint protection (on-site water &amp; electricity required).
            </p>

            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span>On-Site Mobile Fleet · Nationwide USA</span>
            </div>
          </div>

          {/* Quick Navigation Links (Col 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a
                    href="#home"
                    onClick={(e) => handleSmoothScroll(e, '#home')}
                    className="hover:text-sky-400 transition-colors inline-block py-0.5"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#coverage"
                    onClick={(e) => handleSmoothScroll(e, '#coverage')}
                    className="hover:text-sky-400 transition-colors inline-block py-0.5"
                  >
                    Area Checker
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={(e) => handleSmoothScroll(e, '#pricing')}
                    className="hover:text-sky-400 transition-colors inline-block py-0.5"
                  >
                    Packages &amp; Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#reviews"
                    onClick={(e) => handleSmoothScroll(e, '#reviews')}
                    className="hover:text-sky-400 transition-colors inline-block py-0.5"
                  >
                    Customer Reviews
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    onClick={(e) => handleSmoothScroll(e, '#about')}
                    className="hover:text-sky-400 transition-colors inline-block py-0.5"
                  >
                    About Us
                  </a>
                </li>
                {onOpenContact && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="hover:text-sky-400 transition-colors cursor-pointer text-left py-0.5"
                    >
                      Contact Us
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Packages Links (Col 7-9) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Detailing Treatments
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {BUSINESS_CONFIG.packages.map((pkg) => (
                <li key={pkg.id}>
                  <button
                    type="button"
                    onClick={() => onBookService(pkg.id)}
                    className="text-left text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer py-0.5"
                  >
                    {pkg.name} (${pkg.offerPrice})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Booking CTA & Direct Online Contact (Col 10-12) */}
          <div className="lg:col-span-3 space-y-4 min-w-0">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Online Scheduling
            </h4>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Submit your mobile detail request in under 2 minutes. Choose your service, preferred date, time, and location.
            </p>

            <button
              type="button"
              onClick={() => onBookService()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/20 cursor-pointer min-h-[44px]"
            >
              <span>BOOK ON-SITE SERVICE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="space-y-2 pt-1 text-xs text-neutral-300 min-w-0">
              {onOpenContact ? (
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="flex items-center gap-2 text-neutral-300 hover:text-sky-400 transition-colors cursor-pointer text-left w-full group min-w-0"
                >
                  <Mail className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{BUSINESS_CONFIG.email} (Contact Us)</span>
                </button>
              ) : (
                <a
                  href={`mailto:${BUSINESS_CONFIG.email}`}
                  className="flex items-center gap-2 text-neutral-300 hover:text-sky-400 transition-colors min-w-0"
                >
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="truncate">{BUSINESS_CONFIG.email}</span>
                </a>
              )}

              <div className="flex items-center gap-2 text-neutral-300">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{BUSINESS_CONFIG.serviceTerritory}</span>
              </div>
            </div>

            {/* STRICTLY ONLY Instagram profile */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
                Follow Us On Instagram
              </span>
              <a
                href={BUSINESS_CONFIG.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0e15] border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-sky-400 hover:border-sky-500/50 transition-all shadow-sm group min-h-[44px]"
              >
                <Instagram className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>{BUSINESS_CONFIG.instagram.handle}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Functional Replay Control (No public Dispatch Portal) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4 text-center sm:text-left">
          <div>
            © {currentYear} {BUSINESS_CONFIG.name}. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer py-1.5 px-2 rounded-lg min-h-[38px]"
              title="Replay cinematic car detailing intro animation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              <span>REPLAY INTRO</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer py-1.5 px-1.5 rounded-lg min-h-[38px]"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer py-1.5 px-1.5 rounded-lg min-h-[38px]"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
