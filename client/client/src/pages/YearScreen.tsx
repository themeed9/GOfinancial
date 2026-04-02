import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useBudgetStore, FIXED_CATEGORIES, type Transaction } from "@/store/budgetStore";

const monthList = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
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

function TransactionSection({
  title,
  items,
  currency,
  color,
}: {
  title: string;
  items: Transaction[];
  currency: string;
  color: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;
  const total = items.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{title}</span>
        <span className={`text-xs font-medium ${color}`}>{currency}{total.toLocaleString()}</span>
      </div>
      <div className="space-y-1.5">
        {visible.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5"
            data-testid={`year-transaction-${t.id}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-gray-800 truncate">{t.description}</span>
              {t.category && (
                <span className="text-[10px] text-gray-400 shrink-0">{t.category}</span>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-900 shrink-0 ml-2">
              {currency}{t.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 mt-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          data-testid={`button-toggle-${title.toLowerCase()}`}
        >
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

function CategoryBreakdown({
  expenses,
  currency,
}: {
  expenses: Transaction[];
  currency: string;
}) {
  if (expenses.length === 0) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const breakdown = FIXED_CATEGORIES.map((cat) => {
    const catExpenses = expenses.filter((e) => (e.category || "Other") === cat);
    const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    return { category: cat, amount, percentage, count: catExpenses.length };
  }).filter((b) => b.amount > 0);

  if (breakdown.length === 0) return null;

  return (
    <div className="mt-4 bg-white rounded-xl p-3" data-testid="category-breakdown">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category Breakdown</p>
      <div className="space-y-2">
        {breakdown.map((b) => (
          <div key={b.category} data-testid={`category-row-${b.category.toLowerCase()}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[b.category] || "bg-gray-400"}`} />
                <span className="text-xs text-gray-700">{b.category}</span>
              </div>
              <span className="text-xs font-medium text-gray-900">{currency}{b.amount.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${CATEGORY_COLORS[b.category] || "bg-gray-400"}`}
                style={{ width: `${Math.max(b.percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function YearScreen() {
  const params = useParams<{ year: string }>();
  const year = params.year;
  const [, setLocation] = useLocation();
  const { expenses, revenues, savings, getCurrencySymbol } = useBudgetStore();
  const currency = getCurrencySymbol();

  const getMonthTransactions = (monthName: string) => {
    const monthIndex = monthList.indexOf(monthName);
    const filter = (list: Transaction[]) =>
      list.filter((t) => {
        const d = new Date(t.createdAt);
        return d.getFullYear() === Number(year) && d.getMonth() === monthIndex;
      });
    return {
      expenses: filter(expenses),
      revenues: filter(revenues),
      savings: filter(savings),
    };
  };

  return (
    <Layout className="pb-24">
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => setLocation("/profile")}
          className="mb-4 flex items-center gap-1 text-gray-500"
          data-testid="button-back-to-profile"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Meed-Acc{year}</h1>
      </div>

      <div className="px-6 space-y-4">
        {monthList.map((month) => {
          const data = getMonthTransactions(month);
          const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
          const totalRevenue = data.revenues.reduce((s, e) => s + e.amount, 0);
          const totalSavings = data.savings.reduce((s, e) => s + e.amount, 0);
          const hasEntries = data.expenses.length + data.revenues.length + data.savings.length > 0;

          return (
            <div
              key={month}
              className="bg-gray-100 rounded-2xl p-5"
              data-testid={`month-card-${month.toLowerCase()}`}
            >
              <button
                onClick={() => setLocation(`/year/${year}/month/${month}`)}
                className="w-full text-left"
              >
                <h2 className="text-lg font-semibold text-gray-900">{month}</h2>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <p className="text-xs text-gray-500" data-testid={`text-spent-${month.toLowerCase()}`}>
                    Expenses: <span className="font-medium text-gray-700">{currency}{totalExpenses.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Revenue: <span className="font-medium text-green-600">{currency}{totalRevenue.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Savings: <span className="font-medium text-blue-600">{currency}{totalSavings.toLocaleString()}</span>
                  </p>
                </div>
              </button>

              {hasEntries && (
                <>
                  <TransactionSection
                    title="Expenses"
                    items={data.expenses}
                    currency={currency}
                    color="text-red-500"
                  />
                  <TransactionSection
                    title="Revenue"
                    items={data.revenues}
                    currency={currency}
                    color="text-green-500"
                  />
                  <TransactionSection
                    title="Savings"
                    items={data.savings}
                    currency={currency}
                    color="text-blue-500"
                  />
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
