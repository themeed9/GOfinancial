import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { useBudgetStore, CATEGORIES, type Transaction } from "@/store/useBudgetStore";
import { useLocation, useParams, Link } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-400",
  Transport: "bg-blue-400",
  Bills: "bg-yellow-500",
  Health: "bg-green-400",
  Salary: "bg-emerald-500",
  Shopping: "bg-pink-400",
  Entertainment: "bg-purple-400",
  Education: "bg-indigo-400",
  Other: "bg-gray-400",
};

interface TransactionSectionProps {
  title: string;
  items: Transaction[];
  currency: string;
  color: string;
}

function TransactionSection({ title, items, currency, color }: TransactionSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;
  const total = items.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase ${color}`}>{title}</span>
        <span className={`text-xs font-medium ${color}`}>{currency}{total.toLocaleString()}</span>
      </div>
      <div className="space-y-1.5">
        {visible.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm truncate">{t.title}</span>
              {t.category && <span className="text-[10px] text-muted-foreground shrink-0">{t.category}</span>}
            </div>
            <span className="text-sm font-semibold shrink-0 ml-2">{currency}{t.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-1 mt-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? (
            <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Show {items.length - 3} more <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  );
}

interface CategoryBreakdownProps {
  expenses: Transaction[];
  currency: string;
}

function CategoryBreakdown({ expenses, currency }: CategoryBreakdownProps) {
  if (expenses.length === 0) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const breakdown = CATEGORIES.map((cat) => {
    const catExpenses = expenses.filter((e) => e.category === cat);
    const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    return { category: cat, amount, percentage };
  }).filter((b) => b.amount > 0);

  if (breakdown.length === 0) return null;

  return (
    <div className="mt-4 bg-white rounded-xl p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Category Breakdown</p>
      <div className="space-y-2">
        {breakdown.map((b) => (
          <div key={b.category}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[b.category]}`} />
                <span className="text-xs">{b.category}</span>
              </div>
              <span className="text-xs font-medium">{currency}{b.amount.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${CATEGORY_COLORS[b.category]}`} style={{ width: `${Math.max(b.percentage, 2)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function YearScreen() {
  const params = useParams<{ year: string }>();
  const [, setLocation] = useLocation();
  const { transactions, getCurrencySymbol } = useBudgetStore();
  const currency = getCurrencySymbol();

  const getMonthTransactions = (monthIndex: number) => {
    const year = Number(params.year);
    return {
      expenses: transactions.filter((t) => t.type === "expense" && new Date(t.createdAt).getFullYear() === year && new Date(t.createdAt).getMonth() === monthIndex),
      revenues: transactions.filter((t) => t.type === "revenue" && new Date(t.createdAt).getFullYear() === year && new Date(t.createdAt).getMonth() === monthIndex),
      savings: transactions.filter((t) => t.type === "savings" && new Date(t.createdAt).getFullYear() === year && new Date(t.createdAt).getMonth() === monthIndex),
    };
  };

  return (
    <Layout className="pb-24">
      <div className="px-6 pt-8 pb-4">
        <button onClick={() => setLocation("/profile")} className="mb-4 flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-bold">Meed-Acc{params.year}</h1>
      </div>

      <div className="px-6 space-y-4">
        {MONTHS.map((month, idx) => {
          const data = getMonthTransactions(idx);
          const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
          const totalRevenue = data.revenues.reduce((s, e) => s + e.amount, 0);
          const totalSavings = data.savings.reduce((s, e) => s + e.amount, 0);
          const hasEntries = data.expenses.length + data.revenues.length + data.savings.length > 0;

          return (
            <div key={month} className="bg-secondary rounded-2xl p-5">
              <Link href={`/year/${params.year}/month/${month}`}>
                <button className="w-full text-left">
                  <h2 className="text-lg font-semibold">{month}</h2>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      Expenses: <span className="font-medium text-red-500">{currency}{totalExpenses.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Revenue: <span className="font-medium text-green-500">{currency}{totalRevenue.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Savings: <span className="font-medium text-blue-500">{currency}{totalSavings.toLocaleString()}</span>
                    </p>
                  </div>
                </button>
              </Link>

              {hasEntries && (
                <>
                  <TransactionSection title="Expenses" items={data.expenses} currency={currency} color="text-red-500" />
                  <TransactionSection title="Revenue" items={data.revenues} currency={currency} color="text-green-500" />
                  <TransactionSection title="Savings" items={data.savings} currency={currency} color="text-blue-500" />
                  <CategoryBreakdown expenses={data.expenses} currency={currency} />
                </>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </Layout>
  );
}
