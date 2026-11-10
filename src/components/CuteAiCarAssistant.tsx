import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles, Calendar, Droplets, Zap, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  showBookButton?: boolean;
}

interface CuteAiCarAssistantProps {
  onBookService: (serviceId?: string) => void;
}

const QUICK_PROMPTS = [
  'What services do you offer?',
  'What are your prices?',
  "What's included in each package?",
  'Do you service my ZIP code?',
  'What do I need before booking?',
  'How can I book?',
];

export const CuteAiCarAssistant: React.FC<CuteAiCarAssistantProps> = ({ onBookService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hey! Welcome to CREWW 🚗 How can I help you today?',
      timestamp: 'Just now',
      showBookButton: true,
    },
  ]);

  // Show a cute initial greeting tooltip after 4 seconds if not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !hasInteracted) {
        setShowTooltip(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen, hasInteracted]);

  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
      setHasInteracted(true);
    }
  }, [isOpen]);

  // Handle Escape key to close chat window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Viewport height tracking for mobile keyboard awareness
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 800
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
    };
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Isolated IntersectionObserver implementation observing the footer element
  const [footerLiftOffset, setFooterLiftOffset] = useState<number>(0);

  useEffect(() => {
    const footer = document.getElementById('site-footer') || document.querySelector('footer');
    if (!footer) return;

    let isIntersecting = false;

    const calculateFooterLift = () => {
      if (!isIntersecting) {
        setFooterLiftOffset(0);
        return;
      }
      const rect = footer.getBoundingClientRect();
      const vh = window.innerHeight;
      const visibleFooterHeight = vh - rect.top;
      if (visibleFooterHeight > 0) {
        // Elevate above footer with 20px clearance, leaving room below sticky navbar
        const maxLift = Math.max(0, vh - 110);
        setFooterLiftOffset(Math.min(visibleFooterHeight + 20, maxLift));
      } else {
        setFooterLiftOffset(0);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isIntersecting = entry.isIntersecting;
        if (entry.isIntersecting) {
          calculateFooterLift();
        } else {
          setFooterLiftOffset(0);
        }
      },
      {
        root: null,
        threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1.0],
      }
    );

    observer.observe(footer);

    const handleScrollOrResize = () => {
      if (isIntersecting) {
        calculateFooterLift();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || isTyping) return;

    // Check if customer explicitly typed a direct command to open booking
    if (/^(book|book now|schedule|schedule now|open booking|make a reservation)$/i.test(query)) {
      onBookService();
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare multi-turn history for the AI backend
    const currentHistory = messages
      .filter((m) => m.id !== 'welcome-1')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: currentHistory,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.reply) {
        const errorText = data.error || 'The AI assistant is temporarily unavailable. Please try again shortly or click Book Your Service below.';
        const botErrMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ ${errorText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showBookButton: true,
        };
        setMessages((prev) => [...prev, botErrMsg]);
        return;
      }

      const replyText: string = data.reply;
      const isBookingRelevant =
        /book|schedule|reserve|appointment|offer|price|cost|deal|rate|package/i.test(query) ||
        /book|schedule|reserve|appointment|walkthrough/i.test(replyText);

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showBookButton: isBookingRelevant,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (networkErr: any) {
      console.error('Chat network error:', networkErr);
      const botErrMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Network connection issue. Unable to connect to CREWW AI backend. You can still schedule anytime by tapping "Book Your Service" below!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showBookButton: true,
      };
      setMessages((prev) => [...prev, botErrMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="fixed right-4 sm:right-6 z-40 select-none transition-[bottom] duration-200 ease-out"
      style={{
        bottom: footerLiftOffset > 0 ? `${footerLiftOffset}px` : 'max(1rem, env(safe-area-inset-bottom, 1rem))',
      }}
    >
      
      {/* Greeting Tooltip for Cute Car */}
      {!isOpen && showTooltip && (
        <div className="absolute bottom-20 right-0 w-60 sm:w-64 p-3 rounded-2xl bg-[#090c14] border border-sky-400/40 shadow-xl shadow-sky-500/10 text-white animate-bounce-subtle z-50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Crewy is ready!</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="p-1 text-neutral-400 hover:text-white"
              aria-label="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-neutral-300 mt-1 leading-snug">
            Need pricing, inclusions, or water & power info? Tap me anytime!
          </p>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[#090c14] border-r border-b border-sky-400/40 transform rotate-45" />
        </div>
      )}

      {/* Cute Car Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open CREWW AI Car Assistant"
        >
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 rounded-3xl opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse" />

          {/* Miniature Cute Car Body Container */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-[#141926] via-[#0d101a] to-[#07090f] border-2 border-sky-400/60 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-1.5 overflow-hidden">
            
            {/* Cute Car Vector Graphic */}
            <svg
              viewBox="0 0 100 80"
              className="w-13 h-10 drop-shadow-[0_4px_8px_rgba(56,189,248,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ground Shadow */}
              <ellipse cx="50" cy="72" rx="38" ry="4" fill="rgba(0,0,0,0.6)" />

              {/* Sleek Car Chassis */}
              <path
                d="M12 50 C12 40, 20 38, 28 36 L40 22 C44 17, 56 17, 68 22 L80 36 C88 38, 92 44, 92 50 L92 56 C92 59, 89 61, 85 61 L15 61 C13 61, 12 59, 12 56 Z"
                fill="url(#carMetallicGradient)"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Glossy Windshield & Windows */}
              <path
                d="M33 36 L43 25 C45 23, 55 23, 63 25 L73 36 Z"
                fill="url(#glassGradient)"
                stroke="#0284c7"
                strokeWidth="1.5"
              />

              {/* Windshield Shine Highlight */}
              <path
                d="M45 26 L55 26 L49 35 L43 35 Z"
                fill="white"
                fillOpacity="0.4"
              />

              {/* Glowing Headlights (Animated Eyes/Beams) */}
              <circle cx="21" cy="47" r="4.5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="21" cy="47" r="2" fill="#ffffff" />
              
              <circle cx="79" cy="47" r="4.5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="79" cy="47" r="2" fill="#ffffff" />

              {/* Front Smiling Grille */}
              <path
                d="M40 52 Q50 56 60 52"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Wheels */}
              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '28px 61px' }}>
                <circle cx="28" cy="61" r="8" fill="#18181b" stroke="#0ea5e9" strokeWidth="2.5" />
                <circle cx="28" cy="61" r="3.5" fill="#e0f2fe" />
                <line x1="28" y1="53" x2="28" y2="69" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="20" y1="61" x2="36" y2="61" stroke="#38bdf8" strokeWidth="1.5" />
              </g>

              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '72px 61px' }}>
                <circle cx="72" cy="61" r="8" fill="#18181b" stroke="#0ea5e9" strokeWidth="2.5" />
                <circle cx="72" cy="61" r="3.5" fill="#e0f2fe" />
                <line x1="72" y1="53" x2="72" y2="69" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="64" y1="61" x2="80" y2="61" stroke="#38bdf8" strokeWidth="1.5" />
              </g>

              {/* Sparkle over spoiler */}
              <path
                d="M78 16 L80 12 L82 16 L86 18 L82 20 L80 24 L78 20 L74 18 Z"
                fill="#38bdf8"
                className="animate-ping"
                style={{ transformOrigin: '80px 18px', animationDuration: '2.5s' }}
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="carMetallicGradient" x1="12" y1="20" x2="92" y2="61" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1e293b" />
                  <stop offset="0.5" stopColor="#0f172a" />
                  <stop offset="1" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="glassGradient" x1="33" y1="23" x2="73" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#0369a1" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>

            {/* Micro Badge */}
            <span className="text-[9px] font-mono font-black text-sky-400 uppercase tracking-widest mt-0.5">
              CREWY AI
            </span>

            {/* Online Green Indicator Dot */}
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-black" />
            </span>
          </div>
        </button>
      )}

      {/* Chat Popup Panel - Mobile & desktop responsive viewport docking with keyboard and footer awareness */}
      {isOpen && (
        <div
          className="fixed right-3 left-3 sm:left-auto sm:right-6 sm:w-[410px] bg-[#0a0d16] border border-sky-500/40 rounded-3xl shadow-2xl shadow-sky-950/70 flex flex-col overflow-hidden animate-scale-up backdrop-blur-xl z-50 transition-[bottom,max-height] duration-200 ease-out"
          style={{
            bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
            maxHeight: `min(580px, ${Math.max(280, viewportHeight - 96)}px)`,
            height: `${Math.min(580, Math.max(280, viewportHeight - 96))}px`,
          }}
        >
          
          {/* Header */}
          <div className="px-4 py-3 bg-[#0d121f] border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center p-1 border border-sky-400/40 shadow-inner shrink-0">
                <svg viewBox="0 0 100 80" className="w-7 h-6" fill="none">
                  <path
                    d="M12 50 C12 40, 20 38, 28 36 L40 22 C44 17, 56 17, 68 22 L80 36 C88 38, 92 44, 92 50 Z"
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <circle cx="25" cy="46" r="4" fill="#38bdf8" />
                  <circle cx="75" cy="46" r="4" fill="#38bdf8" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading text-sm font-black text-white uppercase tracking-wide">
                    Crewy
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono font-bold uppercase">
                    AI Concierge
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  CREWW Mobile Detailing Knowledge Base
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Bar for Requirements */}
          <div className="px-3.5 py-1.5 bg-sky-950/40 border-b border-sky-800/30 flex items-center justify-between text-[11px] text-sky-300">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-sky-400" />
              <Zap className="w-3 h-3 text-amber-400" />
              Water & Power Required at Location
            </span>
            <span className="font-mono text-[10px] text-neutral-400">USA Nationwide</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-xs shadow-md'
                      : 'bg-[#121624] text-neutral-200 border border-neutral-800/90 rounded-bl-xs shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Optional "Book Your Service" Action Pill inside chat */}
                {m.sender === 'assistant' && m.showBookButton && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onBookService();
                    }}
                    className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Your Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <span className="text-[9px] text-neutral-500 mt-0.5 px-1 font-mono">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-[#121624] border border-neutral-800/80 px-3 py-2 rounded-2xl w-fit">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="font-mono text-[11px]">Crewy is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3.5 py-2.5 bg-[#090c14] border-t border-neutral-800/80 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Popular questions:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={isTyping}
                  className="px-3 py-1.5 rounded-xl bg-[#141926] hover:bg-sky-950/60 active:scale-95 border border-neutral-700/60 hover:border-sky-500/50 text-[11px] text-neutral-200 hover:text-white whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0d121f] border-t border-neutral-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about packages, prices, or prep..."
              disabled={isTyping}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#070910] border border-neutral-700 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white disabled:opacity-40 transition-all cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center active:scale-95 shrink-0 shadow-md shadow-sky-500/20"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
