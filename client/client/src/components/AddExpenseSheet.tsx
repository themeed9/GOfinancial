import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { X, Trash2, ChevronDown } from "lucide-react";
import { useBudgetStore, Transaction, FIXED_CATEGORIES, type Category } from "@/store/budgetStore";

type TransactionType = "expense" | "revenue" | "savings";

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  editingTransaction?: Transaction | null;
  isEditMode?: boolean;
}

const titles: Record<TransactionType, { add: string; edit: string }> = {
  expense: { add: "Add expenses", edit: "Edit expense" },
  revenue: { add: "Add revenue", edit: "Edit revenue" },
  savings: { add: "Add savings", edit: "Edit savings" },
};

const buttonLabels: Record<TransactionType, { add: string; edit: string }> = {
  expense: { add: "Add New Expenses", edit: "Update Expense" },
  revenue: { add: "Add New Revenue", edit: "Update Revenue" },
  savings: { add: "Add to Savings", edit: "Update Savings" },
};

export function AddExpenseSheet({ 
  open, 
  onOpenChange, 
  type, 
  editingTransaction,
  isEditMode = false 
}: AddExpenseSheetProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [descError, setDescError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { 
    addExpense, addRevenue, addSavings,
    updateExpense, updateRevenue, updateSavings,
    deleteExpense, deleteRevenue, deleteSavings,
    clearEditing,
    currentBalance,
    getCurrencySymbol,
  } = useBudgetStore();
  const currency = getCurrencySymbol();

  useEffect(() => {
    if (open) {
      setAmountError("");
      setDescError("");
      setShowDeleteConfirm(false);
      setShowCategoryPicker(false);
      if (isEditMode && editingTransaction) {
        const formattedAmount = editingTransaction.amount.toLocaleString();
        setAmount(formattedAmount);
        setDescription(editingTransaction.description);
        setCategory(editingTransaction.category || "Other");
      } else {
        setAmount("");
        setDescription("");
        setCategory("Other");
      }
    }
  }, [open, isEditMode, editingTransaction]);

  const handleAmountChange = (value: string) => {
    setAmountError("");
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

  const isBalanceExhausted = currentBalance <= 0 && (type === "expense" || type === "savings") && !isEditMode;
  const wouldExceedBalance = (type === "expense" || type === "savings") && !isEditMode && parseAmount() > currentBalance;

  const validate = (): boolean => {
    let valid = true;
    const parsed = parseAmount();

    if (isBalanceExhausted) {
      setAmountError("Budget exhausted. Add to your budget first.");
      return false;
    }

    if (!amount || parsed <= 0) {
      setAmountError("Please enter a valid amount");
      valid = false;
    } else if (isNaN(parsed) || !isFinite(parsed)) {
      setAmountError("Amount must be a valid number");
      valid = false;
    } else if (wouldExceedBalance) {
      setAmountError(`Amount exceeds balance (${currency}${currentBalance.toLocaleString()})`);
      valid = false;
    } else {
      setAmountError("");
    }

    setDescError("");
    return valid;
  };

  const isValid = parseAmount() > 0 && !isNaN(parseAmount()) && isFinite(parseAmount()) && !isBalanceExhausted && !wouldExceedBalance;

  const handleClose = () => {
    clearEditing();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const numericAmount = parseAmount();
    const desc = description.trim() || (type.charAt(0).toUpperCase() + type.slice(1));
    
    if (isEditMode && editingTransaction) {
      switch (type) {
        case "expense":
          updateExpense(editingTransaction.id, desc, numericAmount, category);
          break;
        case "revenue":
          updateRevenue(editingTransaction.id, desc, numericAmount, category);
          break;
        case "savings":
          updateSavings(editingTransaction.id, desc, numericAmount, category);
          break;
      }
    } else {
      switch (type) {
        case "expense":
          addExpense(desc, numericAmount, undefined, category);
          break;
        case "revenue":
          addRevenue(desc, numericAmount, undefined, category);
          break;
        case "savings":
          addSavings(desc, numericAmount, undefined, category);
          break;
      }
    }
    
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!editingTransaction) return;
    
    switch (type) {
      case "expense":
        deleteExpense(editingTransaction.id);
        break;
      case "revenue":
        deleteRevenue(editingTransaction.id);
        break;
      case "savings":
        deleteSavings(editingTransaction.id);
        break;
    }
    
    onOpenChange(false);
  };

  const title = isEditMode ? titles[type].edit : titles[type].add;
  const buttonLabel = isEditMode ? buttonLabels[type].edit : buttonLabels[type].add;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-6 pt-4 pb-8 bg-white">
        <div className="flex items-center justify-between mb-8">
          <div className="w-8" />
          <SheetTitle className="text-lg font-semibold text-gray-900">{title}</SheetTitle>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-600"
            data-testid="button-close-sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mt-8">
          {isBalanceExhausted && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center" data-testid="text-budget-exhausted">
              <p className="text-red-600 font-semibold text-sm">Your budget has been fully spent</p>
              <p className="text-red-400 text-xs mt-1">You've used up your entire budget. To add {type === "savings" ? "savings" : "expenses"}, go back and increase your budget by adding revenue or topping up your balance using the + button.</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-center text-gray-400 text-sm font-medium">
              Input Amount
            </label>
            <div className={`bg-gray-100 rounded-full py-4 px-6 ${amountError ? "ring-2 ring-red-400" : ""}`}>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-transparent text-center text-2xl font-bold text-gray-900 outline-none font-display placeholder:text-gray-300"
                placeholder="0.00"
                data-testid="input-amount"
              />
            </div>
            {amountError && (
              <p className="text-center text-xs text-red-500 mt-1" data-testid="text-amount-error">{amountError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-center text-gray-400 text-sm font-medium">
              Input Description
            </label>
            <div className={`bg-gray-100 rounded-full py-4 px-6 ${descError ? "ring-2 ring-red-400" : ""}`}>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDescError("");
                }}
                className="w-full bg-transparent text-center text-lg font-semibold text-gray-900 outline-none placeholder:text-gray-300"
                placeholder="Enter description"
                maxLength={100}
                data-testid="input-description"
              />
            </div>
            {descError && (
              <p className="text-center text-xs text-red-500 mt-1" data-testid="text-desc-error">{descError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-center text-gray-400 text-sm font-medium">
              Category
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="w-full bg-gray-100 rounded-full py-4 px-6 flex items-center justify-center gap-2"
                data-testid="button-select-category"
              >
                <span className="text-lg font-semibold text-gray-900">{category}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showCategoryPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                  {FIXED_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                      className={`w-full py-3 px-6 text-left text-sm font-medium transition-colors ${
                        category === cat ? "bg-gray-100 text-gray-900" : "text-gray-700 active:bg-gray-50"
                      }`}
                      data-testid={`category-option-${cat.toLowerCase()}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full py-4 rounded-full text-base font-semibold transition-all duration-200 ${
              isValid 
                ? "bg-gray-900 text-white hover:bg-gray-800" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            data-testid="button-submit"
          >
            {buttonLabel}
          </button>
          {(type === "expense" || type === "savings") && !isEditMode && !isBalanceExhausted && (
            <p className="text-center text-xs text-gray-400" data-testid="text-balance-limit-hint">
              You cannot add an amount higher than your current balance ({currency}{currentBalance.toLocaleString()})
            </p>
          )}
          
          {isEditMode && editingTransaction && (
            showDeleteConfirm ? (
              <div className="bg-red-50 rounded-2xl p-4 space-y-3">
                <p className="text-sm text-gray-700 text-center">Delete this entry?</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-semibold"
                    data-testid="button-confirm-delete"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold"
                    data-testid="button-cancel-delete"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-4 rounded-full text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2"
                data-testid="button-delete"
              >
                <Trash2 className="w-5 h-5" />
                Delete Entry
              </button>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
