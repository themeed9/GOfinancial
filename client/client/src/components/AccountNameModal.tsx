import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountNameModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function AccountNameModal({ open, onSubmit, onClose }: AccountNameModalProps) {
  const [name, setName] = useState("Meed-Acc2026");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          <div className="flex items-center justify-center px-4 py-4">
            <h1 className="text-sm font-medium text-gray-500">Set your budget account name</h1>
          </div>

          <div className="flex-1 flex flex-col px-6 pt-8">
            <div className="w-full space-y-6">
              <div className="space-y-3">
                <label className="block text-xs text-gray-400 text-center">
                  Input Account Name
                </label>
                <div className="border border-gray-300 rounded-xl">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-center text-lg font-semibold text-gray-900 py-4 px-4 outline-none placeholder:text-gray-300"
                    placeholder="e.g., My Budget 2026"
                    autoFocus
                    data-testid="input-account-name"
                  />
                </div>
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
              data-testid="button-continue-account"
            >
              Continue
            </button>
          </div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
