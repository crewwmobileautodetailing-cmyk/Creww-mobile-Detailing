import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { introAudio } from '../utils/audioSynthesizer';
import { OptimizedImage } from './OptimizedImage';

interface CinematicIntroLoaderProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const CinematicIntroLoader: React.FC<CinematicIntroLoaderProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  // Stages:
  // 0: Precision vehicle emergence over bright transparent backdrop
  // 1: High-pressure deionized water spray & surface hydro-rinse
  // 2: Active dense snow foam spread & bubbling effervescence
  // 3: Cleaning wash & ceramic mirror-gloss polish sweep with optical starbursts
  // 4: Official CREWW branding finale
  // 5: Dissolving smoothly into the live homepage
  const [stage, setStage] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(introAudio.getIsMuted());
  const [audioNeedsClick, setAudioNeedsClick] = useState<boolean>(false);

  const timerRefs = useRef<NodeJS.Timeout[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearAllTimers = () => {
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
  };

  useEffect(() => {
    // Attempt to auto-unlock synthesized audio
    introAudio.unlock().then((unlocked) => {
      if (!unlocked && !isMuted) {
        setAudioNeedsClick(true);
      }
    });

    // Reset to frame 1 initial stage
    setStage(0);
    setIsFadingOut(false);
    clearAllTimers();

    // 3.6s Precision Commercial Animation Timeline:
    // 0ms: Car silhouette emerges cleanly over transparent website backdrop
    // 500ms: Stage 1 (Pressure water stream & spray audio)
    const t1 = setTimeout(() => {
      setStage(1);
      introAudio.playWaterSpray(850);
    }, 500);

    // 1200ms: Stage 2 (Snow foam cascade & bubbling sound)
    const t2 = setTimeout(() => {
      setStage(2);
      introAudio.playFoamBubbles(12);
    }, 1200);

    // 2000ms: Stage 3 (Foam clears, ceramic polish sweep, reflection glints & buffer tone)
    const t3 = setTimeout(() => {
      setStage(3);
      introAudio.playPolishSweep();
    }, 2000);

    // 2700ms: Stage 4 (Official CREWW brand reveal & crystal harmonic chime)
    const t4 = setTimeout(() => {
      setStage(4);
      introAudio.playBrandChime();
    }, 2700);

    // 3400ms: Stage 5 (Smooth fade out to live homepage)
    const t5 = setTimeout(() => {
      setIsFadingOut(true);
    }, 3400);

    // 3900ms: Complete callback
    const t6 = setTimeout(() => {
      onCompleteRef.current();
    }, 3900);

    timerRefs.current = [t1, t2, t3, t4, t5, t6];

    return () => {
      clearAllTimers();
    };
  }, [forcePlay]);

  const handleToggleSound = () => {
    const nextMuted = introAudio.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setAudioNeedsClick(false);
      introAudio.playBrandChime();
    }
  };

  const handleEnableAudioManual = () => {
    introAudio.unlock().then(() => {
      setAudioNeedsClick(false);
      introAudio.playBrandChime();
    });
  };

  const handleSkip = () => {
    clearAllTimers();
    setIsFadingOut(true);
    setTimeout(() => {
      onCompleteRef.current();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 pointer-events-auto scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, rgba(6, 7, 10, 0.82) 0%, rgba(3, 4, 7, 0.94) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Dark Theme Ambient Azure Glow Highlights */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[800px] h-[100px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Top Floating Action Bar: Sound Toggle & Skip Intro */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all backdrop-blur-md cursor-pointer ${
              isMuted
                ? 'bg-black/60 border-neutral-700 text-neutral-300 hover:text-white shadow-sm'
                : 'bg-sky-950/60 border-sky-400/80 text-sky-400 shadow-sm shadow-sky-500/20'
            }`}
            aria-label={isMuted ? "Unmute intro sound" : "Mute intro sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 animate-pulse text-sky-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>

          {audioNeedsClick && (
            <button
              type="button"
              onClick={handleEnableAudioManual}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider animate-bounce shadow-md cursor-pointer"
            >
              Tap to Enable Sound
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="px-4 py-1.5 rounded-full bg-black/60 hover:bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Main Transparent Animation Canvas */}
      <div className="relative w-full max-w-2xl px-6 flex flex-col items-center justify-center">
        
        {/* Car Silhouette & Layered Wash Effects */}
        <div className="relative w-full max-w-lg h-56 sm:h-64 flex items-center justify-center">
          
          {/* Reflective Studio Floor Line */}
          <div className="absolute bottom-5 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-sky-500/70 to-transparent shadow-[0_0_12px_rgba(14,165,233,0.4)]" />
          <div className="absolute bottom-4 w-3/5 h-[8px] bg-gradient-to-r from-transparent via-sky-400/20 to-transparent blur-xs" />

          {/* Precision Automotive Coupe SVG with Crisp Transparent Layering */}
          <svg
            viewBox="0 0 600 240"
            className={`w-full h-auto transition-transform duration-700 drop-shadow-[0_12px_24px_rgba(15,23,42,0.18)] ${
              stage === 0 ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
            }`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic body gradient matching CREWW brand */}
              <linearGradient id="transCarBodyGrad" x1="0%" y1="0%" x2="100%" y2="60%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="35%" stopColor="#0f172a" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              {/* Ceramic Mirror-Gloss Reflection Sweep */}
              <linearGradient id="transCeramicSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </linearGradient>

              {/* Foam bubble 3D radial shine */}
              <radialGradient id="transFoamBubbleGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </radialGradient>

              {/* Water droplet glow */}
              <filter id="waterGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Realistic Soft Ground Shadow */}
            <ellipse cx="300" cy="204" rx="255" ry="14" fill="#0f172a" fillOpacity="0.22" />

            {/* Aerodynamic Luxury Coupe Body Silhouette */}
            <path
              d="M60 185 C90 185 120 182 145 170 C160 162 175 140 210 115 C250 85 330 80 400 95 C450 105 480 135 510 155 C535 170 550 180 560 185 L545 190 C490 190 470 160 430 160 C390 160 370 190 220 190 C190 190 170 160 130 160 C90 160 75 190 60 185 Z"
              fill="url(#transCarBodyGrad)"
              stroke={stage >= 3 ? "#0284c7" : "#64748b"}
              strokeWidth={stage >= 3 ? "2.5" : "1.8"}
              className="transition-colors duration-500"
            />

            {/* Cabin Glass & Roofline */}
            <path
              d="M215 110 C245 88 320 82 390 95 C430 102 455 125 475 140 L235 140 Z"
              fill="#0f172a"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Tinted Glass Specular Reflection */}
            <path
              d="M260 95 L340 92 L290 135 L230 135 Z"
              fill="#38bdf8"
              fillOpacity={stage >= 3 ? "0.4" : "0.15"}
            />

            {/* Wheels & Alloy Spokes */}
            {/* Front Wheel */}
            <circle cx="150" cy="180" r="28" fill="#1e293b" stroke="#94a3b8" strokeWidth="3.5" />
            <circle cx="150" cy="180" r="16" fill="#334155" stroke="#0ea5e9" strokeWidth="2.5" />
            <circle cx="150" cy="180" r="6" fill="#ffffff" />
            {/* Rear Wheel */}
            <circle cx="450" cy="180" r="28" fill="#1e293b" stroke="#94a3b8" strokeWidth="3.5" />
            <circle cx="450" cy="180" r="16" fill="#334155" stroke="#0ea5e9" strokeWidth="2.5" />
            <circle cx="450" cy="180" r="6" fill="#ffffff" />

            {/* LED Headlight & Tail Lamp Accents */}
            <path d="M545 165 L555 170 L545 175 Z" fill="#38bdf8" className={stage >= 3 ? "animate-pulse" : ""} />
            <path d="M70 168 L60 172 L70 176 Z" fill="#ef4444" fillOpacity="0.85" />

            {/* STAGE 1: HIGH PRESSURE WATER STREAM & SPRAY */}
            {stage === 1 && (
              <g className="animate-fade-in">
                <path
                  d="M95 25 Q 240 55 365 88"
                  stroke="#0284c7"
                  strokeWidth="4"
                  strokeDasharray="12 6"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M105 38 Q 280 82 435 110"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  opacity="0.85"
                />
                <path
                  d="M85 30 Q 210 65 300 115"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  opacity="0.8"
                />
                {/* Active Water Droplets on Body */}
                <circle cx="280" cy="98" r="4" fill="#0284c7" filter="url(#waterGlowFilter)" />
                <circle cx="310" cy="92" r="3.5" fill="#38bdf8" />
                <circle cx="350" cy="100" r="4.5" fill="#0284c7" />
                <circle cx="410" cy="112" r="4" fill="#38bdf8" />
                <circle cx="460" cy="135" r="5" fill="#0284c7" />
                <circle cx="240" cy="122" r="3" fill="#38bdf8" />
              </g>
            )}

            {/* STAGE 2: DENSE SNOW FOAM SPREAD */}
            {stage === 2 && (
              <g className="animate-fade-in">
                <circle cx="285" cy="85" r="10" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="305" cy="82" r="12" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="328" cy="86" r="11" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="350" cy="90" r="9" fill="url(#transFoamBubbleGrad)" fillOpacity="0.9" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="385" cy="98" r="11" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="415" cy="105" r="13" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="445" cy="120" r="12" fill="url(#transFoamBubbleGrad)" fillOpacity="0.9" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="260" cy="138" r="10" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="320" cy="142" r="14" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="360" cy="145" r="11" fill="url(#transFoamBubbleGrad)" fillOpacity="0.9" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="480" cy="155" r="12" fill="url(#transFoamBubbleGrad)" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
                <circle cx="225" cy="125" r="11" fill="url(#transFoamBubbleGrad)" fillOpacity="0.9" stroke="#bae6fd" strokeWidth="1" />
              </g>
            )}

            {/* STAGE 3 & 4: CERAMIC HIGH-GLOSS SWEEP & OPTICAL SHINE STARBURSTS */}
            {stage >= 3 && (
              <g className="animate-fade-in">
                <path
                  d="M135 165 C 200 135 320 85 410 95 C 470 102 520 145 540 165"
                  stroke="url(#transCeramicSweep)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
                
                {/* Optical Star Glint 1: Front Fender */}
                <g transform="translate(485, 135)">
                  <path d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z" fill="#ffffff" />
                </g>

                {/* Optical Star Glint 2: Roofline Contour */}
                <g transform="translate(330, 80)">
                  <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#0284c7" />
                </g>

                {/* Optical Star Glint 3: Center Door */}
                <g transform="translate(240, 150)">
                  <path d="M0 -8 L1.8 -1.8 L8 0 L1.8 1.8 L0 8 L-1.8 1.8 L-8 0 L-1.8 -1.8 Z" fill="#ffffff" />
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Narrative Stage Indicators & Branded Climax */}
        <div className="mt-6 text-center h-24 flex flex-col items-center justify-center">
          {stage < 4 ? (
            <div className="space-y-1.5 animate-fade-in">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sky-400">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>
                  {stage === 0 && 'Mobilizing CREWW Detailing Fleet...'}
                  {stage === 1 && 'High-Pressure Hydro-Rinse...'}
                  {stage === 2 && 'Active Snow Foam Paint Decontamination...'}
                  {stage === 3 && 'Ceramic Buffer Wax & Liquid Gloss Seal...'}
                </span>
              </div>
              <p className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                PRECISION AUTOMOTIVE RESTORATION
              </p>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in flex flex-col items-center">
              <OptimizedImage
                src={BUSINESS_CONFIG.officialBadgePath}
                alt="CREWW Official Badge"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(14,165,233,0.35)]"
              />
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">
                CREWW MOBILE AUTO DETAILING
              </h1>
              <span className="text-xs text-neutral-400 tracking-widest uppercase font-semibold">
                United States · On-Site Detailing
              </span>
            </div>
          )}
        </div>

        {/* Progress Line in Dark Theme */}
        <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden mt-4 border border-neutral-700/80">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, (stage + 1) * 22)}%` }}
          />
        </div>

      </div>
    </div>
  );
};
