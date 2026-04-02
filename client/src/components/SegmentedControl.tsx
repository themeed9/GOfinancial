import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <div className="bg-secondary p-1 rounded-xl flex relative">
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex-1 py-1.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-200",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-pill"
                className="absolute inset-0 bg-white rounded-lg shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
}
