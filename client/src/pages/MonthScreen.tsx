import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useLocation, useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthScreen() {
  const params = useParams<{ year: string; month: string }>();
  const [, setLocation] = useLocation();
  const { transactions, getCurrencySymbol } = useBudgetStore();
  const currency = getCurrencySymbol();

  const monthIndex = MONTHS.indexOf(params.month || "");

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === Number(params.year) && d.getMonth() === monthIndex;
  });

  const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout className="pb-24">
      <div className="px-6 pt-8 pb-4">
        <button onClick={() => setLocation(`/year/${params.year}`)} className="mb-4 flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-bold">{params.month} {params.year}</h1>
        <p className="text-base text-muted-foreground mt-1">
          Total Spent: {currency}{total.toLocaleString()}
        </p>
      </div>

      <div className="px-6 space-y-3">
        {monthTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No transactions recorded.</p>
        ) : (
          monthTransactions.map((t) => (
            <div key={t.id} className="bg-secondary rounded-2xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base">{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.category}</span>
              </div>
              <span className="text-base font-semibold">
                {t.type === "revenue" ? "+" : ""}{currency}{t.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </Layout>
  );
}
