import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useBudgetStore, COUNTRIES } from "@/store/useBudgetStore";
import { Pencil, Check, X, Download, Upload, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const {
    getCurrencySymbol,
    getSelectedCountry,
    transactions,
    profileName,
    profileImage,
    bio,
    monthlyReminder,
    setProfileName,
    setProfileImage,
    setBio,
    setMonthlyReminder,
    resetAllData,
    exportData,
    importData,
  } = useBudgetStore();

  const currency = getCurrencySymbol();
  const country = getSelectedCountry();

  const [activeTab, setActiveTab] = useState("Profile");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState(profileName);
  const [bioInput, setBioInput] = useState(bio);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currencyLabel = COUNTRIES.find((c) => c.code === country.code);
  const currencyName = currencyLabel ? `${currencyLabel.name} (${currencyLabel.currencySymbol})` : currency;

  const getYearSpent = (year: number) => {
    return transactions
      .filter((t) => t.type === "expense" && new Date(t.createdAt).getFullYear() === year)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const years = [2026, 2025, 2024, 2023];
  const budgets = [1200000, 1000000, 900000, 800000];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const startEditingName = () => {
    setNameInput(profileName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveName = () => {
    setProfileName(nameInput.trim());
    setIsEditingName(false);
  };

  const startEditingBio = () => {
    setBioInput(bio);
    setIsEditingBio(true);
  };

  const saveBio = () => {
    setBio(bioInput.trim());
    setIsEditingBio(false);
  };

  const handleExportJSON = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gofinancial-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        importData(parsed);
        setImportStatus({ type: "success", message: "Data imported successfully!" });
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus({ type: "error", message: "Invalid backup file." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportExcel = async () => {
    try {
      const data = exportData();
      const res = await fetch("/api/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gofinancial-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export error:", err);
    }
  };

  return (
    <Layout className="pb-24">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={importInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportJSON} />

      <div className="px-6 pt-10 pb-6 flex flex-col items-center">
        <div className="relative mb-4">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-800 to-blue-600 flex items-end justify-center overflow-hidden">
              <div className="w-16 h-16 bg-blue-900 rounded-full -mb-4" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-border"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setIsEditingName(false); }}
              maxLength={50}
              className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 outline-none text-center w-40"
            />
            <button onClick={saveName} className="text-blue-500"><Check className="w-5 h-5" /></button>
            <button onClick={() => setIsEditingName(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profileName}</h1>
            <button onClick={startEditingName} className="text-muted-foreground"><Pencil className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="px-6 mb-6">
        <SegmentedControl options={["Profile", "Accounts"]} selected={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "Profile" && (
        <div className="px-6">
          <div className="bg-secondary rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Bio</p>
                {!isEditingBio && (
                  <button onClick={startEditingBio} className="text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                )}
              </div>
              {isEditingBio ? (
                <div className="mt-1">
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full text-sm font-medium bg-white rounded-lg border border-border p-2 outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={saveBio} className="text-blue-500"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setIsEditingBio(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium mt-0.5">{bio || "No bio set."}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="text-sm font-medium mt-0.5">{currencyName}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Reminder</p>
                <p className="text-sm font-medium mt-0.5">{monthlyReminder ? "Enabled" : "Disabled"}</p>
              </div>
              <button
                onClick={() => setMonthlyReminder(!monthlyReminder)}
                className={`relative w-12 h-7 rounded-full transition-colors ${monthlyReminder ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${monthlyReminder ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-3">Backup & Data</h2>
          <div className="space-y-3">
            <button onClick={handleExportExcel} className="w-full bg-secondary rounded-2xl p-5 flex items-center gap-3 text-left hover:bg-secondary/80 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <span className="text-sm font-semibold">Export Data (Excel)</span>
            </button>

            <button onClick={handleExportJSON} className="w-full bg-secondary rounded-2xl p-5 flex items-center gap-3 text-left hover:bg-secondary/80 transition-colors">
              <Download className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Export Data (JSON)</span>
            </button>

            <button onClick={() => importInputRef.current?.click()} className="w-full bg-secondary rounded-2xl p-5 flex items-center gap-3 text-left hover:bg-secondary/80 transition-colors">
              <Upload className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold">Import Data (JSON)</span>
            </button>

            {importStatus && (
              <div className={`rounded-2xl p-4 text-sm font-medium ${importStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {importStatus.message}
              </div>
            )}

            {showResetConfirm ? (
              <div className="bg-red-50 rounded-2xl p-5 space-y-3">
                <p className="text-sm text-muted-foreground">Delete all data? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={resetAllData} className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-semibold">Yes, Reset</button>
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-full bg-gray-200 text-foreground text-sm font-semibold">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="w-full bg-secondary rounded-2xl p-5 flex items-center gap-3 text-left hover:bg-red-50 transition-colors">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-red-500">Reset All Data</span>
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "Accounts" && (
        <div className="px-6">
          <h2 className="text-lg font-semibold mb-3">Yearly Accounts</h2>
          <div className="space-y-3">
            {years.map((year, i) => {
              const spent = getYearSpent(year);
              const remaining = budgets[i] - spent;
              return (
                <Link key={year} href={`/year/${year}`}>
                  <button className="w-full bg-secondary rounded-3xl py-5 px-6 text-left hover:bg-secondary/80 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl font-bold">{profileName}-Acc{year}</span>
                      <span className="text-muted-foreground">→</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Budget: {currency}{budgets[i].toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Remaining: {currency}{remaining.toLocaleString()}</p>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav />
    </Layout>
  );
}
