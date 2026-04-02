import { Home, User, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onAddClick?: () => void;
  disabled?: boolean;
}

export function BottomNav({ onAddClick, disabled }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white pb-safe pt-3 px-6 h-24 max-w-[600px] mx-auto z-50 safe-bottom">
      <div className="flex justify-between items-end h-full pb-6">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <button
              className={cn(
                "flex flex-col items-center gap-1 min-w-[60px] transition-colors",
                location === href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={location === href ? 2 : 1.5}
              />
              <span className="text-xs font-medium">{label}</span>
            </button>
          </Link>
        ))}

        <div className="flex flex-col items-center gap-1 -mt-4">
          <button
            onClick={disabled ? undefined : onAddClick}
            disabled={disabled}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
              disabled
                ? "bg-gray-300 shadow-gray-300/30 cursor-not-allowed"
                : "bg-blue-500 shadow-blue-500/30 text-white hover:scale-105 active:scale-95"
            )}
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
          <span className="text-xs font-medium text-muted-foreground">Add</span>
        </div>

        <div className="min-w-[60px]" />
      </div>
    </div>
  );
}
