import { Home, User, Plus, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BottomNavProps {
  onAddClick?: () => void;
  disabled?: boolean;
}

export function BottomNav({ onAddClick, disabled }: BottomNavProps) {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white pb-safe pt-3 px-6 h-24 max-w-[600px] mx-auto z-50">
      <div className="flex justify-between items-end h-full pb-6">
        {/* Home Tab */}
        <Link href="/">
          <button 
            className={`flex flex-col items-center gap-1 min-w-[60px] ${location === '/' ? 'text-gray-900' : 'text-gray-400'}`}
            data-testid="nav-home"
          >
            <FileText className="w-6 h-6" strokeWidth={location === '/' ? 2 : 1.5} />
            <span className="text-xs font-medium">Home</span>
          </button>
        </Link>

        {/* Center FAB - Add */}
        <div className="flex flex-col items-center gap-1 -mt-4">
          <button 
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white transition-all ${
              disabled 
                ? "bg-gray-300 shadow-gray-300/30 cursor-not-allowed" 
                : "bg-blue-500 shadow-blue-500/30 hover:scale-105 active:scale-95"
            }`}
            onClick={disabled ? undefined : onAddClick}
            disabled={disabled}
            data-testid="button-add-fab"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
          <span className="text-xs font-medium text-gray-400">Add</span>
        </div>

        {/* Profile Tab */}
        <Link href="/profile">
          <button 
            className={`flex flex-col items-center gap-1 min-w-[60px] ${location === '/profile' ? 'text-gray-900' : 'text-gray-400'}`}
            data-testid="nav-profile"
          >
            <User className="w-6 h-6" strokeWidth={location === '/profile' ? 2 : 1.5} />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
