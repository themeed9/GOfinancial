import { Sheet, SheetContent, SheetTitle, SheetClose } from "./ui/sheet";
import { useBudgetStore } from "@/store/useBudgetStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarSheet({ open, onOpenChange }: CalendarSheetProps) {
  const { selectedDate, setSelectedDate } = useBudgetStore();
  
  const current = new Date(selectedDate);
  const [viewMonth, setViewMonth] = useState(current.getMonth());
  const [viewYear, setViewYear] = useState(current.getFullYear());
  
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDay(viewMonth, viewYear);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDate = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    onOpenChange(false);
  };

  const isSelected = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr === selectedDate;
  };

  const isToday = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr === todayStr;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-t-3xl px-6 pt-4 pb-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle>Select Date</SheetTitle>
          <SheetClose onClick={() => onOpenChange(false)} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => (
            <div key={i} className="aspect-square">
              {day !== null && (
                <button
                  onClick={() => selectDate(day)}
                  className={`w-full h-full rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected(day)
                      ? "bg-foreground text-white"
                      : isToday(day)
                      ? "bg-blue-100 text-blue-600"
                      : "text-foreground hover:bg-secondary"
                  }`}
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
          className="w-full mt-4 py-3 text-center text-blue-500 font-medium hover:bg-blue-50 rounded-full transition-colors"
        >
          Go to Today
        </button>
      </SheetContent>
    </Sheet>
  );
}
