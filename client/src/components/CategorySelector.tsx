import { Sheet, SheetContent, SheetTitle, SheetClose } from "./ui/sheet";
import { CATEGORIES, type TransactionType } from "@/store/useBudgetStore";
import { useBudgetStore } from "@/store/useBudgetStore";

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: TransactionType) => void;
}

export function CategorySelector({ open, onOpenChange, onSelect }: CategorySelectorProps) {
  const { currentBalance } = useBudgetStore();
  const isExhausted = currentBalance <= 0;

  const handleSelect = (type: TransactionType) => {
    if ((type === "expense" || type === "savings") && isExhausted) return;
    onOpenChange(false);
    onSelect(type);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-t-3xl px-6 pt-4 pb-10 bg-white">
        <div className="flex items-center justify-between mb-8">
          <div className="w-8" />
          <SheetTitle>Select Category</SheetTitle>
          <SheetClose onClick={() => onOpenChange(false)} />
        </div>

        {isExhausted && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-center">
            <p className="text-red-600 font-semibold text-sm">Budget Exhausted</p>
            <p className="text-red-400 text-xs mt-1">
              Add revenue to continue tracking expenses or savings.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {(["expense", "revenue", "savings"] as TransactionType[]).map((type) => {
            const isDisabled = (type === "expense" || type === "savings") && isExhausted;
            const labels = {
              expense: "Expenses",
              revenue: "Revenue",
              savings: "Savings",
            };
            const colors = {
              expense: "text-red-500",
              revenue: "text-green-500",
              savings: "text-blue-500",
            };

            return (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                disabled={isDisabled}
                className={`w-full rounded-full py-4 px-6 text-left font-display font-bold text-xl transition-colors ${
                  isDisabled
                    ? "bg-secondary opacity-50 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary/80"
                } ${!isDisabled ? colors[type] : ""}`}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
