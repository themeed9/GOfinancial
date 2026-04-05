import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <div className="bg-gray-100 p-1 rounded-2xl flex relative">
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex-1 py-2 text-sm font-semibold rounded-xl z-10 transition-colors duration-200",
              isActive ? "text-[#1A6BFF]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
}
