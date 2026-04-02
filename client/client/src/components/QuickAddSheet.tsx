import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { X, Plus, Minus } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActionType = "add" | "reduce" | null;

export function QuickAddSheet({ open, onOpenChange }: QuickAddSheetProps) {
  const [action, setAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState("");
  const { addRevenue, addExpense, getCurrencySymbol, currentBalance } = useBudgetStore();
  const currency = getCurrencySymbol();
  const isBalanceExhausted = currentBalance <= 0;

  const handleClose = () => {
    setAction(null);
    setAmount("");
    onOpenChange(false);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (numericValue) {
      const parts = numericValue.split(".");
      const integerPart = parseInt(parts[0] || "0", 10);
      const formatted = integerPart.toLocaleString();
      if (parts.length > 1) {
        setAmount(formatted + "." + parts[1].slice(0, 2));
      } else {
        setAmount(formatted);
      }
    } else {
      setAmount("");
    }
  };

  const parseAmount = (): number => {
    return parseFloat(amount.replace(/,/g, "")) || 0;
  };

  const isValid = parseAmount() > 0;

  const handleSubmit = () => {
    if (!isValid || !action) return;
    
    const numericAmount = parseAmount();
    
    if (action === "add") {
      addRevenue("Addition to budget", numericAmount);
    } else {
      addExpense("Budget reduction", numericAmount);
    }
    
    handleClose();
  };

  if (action === null) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pt-4 pb-10 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="w-8" />
            <SheetTitle className="text-lg font-semibold text-gray-900">Budget Action</SheetTitle>
            <button 
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-gray-600"
              data-testid="button-close-quick-add"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setAction("add")}
              className="w-full flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors"
              data-testid="button-add-to-budget"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-semibold text-gray-900 block">Add to budget</span>
                <span className="text-sm text-gray-500">Increase your balance</span>
              </div>
            </button>
            
            <button
              onClick={() => !isBalanceExhausted && setAction("reduce")}
              disabled={isBalanceExhausted}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                isBalanceExhausted 
                  ? "bg-gray-100 opacity-50 cursor-not-allowed" 
                  : "bg-red-50 hover:bg-red-100"
              }`}
              data-testid="button-reduce-budget"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isBalanceExhausted ? "bg-gray-400" : "bg-red-500"}`}>
                <Minus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className={`text-lg font-semibold block ${isBalanceExhausted ? "text-gray-400" : "text-gray-900"}`}>Reduce budget</span>
                <span className="text-sm text-gray-500">
                  {isBalanceExhausted ? "Budget exhausted" : "Decrease your balance"}
                </span>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pt-4 pb-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle className="text-lg font-semibold text-gray-900">
            {action === "add" ? "Add to Budget" : "Reduce Budget"}
          </SheetTitle>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-600"
            data-testid="button-close-amount"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-center text-gray-400 text-sm font-medium">
              Enter Amount
            </label>
            <div className="bg-gray-100 rounded-full py-4 px-6 flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-gray-400">{currency}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-transparent text-center text-2xl font-bold text-gray-900 outline-none font-display placeholder:text-gray-300 w-full"
                placeholder="0.00"
                autoFocus
                data-testid="input-quick-amount"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full py-4 rounded-full text-base font-semibold transition-all duration-200 ${
              isValid 
                ? action === "add"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            data-testid="button-quick-add-confirm"
          >
            {action === "add" ? "Add to Budget" : "Reduce Budget"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
