import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { SegmentedControl } from "@/components/SegmentedControl";
import { WeeklyChart } from "@/components/WeeklyChart";
import { TransactionCard } from "@/components/TransactionCard";
import { BottomNav } from "@/components/BottomNav";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { CategorySelector } from "@/components/CategorySelector";
import { CountrySelector, CountryFlag } from "@/components/CountrySelector";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { CalendarSheet } from "@/components/CalendarSheet";
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useBudgetStore, EditingType } from "@/store/budgetStore";

type TransactionType = "expense" | "revenue" | "savings";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Expenses");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [addType, setAddType] = useState<TransactionType>("expense");
  
  const { 
    currentBalance, 
    monthlyBudget, 
    expenses, 
    revenues, 
    savings,
    editingItemId,
    editingType,
    setEditing,
    getEditingTransaction,
    getSelectedCountry,
    getCurrencySymbol,
    selectedDate,
    setSelectedDate,
    getTransactionsForDate,
  } = useBudgetStore();
  
  const selectedCountry = getSelectedCountry();
  const currency = getCurrencySymbol();
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (selectedDate !== today) {
      setSelectedDate(today);
    }
  }, []);

  const isFutureDate = selectedDate > today;
  
  const [displayBalance, setDisplayBalance] = useState(currentBalance);
  const prevBalanceRef = useRef(currentBalance);
  
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
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      prevBalanceRef.current = currentBalance;
    }
  }, [currentBalance]);

  const handleAddClick = () => {
    if (isFutureDate) return;
    setShowCategorySelector(true);
  };

  const handleCategorySelect = (category: TransactionType) => {
    setAddType(category);
    setShowAddSheet(true);
  };

  const handleEditTransaction = (id: string, type: EditingType) => {
    setEditing(id, type);
    if (type) {
      setAddType(type as TransactionType);
      setShowAddSheet(true);
    }
  };

  const handleQuickAdd = () => {
    if (isFutureDate) return;
    setShowQuickAdd(true);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const balancePercentage = (currentBalance / monthlyBudget) * 100;
  const getBalanceColor = () => {
    if (balancePercentage < 10) return "text-red-500";
    if (balancePercentage < 30) return "text-amber-500";
    return "text-gray-900";
  };

  const getActiveTransactions = () => {
    const type = activeTab === "Expenses" ? "expenses" : activeTab === "Revenue" ? "revenues" : "savings";
    return getTransactionsForDate(selectedDate, type);
  };

  const getActiveType = (): "expenses" | "revenue" | "savings" => {
    switch (activeTab) {
      case "Expenses":
        return "expenses";
      case "Revenue":
        return "revenue";
      case "Savings":
        return "savings";
      default:
        return "expenses";
    }
  };

  const getEditingTypeFromTab = (): EditingType => {
    switch (activeTab) {
      case "Expenses":
        return "expense";
      case "Revenue":
        return "revenue";
      case "Savings":
        return "savings";
      default:
        return "expense";
    }
  };

  const formatBalance = (value: number) => {
    const formatted = Math.abs(value).toLocaleString();
    const parts = formatted.split(".");
    return {
      whole: parts[0],
      decimal: ".00",
    };
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const { whole, decimal } = formatBalance(displayBalance);
  const isEditMode = !!editingItemId && !!editingType;
  const editingTransaction = getEditingTransaction();
  const transactions = getActiveTransactions();

  const dailyTotalSpent = getTransactionsForDate(selectedDate, 'expenses')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout className="pb-24">
      
      <div className="px-6 pt-8 pb-6 flex flex-col items-center relative">
        <button 
          onClick={() => setShowCountrySelector(true)}
          className="flex items-center gap-1.5 mb-6"
          data-testid="button-country-selector"
        >
          <CountryFlag code={selectedCountry.code} size={20} />
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>

        <span className="text-gray-400 font-medium text-sm mb-1">Budget Balance</span>
        
        <div className="flex items-center gap-2 mb-2">
          <h1 className={`text-4xl font-extrabold tracking-tight font-display transition-colors duration-300 ${getBalanceColor()}`}>
            <span className="text-3xl">{currency}</span>{whole}<span className="text-gray-300">{decimal}</span>
          </h1>
          <button 
            className={`w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center transition-colors ${
              isFutureDate 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-500 hover:text-blue-600 hover:border-blue-600"
            }`}
            onClick={handleQuickAdd}
            disabled={isFutureDate}
            data-testid="button-add-balance"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateDate('prev')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="button-prev-date"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={() => setShowCalendar(true)}
            className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
            data-testid="button-open-calendar"
          >
            {formatDisplayDate(selectedDate)}
          </button>
          <button 
            onClick={() => navigateDate('next')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="button-next-date"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-900" data-testid="text-balance-overview">Balance overview</h2>
          <span className="text-sm font-medium text-gray-400" data-testid="text-daily-total">
            Today: <span className="text-gray-600">{currency}{dailyTotalSpent.toLocaleString()}</span>
          </span>
        </div>
        <SegmentedControl 
          options={["Expenses", "Revenue", "Savings"]} 
          selected={activeTab} 
          onChange={setActiveTab} 
        />
      </div>

      <div className="px-6 space-y-6">
        
        <div className="space-y-3">
          {isFutureDate ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-lg">No entry yet</p>
              <p className="text-gray-300 text-sm mt-1">Future dates cannot have entries</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No {activeTab.toLowerCase()} for this date
            </div>
          ) : (
            transactions.map((transaction) => (
              <TransactionCard 
                key={transaction.id}
                id={transaction.id}
                title={transaction.description} 
                amount={transaction.amount}
                currency={currency}
                type={getActiveType()}
                onEdit={(id) => handleEditTransaction(id, getEditingTypeFromTab())}
              />
            ))
          )}
        </div>

        {!isFutureDate && <WeeklyChart />}
        
        <div className="h-10" />
      </div>

      <BottomNav onAddClick={handleAddClick} disabled={isFutureDate} />
      
      <CountrySelector
        open={showCountrySelector}
        onOpenChange={setShowCountrySelector}
      />
      
      <QuickAddSheet
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
      />
      
      <CalendarSheet
        open={showCalendar}
        onOpenChange={setShowCalendar}
      />
      
      <CategorySelector
        open={showCategorySelector}
        onOpenChange={setShowCategorySelector}
        onSelect={handleCategorySelect}
      />
      
      <AddExpenseSheet 
        open={showAddSheet} 
        onOpenChange={setShowAddSheet}
        type={addType}
        isEditMode={isEditMode}
        editingTransaction={editingTransaction}
      />
    </Layout>
  );
}
