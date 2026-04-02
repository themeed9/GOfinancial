import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { transactionSchema, budgetSchema, FIXED_CATEGORIES, type Category } from '@/lib/validationSchemas';

export { FIXED_CATEGORIES };
export type { Category };

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category?: Category;
  createdAt: string;
}

export type EditingType = "expense" | "revenue" | "savings" | null;

export interface Country {
  name: string;
  code: string;
  currencySymbol: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Nigeria', code: 'NG', currencySymbol: '₦' },
  { name: 'United States', code: 'US', currencySymbol: '$' },
  { name: 'United Kingdom', code: 'GB', currencySymbol: '£' },
  { name: 'European Union', code: 'EU', currencySymbol: '€' },
  { name: 'Ghana', code: 'GH', currencySymbol: '₵' },
  { name: 'Kenya', code: 'KE', currencySymbol: 'KSh' },
  { name: 'South Africa', code: 'ZA', currencySymbol: 'R' },
  { name: 'Canada', code: 'CA', currencySymbol: 'C$' },
  { name: 'Australia', code: 'AU', currencySymbol: 'A$' },
  { name: 'India', code: 'IN', currencySymbol: '₹' },
  { name: 'Japan', code: 'JP', currencySymbol: '¥' },
  { name: 'China', code: 'CN', currencySymbol: '¥' },
  { name: 'Brazil', code: 'BR', currencySymbol: 'R$' },
  { name: 'Mexico', code: 'MX', currencySymbol: 'MX$' },
  { name: 'Switzerland', code: 'CH', currencySymbol: 'CHF' },
  { name: 'United Arab Emirates', code: 'AE', currencySymbol: 'د.إ' },
  { name: 'Saudi Arabia', code: 'SA', currencySymbol: '﷼' },
  { name: 'Egypt', code: 'EG', currencySymbol: 'E£' },
  { name: 'Singapore', code: 'SG', currencySymbol: 'S$' },
  { name: 'New Zealand', code: 'NZ', currencySymbol: 'NZ$' },
];

const DEFAULT_STATE = {
  monthlyBudget: 0,
  currentBalance: 0,
  activeAccount: '',
  expenses: [] as Transaction[],
  revenues: [] as Transaction[],
  savings: [] as Transaction[],
  selectedCountryCode: 'NG',
  selectedDate: new Date().toISOString().split('T')[0],
  profileName: 'User',
  profileImage: null as string | null,
  bio: '',
  monthlyReminder: true,
};

interface BudgetState {
  monthlyBudget: number;
  currentBalance: number;
  activeAccount: string;
  expenses: Transaction[];
  revenues: Transaction[];
  savings: Transaction[];

  selectedCountryCode: string;
  selectedDate: string;

  profileName: string;
  profileImage: string | null;
  bio: string;
  monthlyReminder: boolean;

  editingItemId: string | null;
  editingType: EditingType;

  setMonthlyBudget: (amount: number) => void;
  setActiveAccount: (account: string) => void;
  setCountry: (code: string) => void;
  setSelectedDate: (date: string) => void;
  setProfileName: (name: string) => void;
  setProfileImage: (image: string | null) => void;
  setBio: (bio: string) => void;
  setMonthlyReminder: (enabled: boolean) => void;
  getSelectedCountry: () => Country;
  getCurrencySymbol: () => string;

  addExpense: (description: string, amount: number, date?: string, category?: Category) => void;
  addRevenue: (description: string, amount: number, date?: string, category?: Category) => void;
  addSavings: (description: string, amount: number, date?: string, category?: Category) => void;

  updateExpense: (id: string, description: string, newAmount: number, category?: Category) => void;
  updateRevenue: (id: string, description: string, newAmount: number, category?: Category) => void;
  updateSavings: (id: string, description: string, newAmount: number, category?: Category) => void;

  deleteExpense: (id: string) => void;
  deleteRevenue: (id: string) => void;
  deleteSavings: (id: string) => void;

  setEditing: (id: string | null, type: EditingType) => void;
  clearEditing: () => void;
  getEditingTransaction: () => Transaction | null;

  getTransactionsForDate: (date: string, type: 'expenses' | 'revenues' | 'savings') => Transaction[];
  getWeeklyExpenses: () => { day: string; amount: number; date: string }[];

  resetBalance: () => void;
  resetAllData: () => void;
  importData: (data: {
    profile?: { name: string; bio?: string; currency: string; monthlyReminder?: boolean };
    expenses: Transaction[];
    revenues: Transaction[];
    savings: Transaction[];
    monthlyBudget?: number;
  }) => void;

  checkDuplicateAccount: (name: string) => boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const isSameDay = (dateStr1: string, dateStr2: string) => {
  return dateStr1.substring(0, 10) === dateStr2.substring(0, 10);
};

function validateTransactionInput(description: string, amount: number, date?: string): boolean {
  const result = transactionSchema.safeParse({
    id: 'temp',
    description: description || 'Untitled',
    amount,
    createdAt: date || new Date().toISOString(),
  });
  return result.success;
}

function validateStoredState(state: Record<string, unknown>): boolean {
  if (typeof state !== 'object' || state === null) return false;
  if (typeof state.monthlyBudget !== 'number' || isNaN(state.monthlyBudget as number)) return false;
  if (typeof state.currentBalance !== 'number' || isNaN(state.currentBalance as number)) return false;
  if (!Array.isArray(state.expenses)) return false;
  if (!Array.isArray(state.revenues)) return false;
  if (!Array.isArray(state.savings)) return false;
  return true;
}

const safeStorage: PersistStorage<Partial<BudgetState>> = {
  getItem: (name: string): StorageValue<Partial<BudgetState>> | null => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.state) {
        localStorage.removeItem(name);
        return null;
      }
      if (!validateStoredState(parsed.state)) {
        localStorage.removeItem(name);
        return null;
      }
      return parsed;
    } catch {
      try { localStorage.removeItem(name); } catch {}
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<Partial<BudgetState>>) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      editingItemId: null,
      editingType: null,

      setMonthlyBudget: (amount) => {
        const result = budgetSchema.safeParse({ monthlyBudget: amount });
        if (!result.success) return;
        set({ monthlyBudget: amount });
      },

      setActiveAccount: (account) => {
        const trimmed = account.trim();
        if (!trimmed) return;
        set({ activeAccount: trimmed });
      },

      setCountry: (code) => set({ selectedCountryCode: code }),

      setSelectedDate: (date) => {
        if (isNaN(Date.parse(date))) return;
        set({ selectedDate: date });
      },

      setProfileName: (name) => {
        const trimmed = name.trim();
        if (!trimmed || trimmed.length > 50) return;
        set({ profileName: trimmed });
      },

      setProfileImage: (image) => set({ profileImage: image }),

      setBio: (bio) => {
        if (bio.length > 200) return;
        set({ bio });
      },

      setMonthlyReminder: (enabled) => set({ monthlyReminder: enabled }),

      getSelectedCountry: () => {
        const state = get();
        return COUNTRIES.find(c => c.code === state.selectedCountryCode) || COUNTRIES[0];
      },

      getCurrencySymbol: () => {
        const state = get();
        const country = COUNTRIES.find(c => c.code === state.selectedCountryCode);
        return country?.currencySymbol || '₦';
      },

      addExpense: (description, amount, date, category) => {
        if (!validateTransactionInput(description, amount, date)) return;
        const state = get();
        if (state.currentBalance <= 0 || amount > state.currentBalance) return;
        const newExpense: Transaction = {
          id: generateId(),
          description: description.trim() || 'Expense',
          amount,
          category,
          createdAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          currentBalance: state.currentBalance - amount,
        }));
      },

      addRevenue: (description, amount, date, category) => {
        if (!validateTransactionInput(description, amount, date)) return;
        const newRevenue: Transaction = {
          id: generateId(),
          description: description.trim() || 'Revenue',
          amount,
          category,
          createdAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        };
        set((state) => ({
          revenues: [newRevenue, ...state.revenues],
          currentBalance: state.currentBalance + amount,
        }));
      },

      addSavings: (description, amount, date, category) => {
        if (!validateTransactionInput(description, amount, date)) return;
        const state = get();
        if (state.currentBalance <= 0 || amount > state.currentBalance) return;
        const newSaving: Transaction = {
          id: generateId(),
          description: description.trim() || 'Savings',
          amount,
          category,
          createdAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        };
        set((state) => ({
          savings: [newSaving, ...state.savings],
          currentBalance: state.currentBalance - amount,
        }));
      },

      updateExpense: (id, description, newAmount, category) => {
        if (!validateTransactionInput(description, newAmount)) return;
        const state = get();
        const oldExpense = state.expenses.find(e => e.id === id);
        if (!oldExpense) return;
        const oldAmount = oldExpense.amount;
        set((state) => ({
          expenses: state.expenses.map(e =>
            e.id === id
              ? { ...e, description: description.trim(), amount: newAmount, category: category || e.category }
              : e
          ),
          currentBalance: state.currentBalance + oldAmount - newAmount,
          editingItemId: null,
          editingType: null,
        }));
      },

      updateRevenue: (id, description, newAmount, category) => {
        if (!validateTransactionInput(description, newAmount)) return;
        const state = get();
        const oldRevenue = state.revenues.find(r => r.id === id);
        if (!oldRevenue) return;
        const oldAmount = oldRevenue.amount;
        set((state) => ({
          revenues: state.revenues.map(r =>
            r.id === id
              ? { ...r, description: description.trim(), amount: newAmount, category: category || r.category }
              : r
          ),
          currentBalance: state.currentBalance - oldAmount + newAmount,
          editingItemId: null,
          editingType: null,
        }));
      },

      updateSavings: (id, description, newAmount, category) => {
        if (!validateTransactionInput(description, newAmount)) return;
        const state = get();
        const oldSaving = state.savings.find(s => s.id === id);
        if (!oldSaving) return;
        const oldAmount = oldSaving.amount;
        set((state) => ({
          savings: state.savings.map(s =>
            s.id === id
              ? { ...s, description: description.trim(), amount: newAmount, category: category || s.category }
              : s
          ),
          currentBalance: state.currentBalance + oldAmount - newAmount,
          editingItemId: null,
          editingType: null,
        }));
      },

      deleteExpense: (id) => {
        const state = get();
        const expense = state.expenses.find(e => e.id === id);
        if (!expense) return;
        set((state) => ({
          expenses: state.expenses.filter(e => e.id !== id),
          currentBalance: state.currentBalance + expense.amount,
          editingItemId: null,
          editingType: null,
        }));
      },

      deleteRevenue: (id) => {
        const state = get();
        const revenue = state.revenues.find(r => r.id === id);
        if (!revenue) return;
        set((state) => ({
          revenues: state.revenues.filter(r => r.id !== id),
          currentBalance: state.currentBalance - revenue.amount,
          editingItemId: null,
          editingType: null,
        }));
      },

      deleteSavings: (id) => {
        const state = get();
        const saving = state.savings.find(s => s.id === id);
        if (!saving) return;
        set((state) => ({
          savings: state.savings.filter(s => s.id !== id),
          currentBalance: state.currentBalance + saving.amount,
          editingItemId: null,
          editingType: null,
        }));
      },

      setEditing: (id, type) => set({ editingItemId: id, editingType: type }),

      clearEditing: () => set({ editingItemId: null, editingType: null }),

      getEditingTransaction: () => {
        const state = get();
        if (!state.editingItemId || !state.editingType) return null;
        switch (state.editingType) {
          case "expense":
            return state.expenses.find(e => e.id === state.editingItemId) || null;
          case "revenue":
            return state.revenues.find(r => r.id === state.editingItemId) || null;
          case "savings":
            return state.savings.find(s => s.id === state.editingItemId) || null;
          default:
            return null;
        }
      },

      getTransactionsForDate: (date, type) => {
        const state = get();
        const list = type === 'expenses' ? state.expenses : type === 'revenues' ? state.revenues : state.savings;
        return list.filter(t => isSameDay(t.createdAt, date));
      },

      getWeeklyExpenses: () => {
        const state = get();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result: { day: string; amount: number; date: string }[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = days[date.getDay()];
          const dayExpenses = state.expenses.filter(e => isSameDay(e.createdAt, dateStr));
          const totalAmount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
          result.push({ day: dayName, amount: totalAmount, date: dateStr });
        }
        return result;
      },

      resetBalance: () => set((state) => ({ currentBalance: state.monthlyBudget })),

      resetAllData: () => {
        set({ ...DEFAULT_STATE, editingItemId: null, editingType: null });
      },

      importData: (data) => {
        try {
          const validExpenses = (data.expenses || []).filter(t => {
            const r = transactionSchema.safeParse(t);
            return r.success;
          });
          const validRevenues = (data.revenues || []).filter(t => {
            const r = transactionSchema.safeParse(t);
            return r.success;
          });
          const validSavings = (data.savings || []).filter(t => {
            const r = transactionSchema.safeParse(t);
            return r.success;
          });
          const budget = data.monthlyBudget && data.monthlyBudget > 0 ? data.monthlyBudget : 0;
          set({
            expenses: validExpenses,
            revenues: validRevenues,
            savings: validSavings,
            monthlyBudget: budget,
            currentBalance: budget,
            profileName: (data.profile?.name || 'User').trim().slice(0, 50),
            bio: (data.profile?.bio || '').slice(0, 200),
            selectedCountryCode: data.profile?.currency || 'NG',
            monthlyReminder: data.profile?.monthlyReminder ?? true,
          });
        } catch (e) {
          console.error('Import failed:', e);
        }
      },

      checkDuplicateAccount: (name) => {
        const state = get();
        return state.activeAccount.trim().toLowerCase() === name.trim().toLowerCase();
      },
    }),
    {
      name: 'budget-storage',
      version: 2,
      storage: safeStorage,
      migrate: () => {
        return { ...DEFAULT_STATE, editingItemId: null, editingType: null };
      },
      partialize: (state) => ({
        monthlyBudget: state.monthlyBudget,
        currentBalance: state.currentBalance,
        activeAccount: state.activeAccount,
        expenses: state.expenses,
        revenues: state.revenues,
        savings: state.savings,
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
