import { useBudgetStore } from "@/store/useBudgetStore";

export function WeeklyChart() {
  const { getWeeklyExpenses, getCurrencySymbol } = useBudgetStore();
  const data = getWeeklyExpenses();
  const currency = getCurrencySymbol();
  
  const max = Math.max(...data.map((d) => d.amount), 1);
  const hasData = data.some((d) => d.amount > 0);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${currency}${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${currency}${(amount / 1000).toFixed(0)}K`;
    return `${currency}${amount}`;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold">Weekly Spending</h3>
      
      <div className="bg-blue-50 p-5 rounded-2xl relative">
        <div className="absolute right-4 top-4 flex flex-col justify-between h-20 text-right">
          <span className="text-xs text-muted-foreground font-medium">{formatAmount(max)}</span>
          <span className="text-xs text-muted-foreground font-medium">{formatAmount(max / 2)}</span>
          <span className="text-xs text-muted-foreground font-medium">{formatAmount(max / 5)}</span>
        </div>

        <div className="h-24 w-full relative pr-16">
          {hasData ? (
            <div className="h-full flex items-end gap-2">
              {data.map((d, i) => {
                const height = d.amount > 0 ? (d.amount / max) * 100 : 0;
                const isToday = i === data.length - 1;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isToday ? "bg-blue-500" : "bg-blue-200"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No expenses this week
            </div>
          )}
        </div>

        {hasData && (
          <div className="flex justify-between mt-2 pr-16">
            {data.map((d, i) => (
              <span
                key={d.date}
                className={`text-xs font-medium ${
                  i === data.length - 1 ? "text-blue-600" : "text-muted-foreground"
                }`}
              >
                {d.day}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
