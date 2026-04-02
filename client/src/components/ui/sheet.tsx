import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-fade"
          onClick={() => onOpenChange(false)}
        />
      )}
      {children}
    </>
  );
}

interface SheetContentProps {
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  children: React.ReactNode;
}

export function SheetContent({ side = "bottom", className, children }: SheetContentProps) {
  const isBottom = side === "bottom";
  
  return (
    <div
      className={cn(
        "fixed z-50 bg-white p-6 pb-10 rounded-t-3xl animate-slide-in-bottom ios-shadow-lg transition-all",
        isBottom ? "left-0 right-0 bottom-0" : "",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-6", className)}>{children}</div>;
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)}>{children}</h2>;
}

export function SheetDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function SheetClose({ 
  onClick, 
  className 
}: { 
  onClick?: () => void; 
  className?: string 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

export function SheetFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mt-6 flex flex-col gap-3", className)}>{children}</div>;
}
