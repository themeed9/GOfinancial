import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useBudgetStore } from "@/store/budgetStore";

const monthList = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export default function MonthScreen() {
  const params = useParams<{ year: string; month: string }>();
  const { year, month } = params;
  const [, setLocation] = useLocation();
  const { expenses, getCurrencySymbol } = useBudgetStore();
  const currency = getCurrencySymbol();

  const monthIndex = monthList.indexOf(month || "");

  const transactions = expenses.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === Number(year) && d.getMonth() === monthIndex;
  });

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout className="pb-24">
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => setLocation(`/year/${year}`)}
          className="mb-4 flex items-center gap-1 text-gray-500"
          data-testid="button-back-to-year"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{month} {year}</h1>
        <p className="text-base text-gray-500 mt-1">
          Total Spent: {currency}{total.toLocaleString()}
        </p>
      </div>

      <div className="px-6 space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center" data-testid="text-empty-state">No transactions recorded.</p>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              className="bg-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between"
              data-testid={`transaction-item-${t.id}`}
            >
              <span className="text-base text-gray-900">{t.description}</span>
              <span className="text-base font-semibold text-gray-900">
                {currency}{t.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </Layout>
  );
}
