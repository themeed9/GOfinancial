import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-[#F2F2F7]">
      <div className={`w-full max-w-[600px] min-h-screen bg-white sm:shadow-2xl overflow-hidden relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
