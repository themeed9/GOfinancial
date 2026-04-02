import { ArrowDown, ArrowUp, Pencil, PiggyBank } from "lucide-react";

interface TransactionCardProps {
  id: string;
  title: string;
  amount: number;
  currency?: string;
  type?: "expenses" | "revenue" | "savings";
  onEdit?: (id: string) => void;
}

export function TransactionCard({ id, title, amount, currency = "₦", type = "expenses", onEdit }: TransactionCardProps) {
  const getIcon = () => {
    switch (type) {
      case "revenue":
        return <ArrowUp className="w-5 h-5 text-gray-900" strokeWidth={2.5} />;
      case "savings":
        return <PiggyBank className="w-5 h-5 text-gray-900" strokeWidth={2} />;
      default:
        return <ArrowDown className="w-5 h-5 text-gray-900" strokeWidth={2.5} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "revenue":
        return "bg-green-400";
      case "savings":
        return "bg-blue-400";
      default:
        return "bg-yellow-400";
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl transition-all duration-200 active:scale-[0.98] animate-in fade-in slide-in-from-top-2"
      data-testid={`transaction-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${getIconBg()} flex items-center justify-center`}>
          {getIcon()}
        </div>
        <span className="font-medium text-gray-900 text-sm">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900">
          {type === "revenue" ? "+" : ""}{currency}{amount.toLocaleString()}
        </span>
        <button 
          onClick={handleEditClick}
          className="w-7 h-7 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
          data-testid={`button-edit-${id}`}
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
