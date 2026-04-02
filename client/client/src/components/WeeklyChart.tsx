import { Bar, BarChart, ResponsiveContainer, Cell } from "recharts";
import { useBudgetStore } from "@/store/budgetStore";

export function WeeklyChart() {
  const { getWeeklyExpenses, getCurrencySymbol } = useBudgetStore();
  const weeklyData = getWeeklyExpenses();
  const currency = getCurrencySymbol();
  
  const maxAmount = Math.max(...weeklyData.map(d => d.amount), 1);
  const chartData = weeklyData.map((d, index) => ({
    name: d.day,
    value: d.amount > 0 ? (d.amount / maxAmount) * 100 : 0,
    actualAmount: d.amount,
    isToday: index === weeklyData.length - 1,
  }));

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${currency}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency}${(amount / 1000).toFixed(0)}K`;
    }
    return `${currency}${amount.toLocaleString()}`;
  };

  const topLabel = formatAmount(maxAmount);
  const midLabel = formatAmount(Math.round(maxAmount / 2));
  const lowLabel = formatAmount(Math.round(maxAmount / 5));

  const hasData = weeklyData.some(d => d.amount > 0);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">Weekly spending chart</h3>
      
      <div className="bg-blue-50 p-5 rounded-2xl relative">
        <div className="absolute right-4 top-4 flex flex-col justify-between h-20 text-right">
          <span className="text-xs text-gray-400 font-medium">{topLabel}</span>
          <span className="text-xs text-gray-400 font-medium">{midLabel}</span>
          <span className="text-xs text-gray-400 font-medium">{lowLabel}</span>
        </div>

        <div className="h-24 w-full relative pr-16">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4">
            <div className="border-t border-dashed border-blue-300/60 w-full" />
            <div className="border-t border-dashed border-blue-300/60 w-full" />
            <div className="border-t border-dashed border-blue-300/60 w-full" />
          </div>

          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? "#3B82F6" : "#93C5FD"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No expenses this week
            </div>
          )}
        </div>

        {hasData && (
          <div className="flex justify-between mt-2 pr-16">
            {chartData.map((d, i) => (
              <span 
                key={i} 
                className={`text-xs font-medium ${d.isToday ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {d.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
