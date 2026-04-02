import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetFooter } from "./ui/sheet";
import { Button } from "./ui/button";
import { CATEGORIES, type TransactionType, type Transaction, type Category } from "@/store/useBudgetStore";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatAmountInput, parseAmount } from "@/lib/utils";
import { Trash2, ChevronDown } from "lucide-react";

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
}

const titles: Record<TransactionType, { add: string; edit: string }> = {
  expense: { add: "Add Expense", edit: "Edit Expense" },
  revenue: { add: "Add Revenue", edit: "Edit Revenue" },
  savings: { add: "Add Savings", edit: "Edit Savings" },
};

const buttonLabels: Record<TransactionType, { add: string; edit: string }> = {
  expense: { add: "Add Expense", edit: "Update Expense" },
  revenue: { add: "Add Revenue", edit: "Update Revenue" },
  savings: { add: "Add Savings", edit: "Update Savings" },
};

export function AddExpenseSheet({ open, onOpenChange, type }: AddExpenseSheetProps) {
  const {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    currentBalance,
    getCurrencySymbol,
    editingId,
    editingType,
    setEditing,
    getEditingTransaction,
  } = useBudgetStore();

  const currency = getCurrencySymbol();
  const isEditMode = editingId && editingType === type;
  const editingTransaction = isEditMode ? getEditingTransaction() : null;

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [showCategory, setShowCategory] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setShowDelete(false);
      setShowCategory(false);
      if (isEditMode && editingTransaction) {
        setAmount(editingTransaction.amount.toLocaleString());
        setTitle(editingTransaction.title);
        setCategory(editingTransaction.category);
      } else {
        setAmount("");
        setTitle("");
        setCategory("Other");
      }
    }
  }, [open, isEditMode, editingTransaction]);

  const parsedAmount = parseAmount(amount);
  const isBalanceExhausted =
    (type === "expense" || type === "savings") && currentBalance <= 0 && !isEditMode;
  const wouldExceed =
    (type === "expense" || type === "savings") &&
    !isEditMode &&
    parsedAmount > currentBalance;

  const isValid =
    parsedAmount > 0 &&
    !isNaN(parsedAmount) &&
    isFinite(parsedAmount) &&
    !isBalanceExhausted &&
    !wouldExceed;

  const handleClose = () => {
    setEditing(null, null);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!isValid) {
      if (isBalanceExhausted) {
        setError("Budget exhausted. Add revenue first.");
      } else if (wouldExceed) {
        setError(`Amount exceeds balance (${currency}${currentBalance.toLocaleString()})`);
      } else {
        setError("Please enter a valid amount");
      }
      return;
    }

    const txTitle = title.trim() || type.charAt(0).toUpperCase() + type.slice(1);

    if (isEditMode && editingTransaction) {
      updateTransaction(editingTransaction.id, txTitle, parsedAmount, category);
    } else {
      addTransaction(txTitle, parsedAmount, type, category);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (editingTransaction) {
      deleteTransaction(editingTransaction.id);
    }
    onOpenChange(false);
  };

  const titleText = isEditMode ? titles[type].edit : titles[type].add;
  const buttonText = isEditMode ? buttonLabels[type].edit : buttonLabels[type].add;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="h-[85vh] rounded-t-3xl px-6 pt-4 pb-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle>{titleText}</SheetTitle>
          <SheetClose onClick={handleClose} />
        </div>

        <div className="space-y-6 mt-4">
          {isBalanceExhausted && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-red-600 font-semibold text-sm">Budget Exhausted</p>
              <p className="text-red-400 text-xs mt-1">
                Add revenue to continue adding {type === "savings" ? "savings" : "expenses"}.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-center text-sm text-muted-foreground font-medium">
              Amount
            </label>
            <div className={`bg-secondary rounded-full py-4 px-6 ${error ? "ring-2 ring-red-400" : ""}`}>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(formatAmountInput(e.target.value));
                  setError("");
                }}
                className="w-full bg-transparent text-center text-2xl font-bold font-display outline-none placeholder:text-muted-foreground"
                placeholder="0.00"
              />
            </div>
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-center text-sm text-muted-foreground font-medium">
              Description
            </label>
            <div className="bg-secondary rounded-full py-4 px-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-center text-lg font-semibold outline-none placeholder:text-muted-foreground"
                placeholder="Enter description"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-center text-sm text-muted-foreground font-medium">
              Category
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategory(!showCategory)}
                className="w-full bg-secondary rounded-full py-4 px-6 flex items-center justify-center gap-2"
              >
                <span className="text-lg font-semibold">{category}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {showCategory && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-2xl shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setShowCategory(false);
                      }}
                      className={`w-full py-3 px-6 text-left text-sm font-medium transition-colors ${
                        category === cat
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={!isValid} size="lg" className="w-full">
            {buttonText}
          </Button>

          {(type === "expense" || type === "savings") && !isEditMode && !isBalanceExhausted && (
            <p className="text-center text-xs text-muted-foreground">
              Cannot exceed balance ({currency}
              {currentBalance.toLocaleString()})
            </p>
          )}

          {isEditMode && editingTransaction && (
            showDelete ? (
              <div className="bg-red-50 rounded-2xl p-4 space-y-3">
                <p className="text-sm text-center text-muted-foreground">Delete this entry?</p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => setShowDelete(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowDelete(true)}
                variant="ghost"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Entry
              </Button>
            )
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
