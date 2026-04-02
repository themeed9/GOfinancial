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
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
        const current = start + (end - start) * eased;
        setDisplayBalance(Math.round(current));
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
      case "Revenue": return "revenue";
      case "Savings": return "savings";
      default: return "expense";
    }
  };

  const getFilteredTransactions = () => {
    const type = getTransactionType();
    return transactions.filter(
      (t) => t.type === type && t.createdAt.substring(0, 10) === selectedDate.substring(0, 10)
    );
  };

  const getBalanceColor = () => {
    const pct = (currentBalance / monthlyBudget) * 100;
    if (pct < 10) return "text-red-500";
    if (pct < 30) return "text-amber-500";
    return "text-foreground";
  };

  const filteredTransactions = getFilteredTransactions();
  const dailyTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout className="pb-24">
      <div className="px-6 pt-8 pb-6 flex flex-col items-center relative">
        <button
          onClick={() => setShowCountrySelector(true)}
          className="flex items-center gap-1.5 mb-6"
        >
          <CountryFlag code={country.code} size={20} />
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        <span className="text-muted-foreground font-medium text-sm mb-1">Budget Balance</span>

        <div className="flex items-center gap-2 mb-2">
          <h1 className={`text-4xl font-extrabold tracking-tight font-display transition-colors ${getBalanceColor()}`}>
            <span className="text-3xl text-muted-foreground">{currency}</span>
            {displayBalance.toLocaleString()}
          </h1>
          <button
            onClick={handleQuickAdd}
            disabled={isFutureDate}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
              isFutureDate ? "border-secondary text-muted-foreground cursor-not-allowed" : "border-secondary text-muted-foreground hover:text-blue-500 hover:border-blue-500"
            }`}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigateDate("prev")} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCalendar(true)} className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
            {formatDate(selectedDate)}
          </button>
          <button onClick={() => navigateDate("next")} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Balance Overview</h2>
          <span className="text-sm font-medium text-muted-foreground">
            Today: <span className="text-foreground">{currency}{dailyTotal.toLocaleString()}</span>
          </span>
        </div>
        <SegmentedControl options={["Expenses", "Revenue", "Savings"]} selected={activeTab} onChange={setActiveTab} />
      </div>

      <div className="px-6 space-y-6">
        <div className="space-y-3">
          {isFutureDate ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">No entry yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Future dates cannot have entries</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
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

        {!isFutureDate && <WeeklyChart />}

        <div className="h-10" />
      </div>

      <BottomNav onAddClick={handleAddClick} disabled={isFutureDate} />

      <CountrySelector open={showCountrySelector} onOpenChange={setShowCountrySelector} />
      <QuickAddSheet open={showQuickAdd} onOpenChange={setShowQuickAdd} />
      <CalendarSheet open={showCalendar} onOpenChange={setShowCalendar} />
      <CategorySelector open={showCategorySelector} onOpenChange={setShowCategorySelector} onSelect={handleCategorySelect} />
      <AddExpenseSheet open={showAddSheet} onOpenChange={setShowAddSheet} type={addType} />
    </Layout>
  );
}
