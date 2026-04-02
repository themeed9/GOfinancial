import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";

interface CalendarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarSheet({ open, onOpenChange }: CalendarSheetProps) {
  const { selectedDate, setSelectedDate } = useBudgetStore();
  
  const currentDate = new Date(selectedDate);
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    onOpenChange(false);
  };

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
  
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isSelected = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };

  const isToday = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pt-4 pb-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle className="text-lg font-semibold text-gray-900">Select Date</SheetTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-600"
            data-testid="button-close-calendar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-900">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button 
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="button-next-month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="aspect-square">
              {day !== null && (
                <button
                  onClick={() => handleSelectDate(day)}
                  className={`w-full h-full rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected(day)
                      ? "bg-gray-900 text-white"
                      : isToday(day)
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  data-testid={`button-day-${day}`}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setSelectedDate(todayStr);
            onOpenChange(false);
          }}
          className="w-full mt-4 py-3 text-center text-blue-600 font-medium hover:bg-blue-50 rounded-full transition-colors"
          data-testid="button-today"
        >
          Go to Today
        </button>
      </SheetContent>
    </Sheet>
  );
}
