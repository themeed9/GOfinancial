import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
  };

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-full text-white text-sm font-medium shadow-lg animate-slide-in-top",
        bgColors[type]
      )}
    >
      {message}
    </div>
  );
}

interface ToasterProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function Toaster({ toasts, onClose }: ToasterProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
