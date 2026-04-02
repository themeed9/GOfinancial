import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";

type Category = "expense" | "revenue" | "savings";

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (category: Category) => void;
}

export function CategorySelector({ open, onOpenChange, onSelect }: CategorySelectorProps) {
  const { currentBalance } = useBudgetStore();
  const isBalanceExhausted = currentBalance <= 0;

  const handleSelect = (category: Category) => {
    if ((category === "expense" || category === "savings") && isBalanceExhausted) return;
    onOpenChange(false);
    onSelect(category);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl px-6 pt-4 pb-10 bg-white"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="w-8" />
          <SheetTitle className="text-lg font-semibold text-gray-900">Select category</SheetTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-600"
            data-testid="button-close-category"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isBalanceExhausted && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-center" data-testid="text-category-budget-exhausted">
            <p className="text-red-600 font-semibold text-sm">Your budget has been fully spent</p>
            <p className="text-red-400 text-xs mt-1">You've used up your entire budget. To continue adding expenses or savings, first increase your budget by adding revenue or topping up your balance.</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleSelect("expense")}
            disabled={isBalanceExhausted}
            className={`w-full rounded-full py-4 px-6 text-left transition-colors ${
              isBalanceExhausted 
                ? "bg-gray-100 opacity-50 cursor-not-allowed" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            data-testid="button-category-expense"
          >
            <span className={`text-xl font-bold font-display ${isBalanceExhausted ? "text-gray-400" : "text-gray-900"}`}>Expenses</span>
          </button>
          
          <button
            onClick={() => handleSelect("revenue")}
            className="w-full bg-gray-100 rounded-full py-4 px-6 text-left hover:bg-gray-200 transition-colors"
            data-testid="button-category-revenue"
          >
            <span className="text-xl font-bold text-gray-900 font-display">Revenue</span>
          </button>
          
          <button
            onClick={() => handleSelect("savings")}
            disabled={isBalanceExhausted}
            className={`w-full rounded-full py-4 px-6 text-left transition-colors ${
              isBalanceExhausted 
                ? "bg-gray-100 opacity-50 cursor-not-allowed" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            data-testid="button-category-savings"
          >
            <span className={`text-xl font-bold font-display ${isBalanceExhausted ? "text-gray-400" : "text-gray-900"}`}>Savings</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
