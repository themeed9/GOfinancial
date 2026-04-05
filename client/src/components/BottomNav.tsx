import { Pencil, PiggyBank, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/store/useBudgetStore";

interface BottomNavProps {
  onAddClick?: () => void;
  disabled?: boolean;
  onTabSelect?: (type: TransactionType) => void;
  activeTab?: string;
}

export function BottomNav({ onAddClick, disabled, onTabSelect, activeTab }: BottomNavProps) {
  const navItems = [
    { type: "expense" as TransactionType, icon: Pencil,   label: "Expenses" },
    { type: "savings" as TransactionType, icon: PiggyBank, label: "Savings"  },
    { type: "revenue" as TransactionType, icon: Wallet,   label: "Revenue"  },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-50">
      {/* Dark nav bar */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-6 safe-bottom"
        style={{ background: "var(--nav-bg)" }}
      >
        {/* Add Budget — prominent blue button */}
        <button
          onClick={disabled ? undefined : onAddClick}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center gap-1.5 group",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              disabled
                ? "bg-gray-600"
                : "bg-[#1A6BFF] shadow-lg shadow-blue-700/40 group-active:scale-95"
            )}
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-gray-400">Add budget</span>
        </button>

        {/* Other nav items */}
        {navItems.map(({ type, icon: Icon, label }) => {
          const isActive = activeTab === label;
          return (
            <button
              key={type}
              onClick={() => onTabSelect?.(type)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-[#1A3466]"
                    : "bg-[#162035] group-hover:bg-[#1A2648] group-active:scale-95"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-[#5B9AFF]" : "text-gray-500"
                  )}
                  strokeWidth={isActive ? 2 : 1.75}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-white" : "text-gray-500"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
