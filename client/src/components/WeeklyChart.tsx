import { useBudgetStore } from "@/store/useBudgetStore";

export function WeeklyChart() {
  const { getWeeklyExpenses, getCurrencySymbol } = useBudgetStore();
  const data = getWeeklyExpenses();
  const currency = getCurrencySymbol();

  const max = Math.max(...data.map((d) => d.amount), 1);
  const hasData = data.some((d) => d.amount > 0);

  const W = 300;
  const H = 100;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 12;
  const PAD_B = 20;

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) return `${currency}${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `${currency}${(amount / 1_000).toFixed(0)}K`;
    return `${currency}${amount}`;
  };

  // Map data points to SVG coordinates
  const points = data.map((d, i) => {
    const x = PAD_L + (i / (data.length - 1)) * chartW;
    const y = PAD_T + chartH - (d.amount / max) * chartH;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Reference lines at 100% and 50% of max
  const y100 = PAD_T;                        // max value line
  const y50  = PAD_T + chartH / 2;          // mid value line

  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-bold text-gray-900">Weekly spending chart</h3>

      <div className="bg-[#EEF4FF] rounded-3xl p-4 relative overflow-hidden">
        {/* Right-side labels */}
        <div className="absolute right-4 top-0 flex flex-col justify-between h-full py-4 text-right">
          <span className="text-[10px] font-medium text-gray-400">{formatAmount(max)}</span>
          <span className="text-[10px] font-medium text-gray-400">{formatAmount(max / 2)}</span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 110 }}
          preserveAspectRatio="none"
        >
          {/* Dashed reference lines */}
          <line
            x1={PAD_L} y1={y100}
            x2={W - PAD_R - 40} y2={y100}
            stroke="#93C5FD"
            strokeWidth="1"
            strokeDasharray="5,4"
          />
          <line
            x1={PAD_L} y1={y50}
            x2={W - PAD_R - 40} y2={y50}
            stroke="#93C5FD"
            strokeWidth="1"
            strokeDasharray="5,4"
          />

          {hasData ? (
            <>
              {/* Gradient fill under line */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`${points[0].x},${PAD_T + chartH} ${polyline} ${points[points.length - 1].x},${PAD_T + chartH}`}
                fill="url(#chartGrad)"
              />
              {/* Blue line */}
              <polyline
                points={polyline}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-dash"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
              {/* Dots at each point */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === points.length - 1 ? 4 : 2.5}
                  fill={i === points.length - 1 ? "#2563EB" : "#93C5FD"}
                  stroke="white"
                  strokeWidth="1.5"
                />
              ))}
            </>
          ) : (
            /* Empty state — flat dashed line */
            <line
              x1={PAD_L} y1={PAD_T + chartH / 2}
              x2={W - PAD_R - 40} y2={PAD_T + chartH / 2}
              stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="5,4"
            />
          )}

          {/* Day labels on x-axis */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="7"
              fill={i === points.length - 1 ? "#2563EB" : "#94A3B8"}
              fontWeight={i === points.length - 1 ? "700" : "500"}
            >
              {p.day}
            </text>
          ))}
        </svg>

        {!hasData && (
          <p className="text-center text-xs text-gray-400 mt-1">No expenses this week</p>
        )}
      </div>
    </div>
  );
}
