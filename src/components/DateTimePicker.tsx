import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check, Sparkles } from 'lucide-react';

interface DateTimePickerProps {
  selectedDate: string; // ISO format "YYYY-MM-DD"
  selectedTime: string; // e.g. "09:00 AM"
  onDateChange: (dateStr: string) => void;
  onTimeChange: (timeStr: string) => void;
  error?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  error,
}) => {
  // Current viewing month/year for the calendar
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialViewDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialViewDate.getMonth()); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Days array
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Format date helper: YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Human friendly display helper
  const getFormattedSelectedDate = () => {
    if (!selectedDate) return 'No date selected';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Available Time Slots grouped by Morning and Afternoon
  const timeSlots = {
    morning: [
      { id: '08:00 AM', label: '8:00 AM', tag: 'Early Bird' },
      { id: '09:30 AM', label: '9:30 AM', tag: 'Popular' },
      { id: '11:00 AM', label: '11:00 AM', tag: 'Midday' },
    ],
    afternoon: [
      { id: '01:00 PM', label: '1:00 PM', tag: 'Afternoon' },
      { id: '02:30 PM', label: '2:30 PM', tag: 'Peak Time' },
      { id: '04:00 PM', label: '4:00 PM', tag: 'Late Afternoon' },
      { id: '05:30 PM', label: '5:30 PM', tag: 'Evening Slot' },
    ],
  };

  return (
    <div className="space-y-5">
      
      {/* 2-Column Responsive Layout: Left Calendar Grid, Right Time Slots */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Modern Dark Calendar (Col 1-7) */}
        <div className="md:col-span-7 bg-[#07080b] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              <span className="font-heading text-lg font-black text-white uppercase tracking-wide">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day} className="text-[10px] font-bold uppercase text-neutral-400">
                {day}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-9 sm:h-10" />;
              }

              const cellDate = new Date(viewYear, viewMonth, dayNum);
              cellDate.setHours(0, 0, 0, 0);

              const isPast = cellDate < today;
              const dateStr = formatDateString(viewYear, viewMonth, dayNum);
              const isSelected = selectedDate === dateStr;
              const isToday = cellDate.getTime() === today.getTime();

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => onDateChange(dateStr)}
                  className={`h-9 sm:h-10 w-full rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-lg shadow-sky-500/30 scale-105 z-10 ring-2 ring-sky-300'
                      : isPast
                      ? 'text-neutral-600 opacity-30 cursor-not-allowed'
                      : 'text-neutral-200 hover:bg-neutral-800/90 hover:text-sky-400 cursor-pointer active:scale-95'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-sky-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-red-400 text-xs mt-3 flex items-center gap-1">
              <span>* {error}</span>
            </p>
          )}
        </div>

        {/* RIGHT COLUMN: Attractive Time Slot Cards (Col 8-12) */}
        <div className="md:col-span-5 bg-[#07080b] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="font-heading text-lg font-black text-white uppercase tracking-wide">
                  Preferred Time Slot
                </span>
              </div>
            </div>

            {/* Morning Slots */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">
                Morning Arrival
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeSlots.morning.map((slot) => {
                  const isSelected = selectedTime === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onTimeChange(slot.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-md shadow-sky-500/15 ring-1 ring-sky-400'
                          : 'bg-[#0d0f17] border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="block">{slot.label}</span>
                        <span className="text-[9px] text-neutral-400 font-normal">
                          {slot.tag}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">
                Afternoon Arrival
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeSlots.afternoon.map((slot) => {
                  const isSelected = selectedTime === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onTimeChange(slot.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-md shadow-sky-500/15 ring-1 ring-sky-400'
                          : 'bg-[#0d0f17] border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="block">{slot.label}</span>
                        <span className="text-[9px] text-neutral-400 font-normal">
                          {slot.tag}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date & Time Live Summary Card */}
          <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-transparent border border-sky-500/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
              Confirmed Window
            </span>
            <p className="text-xs font-semibold text-white">
              {getFormattedSelectedDate()} · {selectedTime || 'Select time'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
