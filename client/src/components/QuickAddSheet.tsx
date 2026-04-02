import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetClose } from "./ui/sheet";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatAmountInput, parseAmount } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Action = "add" | "reduce" | null;

export function QuickAddSheet({ open, onOpenChange }: QuickAddSheetProps) {
  const { addTransaction, getCurrencySymbol, currentBalance } = useBudgetStore();
  const currency = getCurrencySymbol();
  
  const [action, setAction] = useState<Action>(null);
  const [amount, setAmount] = useState("");
  
  const isExhausted = currentBalance <= 0;

  const handleClose = () => {
    setAction(null);
    setAmount("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    const parsed = parseAmount(amount);
    if (parsed <= 0) return;
    
    if (action === "add") {
      addTransaction("Addition to budget", parsed, "revenue", "Salary");
    } else if (action === "reduce") {
      addTransaction("Budget reduction", parsed, "expense", "Other");
    }
    
    handleClose();
  };

  const parsedAmount = parseAmount(amount);
  const isValid = parsedAmount > 0;

  if (action === null) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="rounded-t-3xl px-6 pt-4 pb-10 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="w-8" />
            <SheetTitle>Quick Action</SheetTitle>
            <SheetClose onClick={handleClose} />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setAction("add")}
              className="w-full flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-semibold block">Add to Budget</span>
                <span className="text-sm text-muted-foreground">Increase your balance</span>
              </div>
            </button>

            <button
              onClick={() => !isExhausted && setAction("reduce")}
              disabled={isExhausted}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                isExhausted ? "bg-secondary opacity-50 cursor-not-allowed" : "bg-red-50 hover:bg-red-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExhausted ? "bg-gray-400" : "bg-red-500"}`}>
                <Minus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className={`text-lg font-semibold block ${isExhausted ? "text-muted-foreground" : ""}`}>
                  Reduce Budget
                </span>
                <span className="text-sm text-muted-foreground">
                  {isExhausted ? "Budget exhausted" : "Decrease your balance"}
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
      <SheetContent className="rounded-t-3xl px-6 pt-4 pb-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle>{action === "add" ? "Add to Budget" : "Reduce Budget"}</SheetTitle>
          <SheetClose onClick={handleClose} />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-center text-sm text-muted-foreground font-medium">
              Enter Amount
            </label>
            <div className="bg-secondary rounded-full py-4 px-6 flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-muted-foreground">{currency}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(formatAmountInput(e.target.value))}
                className="bg-transparent text-2xl font-bold text-center w-full outline-none placeholder:text-muted-foreground"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full py-4 rounded-full text-base font-semibold transition-all ${
              isValid
                ? action === "add"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            {action === "add" ? "Add to Budget" : "Reduce Budget"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
