import { ArrowDown, ArrowUp, PiggyBank, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/store/useBudgetStore";

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
  onEdit?: (id: string) => void;
}

const typeConfig: Record<TransactionType, { icon: typeof ArrowDown; bg: string; sign: string }> = {
  expense: { icon: ArrowDown, bg: "bg-red-100", sign: "-" },
  revenue: { icon: ArrowUp, bg: "bg-green-100", sign: "+" },
  savings: { icon: PiggyBank, bg: "bg-blue-100", sign: "" },
};

export function TransactionCard({ transaction, currency, onEdit }: TransactionCardProps) {
  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl transition-all duration-200 active:scale-[0.98] animate-slide-in-top">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.title}</p>
          <p className="text-xs text-muted-foreground">{transaction.category}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm">
          {config.sign}{currency}{transaction.amount.toLocaleString()}
        </span>
        {onEdit && (
          <button
            onClick={() => onEdit(transaction.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
