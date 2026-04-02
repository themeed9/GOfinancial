import { motion } from "framer-motion";

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <div className="bg-[#F2F2F7] p-1 rounded-xl flex relative">
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              relative flex-1 py-1.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-200
              ${isActive ? "text-black" : "text-gray-500 hover:text-gray-700"}
            `}
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
