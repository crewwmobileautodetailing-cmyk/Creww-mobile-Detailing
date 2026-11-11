import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface CompactDateTimePickerProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // Flexible customer-selected time, e.g. "10:00 AM"
  onDateChange: (dateStr: string) => void;
  onTimeChange: (timeStr: string) => void;
  error?: string;
  timeError?: string;
}

export const CompactDateTimePicker: React.FC<CompactDateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  error,
  timeError,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
        setIsTimeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Base calendar state
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDateObj.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar calculations
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getDisplayDate = () => {
    if (!selectedDate) return 'Select Preferred Date';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const obj = new Date(y, m - 1, d);
    return obj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Parse current selected time or default components
  const parseCurrentTime = () => {
    if (!selectedTime) return { hour: '10', minute: '00', period: 'AM' };
    const match = selectedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      const h = match[1].padStart(2, '0');
      const m = match[2];
      const p = (match[3] || 'AM').toUpperCase();
      return { hour: h, minute: m, period: p };
    }
    return { hour: '10', minute: '00', period: 'AM' };
  };

  const currentParsed = parseCurrentTime();
  const [tempHour, setTempHour] = useState(currentParsed.hour);
  const [tempMinute, setTempMinute] = useState(currentParsed.minute);
  const [tempPeriod, setTempPeriod] = useState(currentParsed.period);
  const [manualTimeInput, setManualTimeInput] = useState(selectedTime || '10:00 AM');

  // Keep manual input in sync when selectedTime prop updates externally
  useEffect(() => {
    if (selectedTime) {
      setManualTimeInput(selectedTime);
      const parsed = parseCurrentTime();
      setTempHour(parsed.hour);
      setTempMinute(parsed.minute);
      setTempPeriod(parsed.period);
    }
  }, [selectedTime]);

  const handleSelectDate = (dateStr: string) => {
    onDateChange(dateStr);
    setIsDateOpen(false); // Close calendar smoothly after selection
  };

  const applyCustomTime = (h: string, m: string, p: string) => {
    const formatted = `${h.padStart(2, '0')}:${m.padStart(2, '0')} ${p}`;
    setTempHour(h);
    setTempMinute(m);
    setTempPeriod(p);
    setManualTimeInput(formatted);
    onTimeChange(formatted);
  };

  const handleManualBlur = () => {
    const trimmed = manualTimeInput.trim();
    if (trimmed) {
      onTimeChange(trimmed);
    }
  };

  const hoursList = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07'];
  const minutesList = ['00', '15', '30', '45'];

  return (
    <div ref={containerRef} className="space-y-1.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* 1. Date Selection Trigger */}
        <div className="relative">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Preferred Date *
          </label>
          <button
            type="button"
            onClick={() => {
              setIsDateOpen(!isDateOpen);
              setIsTimeOpen(false);
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#07080b] border text-xs sm:text-sm text-left flex items-center justify-between transition-all cursor-pointer ${
              isDateOpen
                ? 'border-sky-400 ring-1 ring-sky-400 text-white'
                : error
                ? 'border-red-500 text-neutral-200'
                : 'border-neutral-700 hover:border-neutral-600 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarIcon className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-medium truncate">{getDisplayDate()}</span>
            </div>
            <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider shrink-0">
              {isDateOpen ? 'Close' : 'Choose'}
            </span>
          </button>

          {/* Floating Calendar Popover */}
          {isDateOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-40 w-full sm:w-80 max-w-[calc(100vw-2.5rem)] p-3 sm:p-3.5 bg-[#0e1017] border border-neutral-700 rounded-2xl shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-neutral-800">
                <span className="font-heading text-base font-bold text-white uppercase tracking-wide">
                  {monthNames[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold uppercase text-neutral-500">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarCells.map((dayNum, i) => {
                  if (dayNum === null) return <div key={`empty-${i}`} className="h-7 w-7" />;

                  const cellDate = new Date(viewYear, viewMonth, dayNum);
                  cellDate.setHours(0, 0, 0, 0);
                  const isPast = cellDate < today;
                  const dateStr = formatDateString(viewYear, viewMonth, dayNum);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleSelectDate(dateStr)}
                      className={`h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold ring-1 ring-sky-300'
                          : isPast
                          ? 'text-neutral-600 opacity-25 cursor-not-allowed'
                          : 'text-neutral-200 hover:bg-neutral-800 hover:text-sky-400 cursor-pointer active:scale-95'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Customer-Selected Preferred Time Trigger */}
        <div className="relative">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Preferred Time *
          </label>
          <button
            type="button"
            onClick={() => {
              setIsTimeOpen(!isTimeOpen);
              setIsDateOpen(false);
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#07080b] border text-xs sm:text-sm text-left flex items-center justify-between transition-all cursor-pointer ${
              isTimeOpen
                ? 'border-sky-400 ring-1 ring-sky-400 text-white'
                : timeError
                ? 'border-red-500 text-neutral-200'
                : 'border-neutral-700 hover:border-neutral-600 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-medium truncate">{selectedTime || 'Select Desired Time'}</span>
            </div>
            <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider shrink-0">
              {isTimeOpen ? 'Close' : 'Choose'}
            </span>
          </button>

          {/* Floating Flexible Time Picker Popover - Zero Preset Slots */}
          {isTimeOpen && (
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-1.5 z-40 w-full sm:w-80 max-w-[calc(100vw-2.5rem)] p-3.5 bg-[#0e1017] border border-neutral-700 rounded-2xl shadow-2xl animate-fade-in space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Choose Preferred Time
                </span>
                <span className="text-[10px] text-sky-400 font-mono font-bold">
                  {tempHour}:{tempMinute} {tempPeriod}
                </span>
              </div>

              {/* Hours Grid (Customer chooses any hour) */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1 font-semibold">
                  Hour
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {hoursList.map((h) => {
                    const isSelected = tempHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => applyCustomTime(h, tempMinute, tempPeriod)}
                        className={`py-1.5 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500 text-white font-bold ring-1 ring-sky-300'
                            : 'bg-[#07080b] text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {parseInt(h, 10)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes & Period Selector */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1 font-semibold">
                    Minute
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {minutesList.map((m) => {
                      const isSelected = tempMinute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => applyCustomTime(tempHour, m, tempPeriod)}
                          className={`py-1.5 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500 text-white font-bold ring-1 ring-sky-300'
                              : 'bg-[#07080b] text-neutral-300 hover:bg-neutral-800 hover:text-white'
                          }`}
                        >
                          :{m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1 font-semibold">
                    AM / PM
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {['AM', 'PM'].map((p) => {
                      const isSelected = tempPeriod === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => applyCustomTime(tempHour, tempMinute, p)}
                          className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white ring-1 ring-sky-300'
                              : 'bg-[#07080b] text-neutral-300 hover:bg-neutral-800 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Custom manual time input fallback */}
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                  Or enter exact desired time:
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={manualTimeInput}
                    onChange={(e) => {
                      setManualTimeInput(e.target.value);
                      onTimeChange(e.target.value);
                    }}
                    onBlur={handleManualBlur}
                    placeholder="e.g. 10:30 AM, 2:15 PM"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#07080b] border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimeOpen(false);
                      if (manualTimeInput.trim()) {
                        onTimeChange(manualTimeInput.trim());
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Mandatory Professional Note as specified */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <p className="text-[11px] text-neutral-400 leading-tight">
          Your preferred date and time are subject to confirmation by our team.
        </p>
      </div>

      {error && <p className="text-red-400 text-[10px] mt-0.5">{error}</p>}
      {timeError && <p className="text-red-400 text-[10px] mt-0.5">{timeError}</p>}
    </div>
  );
};
