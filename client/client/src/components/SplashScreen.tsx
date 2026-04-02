import { useEffect } from "react";
import { motion } from "framer-motion";
import splashImg from "@assets/GO_Mobile_4_1770980265611.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={splashImg}
        alt="GO for freedom"
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
