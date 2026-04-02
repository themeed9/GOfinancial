import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Check, X } from "lucide-react";
import { useBudgetStore, COUNTRIES, Country } from "@/store/budgetStore";

interface CountrySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CountryFlag({ code = "NG", size = 24 }: { code?: string; size?: number }) {
  const flagCode = code || "NG";
  const flagUrl = `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
  
  return (
    <img 
      src={flagUrl} 
      alt={flagCode} 
      width={size} 
      height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}

export function CountrySelector({ open, onOpenChange }: CountrySelectorProps) {
  const { selectedCountryCode, setCountry } = useBudgetStore();
  
  const handleSelect = (code: string) => {
    setCountry(code);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl px-6 pt-4 pb-10 bg-white max-h-[80vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle className="text-lg font-semibold text-gray-900">Select Country</SheetTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-600"
            data-testid="button-close-country"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[60vh]">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelect(country.code)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                selectedCountryCode === country.code 
                  ? "bg-gray-100" 
                  : "hover:bg-gray-50"
              }`}
              data-testid={`button-country-${country.code.toLowerCase()}`}
            >
              <div className="flex items-center gap-3">
                <CountryFlag code={country.code} size={28} />
                <span className="font-medium text-gray-900">{country.name}</span>
                <span className="text-gray-400 text-sm">({country.currencySymbol})</span>
              </div>
              {selectedCountryCode === country.code && (
                <Check className="w-5 h-5 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { CountryFlag };
