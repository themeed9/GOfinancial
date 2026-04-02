import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Camera, Pencil, ArrowLeft, Check, X, Download, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { useBudgetStore, COUNTRIES } from "@/store/budgetStore";
import { validateImportData } from "@/lib/validationSchemas";

const accounts = [
  { year: 2026, budget: 1200000 },
  { year: 2025, budget: 1000000 },
  { year: 2024, budget: 900000 },
  { year: 2023, budget: 800000 },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Accounts");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);
  const {
    getCurrencySymbol,
    getSelectedCountry,
    expenses,
    profileName,
    profileImage,
    bio,
    monthlyReminder,
    setProfileName,
    setProfileImage,
    setBio,
    setMonthlyReminder,
    resetAllData,
    importData,
  } = useBudgetStore();
  const currency = getCurrencySymbol();
  const country = getSelectedCountry();

  const currencyLabel = COUNTRIES.find((c) => c.code === country.code);
  const currencyName = currencyLabel
    ? `${currencyLabel.name} (${currencyLabel.currencySymbol})`
    : `${currency}`;

  const getYearSpent = (year: number) => {
    return expenses
      .filter((e) => new Date(e.createdAt).getFullYear() === year)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setProfileImage(result);
    };
    reader.readAsDataURL(file);
  };

  const startEditingName = () => {
    setNameInput(profileName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setProfileName(trimmed);
    setIsEditingName(false);
  };

  const startEditingBio = () => {
    setBioInput(bio);
    setIsEditingBio(true);
    setTimeout(() => bioInputRef.current?.focus(), 50);
  };

  const saveBio = () => {
    setBio(bioInput.trim());
    setIsEditingBio(false);
  };

  const handleExportJSON = () => {
    try {
      const state = useBudgetStore.getState();
      const exportObj = {
        profile: {
          name: state.profileName,
          bio: state.bio,
          currency: state.selectedCountryCode,
          monthlyReminder: state.monthlyReminder,
        },
        expenses: state.expenses,
        revenues: state.revenues,
        savings: state.savings,
        monthlyBudget: state.monthlyBudget,
      };
      const json = JSON.stringify(exportObj, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gofinancial-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON export error:", err);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const parsed = JSON.parse(raw);
        const result = validateImportData(parsed);

        if (!result.success) {
          setImportStatus({ type: "error", message: "Invalid backup file format. Please use a valid GOfinancial backup." });
          return;
        }

        importData(result.data);
        setImportStatus({ type: "success", message: "Data imported successfully!" });
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus({ type: "error", message: "Could not read file. Make sure it's a valid JSON backup." });
      }
    };
    reader.onerror = () => {
      setImportStatus({ type: "error", message: "Failed to read file." });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportExcel = async () => {
    try {
      const state = useBudgetStore.getState();
      const payload = {
        profile: {
          name: state.profileName,
          bio: state.bio,
          currency: state.selectedCountryCode,
        },
        expenses: state.expenses,
        revenues: state.revenues,
        savings: state.savings,
        monthlyBudget: state.monthlyBudget,
      };

      const res = await fetch("/api/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gofinancial-budget-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export error:", err);
    }
  };

  const handleResetData = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  return (
    <Layout className="pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
        data-testid="input-profile-image"
      />
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportJSON}
        data-testid="input-import-json"
      />

      <div className="px-6 pt-10 pb-6 flex flex-col items-center">
        <div className="relative mb-4">
          {profileImage ? (
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                data-testid="img-profile-avatar"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-green-800 to-green-600 flex items-end justify-center overflow-hidden">
              <div className="w-16 h-16 bg-green-900 rounded-full -mb-4" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100"
            data-testid="button-change-avatar"
          >
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") { setIsEditingName(false); }
              }}
              maxLength={50}
              className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-green-600 outline-none text-center w-40"
              data-testid="input-profile-name"
            />
            <button onClick={saveName} className="text-green-600" data-testid="button-save-name">
              <Check className="w-5 h-5" />
            </button>
            <button onClick={() => setIsEditingName(false)} className="text-gray-400" data-testid="button-cancel-name">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-profile-name">{profileName}</h1>
            <button onClick={startEditingName} className="text-gray-400" data-testid="button-edit-name">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="px-6 mb-6">
        <SegmentedControl
          options={["Profile", "Accounts"]}
          selected={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "Accounts" && (
        <div className="px-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Yearly Accounts</h2>
          <div className="space-y-3">
            {accounts.map((acc) => {
              const spent = getYearSpent(acc.year);
              const remaining = acc.budget - spent;
              return (
                <button
                  key={acc.year}
                  onClick={() => setLocation(`/year/${acc.year}`)}
                  className="w-full bg-gray-100 rounded-3xl py-5 px-6 text-left active:bg-gray-200 transition-colors"
                  data-testid={`account-card-${acc.year}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-bold text-gray-900">{profileName}-Acc{acc.year}</span>
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500" data-testid={`text-budget-${acc.year}`}>Budget: {currency}{acc.budget.toLocaleString()}</p>
                  <p className="text-sm text-gray-500" data-testid={`text-remaining-${acc.year}`}>Remaining: {currency}{remaining.toLocaleString()}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "Profile" && (
        <div className="px-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile Information</h2>
          <div className="bg-gray-100 rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Bio</p>
                {!isEditingBio && (
                  <button onClick={startEditingBio} className="text-gray-400" data-testid="button-edit-bio">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="mt-1">
                  <textarea
                    ref={bioInputRef}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 p-2 outline-none focus:border-green-600 resize-none"
                    data-testid="input-bio"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={saveBio} className="text-green-600" data-testid="button-save-bio">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditingBio(false)} className="text-gray-400" data-testid="button-cancel-bio">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900 mt-0.5" data-testid="text-bio">
                  {bio || "No bio set."}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400">Currency</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5" data-testid="text-currency">
                {currencyName}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Monthly Reminder</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5" data-testid="text-reminder">
                  {monthlyReminder ? "Enabled" : "Disabled"}
                </p>
              </div>
              <button
                onClick={() => setMonthlyReminder(!monthlyReminder)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  monthlyReminder ? "bg-green-500" : "bg-gray-300"
                }`}
                data-testid="toggle-monthly-reminder"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                    monthlyReminder ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-400">Tracking Since</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5" data-testid="text-tracking-since">2023</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Backup & Data</h2>
          <div className="space-y-3">
            <button
              onClick={handleExportExcel}
              className="w-full bg-gray-100 rounded-2xl p-5 flex items-center gap-3 text-left active:bg-gray-200 transition-colors"
              data-testid="button-export-excel"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">Export Data (Excel)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full bg-gray-100 rounded-2xl p-5 flex items-center gap-3 text-left active:bg-gray-200 transition-colors"
              data-testid="button-export-json"
            >
              <Download className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">Export Data (JSON)</span>
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              className="w-full bg-gray-100 rounded-2xl p-5 flex items-center gap-3 text-left active:bg-gray-200 transition-colors"
              data-testid="button-import-json"
            >
              <Upload className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900">Import Data (JSON)</span>
            </button>

            {importStatus && (
              <div
                className={`rounded-2xl p-4 text-sm font-medium ${
                  importStatus.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
                data-testid="text-import-status"
              >
                {importStatus.message}
              </div>
            )}

            {showResetConfirm ? (
              <div className="bg-red-50 rounded-2xl p-5 space-y-3">
                <p className="text-sm text-gray-700">Are you sure? This will delete all your data and cannot be undone.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetData}
                    className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-semibold active:bg-red-600 transition-colors"
                    data-testid="button-confirm-reset"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold active:bg-gray-300 transition-colors"
                    data-testid="button-cancel-reset"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-gray-100 rounded-2xl p-5 flex items-center gap-3 text-left active:bg-gray-200 transition-colors"
                data-testid="button-reset-data"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-red-500">Reset All Data</span>
              </button>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </Layout>
  );
}
