import { ArrowDown, ArrowUp, PiggyBank, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/store/useBudgetStore";

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
  onEdit?: (id: string) => void;
}

const typeConfig: Record<TransactionType, { icon: typeof ArrowDown; bg: string; iconColor: string; sign: string }> = {
  expense: { icon: ArrowDown, bg: "bg-red-50",   iconColor: "text-red-500",   sign: ""  },
  revenue: { icon: ArrowUp,   bg: "bg-green-50", iconColor: "text-green-600", sign: "+" },
  savings: { icon: PiggyBank, bg: "bg-blue-50",  iconColor: "text-blue-500",  sign: ""  },
};

export function TransactionCard({ transaction, currency, onEdit }: TransactionCardProps) {
  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl card-shadow border border-gray-100 transition-all duration-200 active:scale-[0.98] animate-slide-in-top">
      {/* Left: icon + title */}
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
          <Icon className={cn("w-5 h-5", config.iconColor)} strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900 leading-tight">{transaction.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{transaction.category}</p>
        </div>
      </div>

      {/* Right: amount + edit */}
      <div className="flex items-center gap-2.5">
        <span className="font-bold text-sm text-gray-900">
          {config.sign}{currency}{transaction.amount.toLocaleString()}
        </span>
        {onEdit && (
          <button
            onClick={() => onEdit(transaction.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A6BFF] hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
