import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Health",
  "Salary",
  "Shopping",
  "Entertainment",
  "Education",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type TransactionType = "expense" | "revenue" | "savings";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  createdAt: string;
}

export interface Country {
  name: string;
  code: string;
  currencySymbol: string;
}

export const COUNTRIES: Country[] = [
  { name: "Nigeria", code: "NG", currencySymbol: "₦" },
  { name: "United States", code: "US", currencySymbol: "$" },
  { name: "United Kingdom", code: "GB", currencySymbol: "£" },
  { name: "European Union", code: "EU", currencySymbol: "€" },
  { name: "Ghana", code: "GH", currencySymbol: "₵" },
  { name: "Kenya", code: "KE", currencySymbol: "KSh" },
  { name: "South Africa", code: "ZA", currencySymbol: "R" },
  { name: "Canada", code: "CA", currencySymbol: "C$" },
  { name: "Australia", code: "AU", currencySymbol: "A$" },
  { name: "India", code: "IN", currencySymbol: "₹" },
  { name: "Japan", code: "JP", currencySymbol: "¥" },
  { name: "China", code: "CN", currencySymbol: "¥" },
  { name: "Brazil", code: "BR", currencySymbol: "R$" },
  { name: "Mexico", code: "MX", currencySymbol: "MX$" },
  { name: "Switzerland", code: "CH", currencySymbol: "CHF" },
  { name: "UAE", code: "AE", currencySymbol: "د.إ" },
  { name: "Singapore", code: "SG", currencySymbol: "S$" },
];

interface BudgetState {
  monthlyBudget: number;
  currentBalance: number;
  accountName: string;
  transactions: Transaction[];
  selectedCountryCode: string;
  selectedDate: string;
  profileName: string;
  profileImage: string | null;
  bio: string;
  monthlyReminder: boolean;
  editingId: string | null;
  editingType: TransactionType | null;

  setMonthlyBudget: (amount: number) => void;
  setAccountName: (name: string) => void;
  setCountry: (code: string) => void;
  setSelectedDate: (date: string) => void;
  setProfileName: (name: string) => void;
  setProfileImage: (image: string | null) => void;
  setBio: (bio: string) => void;
  setMonthlyReminder: (enabled: boolean) => void;
  getCurrencySymbol: () => string;
  getSelectedCountry: () => Country;

  addTransaction: (title: string, amount: number, type: TransactionType, category: Category) => void;
  updateTransaction: (id: string, title: string, amount: number, category: Category) => void;
  deleteTransaction: (id: string) => void;

  setEditing: (id: string | null, type: TransactionType | null) => void;
  getEditingTransaction: () => Transaction | null;
  getTransactionsForDate: (date: string, type: TransactionType) => Transaction[];
  getWeeklyExpenses: () => { day: string; amount: number; date: string }[];
  getMonthlyExpenses: (year: number, month: number) => Transaction[];

  resetBalance: () => void;
  resetAllData: () => void;
  exportData: () => object;
  importData: (data: Partial<BudgetState>) => void;
}

const DEFAULT_STATE = {
  monthlyBudget: 0,
  currentBalance: 0,
  accountName: "",
  transactions: [],
  selectedCountryCode: "NG",
  selectedDate: new Date().toISOString().split("T")[0],
  profileName: "User",
  profileImage: null,
  bio: "",
  monthlyReminder: true,
  editingId: null,
  editingType: null,
};

const safeStorage: PersistStorage<Partial<BudgetState>> = {
  getItem: (name: string): StorageValue<Partial<BudgetState>> | null => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.state) {
        localStorage.removeItem(name);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<Partial<BudgetState>>) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save:", e);
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setMonthlyBudget: (amount) => set({ monthlyBudget: Math.max(0, amount) }),

      setAccountName: (name) => set({ accountName: name.trim() || "" }),

      setCountry: (code) => set({ selectedCountryCode: code }),

      setSelectedDate: (date) => {
        if (!isNaN(Date.parse(date))) set({ selectedDate: date });
      },

      setProfileName: (name) => set({ profileName: name.trim().slice(0, 50) || "User" }),

      setProfileImage: (image) => set({ profileImage: image }),

      setBio: (bio) => set({ bio: bio.slice(0, 200) }),

      setMonthlyReminder: (enabled) => set({ monthlyReminder: enabled }),

      getCurrencySymbol: () => {
        const country = COUNTRIES.find((c) => c.code === get().selectedCountryCode);
        return country?.currencySymbol || "₦";
      },

      getSelectedCountry: () => {
        const country = COUNTRIES.find((c) => c.code === get().selectedCountryCode);
        return country || COUNTRIES[0];
      },

      addTransaction: (title, amount, type, category) => {
        if (amount <= 0) return;
        const state = get();
        
        if ((type === "expense" || type === "savings") && amount > state.currentBalance) return;

        const transaction: Transaction = {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          title: title.trim() || type.charAt(0).toUpperCase() + type.slice(1),
          amount,
          type,
          category,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [transaction, ...state.transactions],
          currentBalance:
            type === "expense" || type === "savings"
              ? state.currentBalance - amount
              : state.currentBalance + amount,
          editingId: null,
          editingType: null,
        }));
      },

      updateTransaction: (id, title, amount, category) => {
        const state = get();
        const oldTx = state.transactions.find((t) => t.id === id);
        if (!oldTx || amount <= 0) return;

        const amountDiff = amount - oldTx.amount;
        let balanceChange = 0;

        if (oldTx.type === "expense" || oldTx.type === "savings") {
          balanceChange = -amountDiff;
        } else {
          balanceChange = amountDiff;
        }

        if (balanceChange < 0 && Math.abs(balanceChange) > state.currentBalance) return;

        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, title: title.trim(), amount, category } : t
          ),
          currentBalance: state.currentBalance + balanceChange,
          editingId: null,
          editingType: null,
        }));
      },

      deleteTransaction: (id) => {
        const state = get();
        const tx = state.transactions.find((t) => t.id === id);
        if (!tx) return;

        const balanceChange =
          tx.type === "expense" || tx.type === "savings" ? tx.amount : -tx.amount;

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
          currentBalance: state.currentBalance + balanceChange,
          editingId: null,
          editingType: null,
        }));
      },

      setEditing: (id, type) => set({ editingId: id, editingType: type }),

      getEditingTransaction: () => {
        const state = get();
        if (!state.editingId || !state.editingType) return null;
        return state.transactions.find((t) => t.id === state.editingId) || null;
      },

      getTransactionsForDate: (date, type) => {
        return get().transactions.filter(
          (t) => t.type === type && t.createdAt.substring(0, 10) === date.substring(0, 10)
        );
      },

      getWeeklyExpenses: () => {
        const state = get();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const result: { day: string; amount: number; date: string }[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const dayName = days[date.getDay()];
          const dayExpenses = state.transactions.filter(
            (t) => t.type === "expense" && t.createdAt.substring(0, 10) === dateStr
          );
          const total = dayExpenses.reduce((sum, t) => sum + t.amount, 0);
          result.push({ day: dayName, amount: total, date: dateStr });
        }
        return result;
      },

      getMonthlyExpenses: (year, month) => {
        return get().transactions.filter((t) => {
          const d = new Date(t.createdAt);
          return t.type === "expense" && d.getFullYear() === year && d.getMonth() === month;
        });
      },

      resetBalance: () => set((state) => ({ currentBalance: state.monthlyBudget })),

      resetAllData: () => set({ ...DEFAULT_STATE, editingId: null, editingType: null }),

      exportData: () => {
        const state = get();
        const expenses = state.transactions.filter((t) => t.type === "expense");
        const revenues = state.transactions.filter((t) => t.type === "revenue");
        const savings = state.transactions.filter((t) => t.type === "savings");

        return {
          profile: {
            name: state.profileName,
            bio: state.bio,
            currency: state.selectedCountryCode,
            monthlyReminder: state.monthlyReminder,
          },
          expenses,
          revenues,
          savings,
          monthlyBudget: state.monthlyBudget,
        };
      },

      importData: (data) => {
        const state = get();
        set({
          transactions: data.transactions || state.transactions,
          monthlyBudget: data.monthlyBudget ?? state.monthlyBudget,
          currentBalance: data.monthlyBudget ?? state.monthlyBudget,
          profileName: data.profileName || state.profileName,
          bio: data.bio || state.bio,
          selectedCountryCode: data.selectedCountryCode || state.selectedCountryCode,
        });
      },
    }),
    {
      name: "gofinancial-storage",
      version: 1,
      storage: safeStorage,
      partialize: (state) => ({
        monthlyBudget: state.monthlyBudget,
        currentBalance: state.currentBalance,
        accountName: state.accountName,
        transactions: state.transactions,
        selectedCountryCode: state.selectedCountryCode,
        selectedDate: state.selectedDate,
        profileName: state.profileName,
        profileImage: state.profileImage,
        bio: state.bio,
        monthlyReminder: state.monthlyReminder,
      }),
    }
  )
);
