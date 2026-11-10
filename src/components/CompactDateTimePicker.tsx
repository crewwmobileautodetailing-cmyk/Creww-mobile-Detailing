import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CompactDateTimePickerProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // e.g. "09:30 AM"
  onDateChange: (dateStr: string) => void;
  onTimeChange: (timeStr: string) => void;
  error?: string;
}

export const CompactDateTimePicker: React.FC<CompactDateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  error,
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

  // Today base
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
    if (!selectedDate) return 'Select Date';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const obj = new Date(y, m - 1, d);
    return obj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Available Time Slots in 12-hour format
  const slots = [
    '08:00 AM',
    '09:30 AM',
    '11:00 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM',
  ];

  const handleSelectDate = (dateStr: string) => {
    onDateChange(dateStr);
    setIsDateOpen(false); // Close calendar immediately after selection
  };

  const handleSelectTime = (timeStr: string) => {
    onTimeChange(timeStr);
    setIsTimeOpen(false); // Close time popup immediately after selection
  };

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* 1. Compact Date Trigger Field */}
        <div className="relative">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Appointment Date *
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
              {isDateOpen ? 'Close' : 'Change'}
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
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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

        {/* 2. Compact Time Trigger Field */}
        <div className="relative">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Appointment Time *
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
                : 'border-neutral-700 hover:border-neutral-600 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-medium">{selectedTime || 'Select Time'}</span>
            </div>
            <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider shrink-0">
              {isTimeOpen ? 'Close' : 'Choose'}
            </span>
          </button>

          {/* Floating Time Slots Popover */}
          {isTimeOpen && (
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-1.5 z-40 w-full sm:w-64 max-w-[calc(100vw-2.5rem)] p-3 bg-[#0e1017] border border-neutral-700 rounded-2xl shadow-2xl animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2 px-1">
                Select 12-Hour Arrival Slot:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {slots.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSelectTime(slot)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold ring-1 ring-sky-300 shadow-sm'
                          : 'bg-[#07080b] text-neutral-200 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
    </div>
  );
};
