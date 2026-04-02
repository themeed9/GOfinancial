import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBudgetStore, COUNTRIES } from "@/store/budgetStore";
import { CountryFlag } from "./CountrySelector";

interface BudgetModalProps {
  open: boolean;
  onSubmit: (budget: number) => void;
  onBack: () => void;
  onClose: () => void;
}

export function BudgetModal({ open, onSubmit, onBack, onClose }: BudgetModalProps) {
  const [amount, setAmount] = useState("50,000.00");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { selectedCountryCode, setCountry, getCurrencySymbol } = useBudgetStore();
  const currency = getCurrencySymbol();

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

  const [amountError, setAmountError] = useState("");

  const handleSubmit = () => {
    const budget = parseAmount();
    if (budget <= 0 || isNaN(budget)) {
      setAmountError("Budget must be a positive number");
      return;
    }
    setAmountError("");
    onSubmit(budget);
  };

  const isValid = parseAmount() > 0 && !isNaN(parseAmount());

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <button 
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center text-gray-400"
              data-testid="button-back-budget"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-medium text-gray-500">Set your monthly budget</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 flex flex-col px-6 pt-4">
            <div className="w-full space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg"
                  data-testid="button-select-country"
                >
                  <CountryFlag code={selectedCountryCode} size={28} />
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              {showCountryPicker && (
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setCountry(country.code);
                        setShowCountryPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedCountryCode === country.code ? "bg-gray-50" : ""
                      }`}
                    >
                      <CountryFlag code={country.code} size={20} />
                      <span className="text-sm text-gray-900">{country.name}</span>
                      <span className="text-sm text-gray-400 ml-auto">{country.currencySymbol}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs text-gray-400 text-center">
                  Input Monthly Spending Budget
                </label>
                <div className={`border rounded-xl ${amountError ? "border-red-400" : "border-gray-300"}`}>
                  <div className="flex items-center justify-center py-4 px-4">
                    <span className="text-xl font-bold text-gray-900 mr-1">{currency}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => {
                        handleAmountChange(e.target.value);
                        setAmountError("");
                      }}
                      className="bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-300 w-32 text-left"
                      placeholder="0.00"
                      data-testid="input-budget-amount"
                    />
                  </div>
                </div>
                {amountError && (
                  <p className="text-center text-xs text-red-500 mt-1" data-testid="text-budget-error">{amountError}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 pb-8">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full py-4 rounded-full text-base font-semibold transition-all ${
                isValid 
                  ? "bg-gray-900 text-white active:bg-gray-800" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              data-testid="button-set-budget"
            >
              Set Budget
            </button>
          </div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
