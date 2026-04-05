import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { SegmentedControl } from "@/components/SegmentedControl";
import { WeeklyChart } from "@/components/WeeklyChart";
import { TransactionCard } from "@/components/TransactionCard";
import { BottomNav } from "@/components/BottomNav";
import { CategorySelector } from "@/components/CategorySelector";
import { CountrySelector, CountryFlag } from "@/components/CountrySelector";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { CalendarSheet } from "@/components/CalendarSheet";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { useBudgetStore, type TransactionType } from "@/store/useBudgetStore";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// Diagonal arrows icon (matching reference image top-right)
function DiagonalArrowsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

// Meed logo text component
function MeedLogo() {
  return (
    <span
      className="text-[22px] font-black italic tracking-tight text-gray-900"
      style={{ fontFamily: "var(--font-display)" }}
    >
      Meed
    </span>
  );
}

export default function Home() {
  const {
    currentBalance,
    monthlyBudget,
    transactions,
    selectedDate,
    setSelectedDate,
    getCurrencySymbol,
    getSelectedCountry,
    setEditing,
    profileImage,
    profileName,
  } = useBudgetStore();

  const currency = getCurrencySymbol();
  const country = getSelectedCountry();
  const today = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState("Expenses");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addType, setAddType] = useState<TransactionType>("expense");

  const [displayBalance, setDisplayBalance] = useState(currentBalance);
  const prevBalanceRef = useRef(currentBalance);

  useEffect(() => {
    if (selectedDate !== today) {
      setSelectedDate(today);
    }
  }, []);

  useEffect(() => {
    if (prevBalanceRef.current !== currentBalance) {
      const start = prevBalanceRef.current;
      const end = currentBalance;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayBalance(Math.round(start + (end - start) * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
      prevBalanceRef.current = currentBalance;
    }
  }, [currentBalance]);

  const isFutureDate = selectedDate > today;

  const handleAddClick = () => {
    if (isFutureDate) return;
    setShowCategorySelector(true);
  };

  const handleCategorySelect = (type: TransactionType) => {
    setAddType(type);
    setShowAddSheet(true);
  };

  const handleEditTransaction = (id: string) => {
    setEditing(id, addType);
    setShowAddSheet(true);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const current = new Date(selectedDate);
    if (direction === "prev") current.setDate(current.getDate() - 1);
    else current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const getTransactionType = (): TransactionType => {
    switch (activeTab) {
      case "Expenses": return "expense";
      case "Revenue":  return "revenue";
      case "Savings":  return "savings";
      default:         return "expense";
    }
  };

  const handleNavTabSelect = (type: TransactionType) => {
    switch (type) {
      case "expense": setActiveTab("Expenses"); break;
      case "savings": setActiveTab("Savings");  break;
      case "revenue": setActiveTab("Revenue");  break;
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.type === getTransactionType() &&
      t.createdAt.substring(0, 10) === selectedDate.substring(0, 10)
  );
  const dailyTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Format balance: "NGN 47,500.00" style — whole + decimals split
  const wholeStr = displayBalance.toLocaleString();
  const currencyCode = country.code === "NG" ? "NGN"
    : country.code === "US" ? "USD"
    : country.code === "GB" ? "GBP"
    : country.code === "EU" ? "EUR"
    : currency;

  return (
    <Layout className="pb-28">
      {/* ── Top bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        {/* Avatar + Meed logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-200">
            {profileImage ? (
              <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-500">
                {profileName?.[0]?.toUpperCase() ?? "M"}
              </span>
            )}
          </div>
          <MeedLogo />
        </div>

        {/* Diagonal arrows / notification icon */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#1A6BFF] hover:bg-blue-50 transition-colors"
          aria-label="Settings"
        >
          <DiagonalArrowsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── Balance section ───────────────────────────────── */}
      <div className="flex flex-col items-center px-6 pt-5 pb-5">
        {/* Country flag + chevron */}
        <button
          onClick={() => setShowCountrySelector(true)}
          className="flex items-center gap-1.5 mb-3"
        >
          <CountryFlag code={country.code} size={22} />
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Label */}
        <p className="text-gray-500 text-sm font-medium mb-1">Total Balance</p>

        {/* Big balance display */}
        <div className="flex items-baseline gap-0.5">
          <span className="text-[#1A6BFF] font-black text-4xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {currencyCode}&nbsp;{wholeStr}
          </span>
          <span className="text-[#1A6BFF] text-xl font-bold opacity-60">.00</span>
        </div>
      </div>

      {/* ── Segmented tab ─────────────────────────────────── */}
      <div className="px-5 mb-3">
        <SegmentedControl
          options={["Expenses", "Revenue", "Savings"]}
          selected={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* ── Date navigation row ───────────────────────────── */}
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateDate("prev")}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="text-gray-600 text-xs font-semibold hover:text-gray-900 transition-colors"
          >
            {formatDate(selectedDate)}
          </button>
          <button
            onClick={() => navigateDate("next")}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <span className="text-xs text-gray-400 font-medium">
          Today's total:&nbsp;
          <span className="text-gray-600 font-semibold">
            {currency}{dailyTotal.toLocaleString()}
          </span>
        </span>
      </div>

      {/* ── Transaction list ──────────────────────────────── */}
      <div className="px-5 space-y-2.5 mb-5">
        {isFutureDate ? (
          <div className="py-10 text-center">
            <p className="text-gray-400 text-base">No entries yet</p>
            <p className="text-gray-300 text-xs mt-1">Future dates cannot have entries</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No {activeTab.toLowerCase()} for this date
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              currency={currency}
              onEdit={handleEditTransaction}
            />
          ))
        )}
      </div>

      {/* ── Weekly chart ──────────────────────────────────── */}
      {!isFutureDate && (
        <div className="px-5 mb-6">
          <WeeklyChart />
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-8" />

      {/* ── Bottom navigation ────────────────────────────── */}
      <BottomNav
        onAddClick={handleAddClick}
        disabled={isFutureDate}
        onTabSelect={handleNavTabSelect}
        activeTab={activeTab}
      />

      {/* Sheets & modals */}
      <CountrySelector open={showCountrySelector} onOpenChange={setShowCountrySelector} />
      <QuickAddSheet  open={showQuickAdd}         onOpenChange={setShowQuickAdd}         />
      <CalendarSheet  open={showCalendar}          onOpenChange={setShowCalendar}          />
      <CategorySelector
        open={showCategorySelector}
        onOpenChange={setShowCategorySelector}
        onSelect={handleCategorySelect}
      />
      <AddExpenseSheet open={showAddSheet} onOpenChange={setShowAddSheet} type={addType} />
    </Layout>
  );
}
