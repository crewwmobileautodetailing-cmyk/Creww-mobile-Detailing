import React from 'react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { OptimizedImage } from './OptimizedImage';

interface BrandLogoProps {
  variant?: 'navbar' | 'footer' | 'hero';
  className?: string;
  showText?: boolean;
}

/**
 * Official Brand Logo for CREWW MOBILE AUTO DETAILING
 * Strictly displays the user's uploaded official badge logo:
 * /assets/aistudio/Sleek_Blue_Crew_Auto_Detailing_Badge_f6a27b68.png
 * Preserves 100% original proportions, aspect ratio, and authentic color.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  className = '',
  showText = true,
}) => {
  const isFooter = variant === 'footer';

  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none ${className}`}>
      {/* Official circular badge logo */}
      <OptimizedImage
        src={BUSINESS_CONFIG.officialLogoPath}
        alt="CREWW MOBILE AUTO DETAILING Official Logo Badge"
        className={`${
          isFooter ? 'h-14 md:h-16' : 'h-9 sm:h-11 md:h-13'
        } w-auto object-contain shrink-0 filter drop-shadow-[0_2px_8px_rgba(14,165,233,0.25)] transition-transform duration-300 hover:scale-105`}
        loading="eager"
      />

      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center">
            <span
              className={`font-heading font-black tracking-tight uppercase text-white ${
                isFooter ? 'text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'
              }`}
            >
              CREWW
            </span>
            <span className="text-sky-400 font-heading font-black ml-1 text-[11px] sm:text-xs md:text-sm">
              USA
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold tracking-[0.14em] sm:tracking-[0.22em] text-neutral-400 uppercase -mt-0.5 whitespace-nowrap">
            Mobile Auto Detailing
          </span>
        </div>
      )}
    </div>
  );
};
