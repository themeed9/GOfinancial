import { Sheet, SheetContent, SheetTitle, SheetClose } from "./ui/sheet";
import { useBudgetStore, COUNTRIES } from "@/store/useBudgetStore";
import { Check } from "lucide-react";

interface CountrySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CountryFlag({ code = "NG", size = 24 }: { code?: string; size?: number }) {
  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  return (
    <img
      src={flagUrl}
      alt={code}
      width={size}
      height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
    />
  );
}

export function CountrySelector({ open, onOpenChange }: CountrySelectorProps) {
  const { selectedCountryCode, setCountry } = useBudgetStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pt-4 pb-10 bg-white max-h-[80vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8" />
          <SheetTitle>Select Country</SheetTitle>
          <SheetClose onClick={() => onOpenChange(false)} />
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[60vh]">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                setCountry(country.code);
                onOpenChange(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                selectedCountryCode === country.code ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <CountryFlag code={country.code} size={28} />
                <span className="font-medium">{country.name}</span>
                <span className="text-muted-foreground text-sm">({country.currencySymbol})</span>
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
