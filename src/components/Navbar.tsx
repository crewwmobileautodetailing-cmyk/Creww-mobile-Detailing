import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { Menu, X, Calendar, ChevronRight, RotateCcw } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';

interface NavbarProps {
  onBookService: (serviceId?: string) => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookService, onReplayIntro }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Area Checker', href: '#coverage' },
    { label: 'Packages & Pricing', href: '#pricing' },
    { label: 'Customer Reviews', href: '#reviews' },
    { label: 'About Us', href: '#about' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
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
    <header className="sticky top-0 z-50 w-full">
      {/* Main Navigation Bar - Strictly at top-0, sticky across all devices */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#06070a]/95 backdrop-blur-md shadow-xl shadow-black/40 border-b border-neutral-800'
            : 'bg-[#06070a] border-b border-neutral-800/80 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
          {/* Zone 1: Brand Wordmark & Official Badge */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="shrink-0 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
          >
            <BrandLogo variant="navbar" />
          </a>

          {/* Zone 2: 4–5 single-line clean text links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold tracking-wide text-neutral-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="whitespace-nowrap hover:text-sky-400 transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-sky-400 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop & Mobile Replay Intro Pill Button - Directly visible beside hamburger on mobile */}
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wide uppercase text-sky-400 bg-sky-950/40 hover:bg-sky-900/60 active:scale-95 border border-sky-500/40 hover:border-sky-400 transition-all shadow-sm shadow-sky-950/40 cursor-pointer"
                title="Replay cinematic car detailing intro animation"
                aria-label="Replay Intro"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-spin-reverse-once" />
                <span className="whitespace-nowrap">Replay Intro</span>
              </button>
            )}

            {/* Desktop Primary Booking Button */}
            <button
              onClick={() => onBookService()}
              className="hidden sm:inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20 cursor-pointer whitespace-nowrap border border-sky-400/30"
            >
              <Calendar className="w-4 h-4 mr-2" />
              BOOK YOUR SERVICE
            </button>

            {/* Mobile Hamburger Button - Strictly separate control beside Replay Intro */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Strictly navigation links + primary action, NO Replay Intro inside) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0c0e15] border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-2xl">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-sky-400 transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookService();
                }}
                className="w-full flex items-center justify-center px-5 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/20"
              >
                <Calendar className="w-4 h-4 mr-2" />
                BOOK YOUR SERVICE
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
