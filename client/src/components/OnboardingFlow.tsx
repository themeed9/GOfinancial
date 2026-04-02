import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "./Layout";
import { Button } from "./ui/button";

type OnboardingStep = "welcome" | "account" | "budget" | "complete";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");

  if (step === "welcome") {
    return (
      <Layout className="flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold text-white">GO</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to GO Financial</h1>
          <p className="text-muted-foreground mb-8 max-w-[280px] mx-auto">
            Take control of your finances with smart tracking and insights
          </p>
          <Button onClick={() => setStep("account")} size="lg" className="w-full">
            Get Started
          </Button>
        </motion.div>
      </Layout>
    );
  }

  if (step === "account") {
    return <AccountSetup onNext={() => setStep("budget")} />;
  }

  if (step === "budget") {
    return <BudgetSetup onComplete={onComplete} />;
  }

  return null;
}

function AccountSetup({ onNext }: { onNext: () => void }) {
  const [accountName, setAccountName] = useState("");

  const handleSubmit = () => {
    if (accountName.trim()) {
      onNext();
    }
  };

  return (
    <Layout className="flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-center mb-2">Name Your Account</h1>
        <p className="text-muted-foreground text-center mb-8">
          Give your budget account a name
        </p>

        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl p-4">
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g., My Budget 2026"
              className="w-full bg-transparent text-center text-lg font-semibold outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!accountName.trim()}
        size="lg"
        className="w-full"
      >
        Continue
      </Button>
    </Layout>
  );
}

function BudgetSetup({ onComplete }: { onComplete: () => void }) {
  const [amount, setAmount] = useState("");

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    if (numeric) {
      setAmount(parseInt(numeric).toLocaleString());
    } else {
      setAmount("");
    }
  };

  const handleSubmit = () => {
    const numAmount = parseInt(amount.replace(/,/g, "")) || 0;
    if (numAmount > 0) {
      onComplete();
    }
  };

  return (
    <Layout className="flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-center mb-2">Set Your Budget</h1>
        <p className="text-muted-foreground text-center mb-8">
          How much do you plan to spend this month?
        </p>

        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl p-6 flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-muted-foreground">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="bg-transparent text-4xl font-bold text-center w-full outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!amount || parseInt(amount.replace(/,/g, "")) <= 0}
        size="lg"
        className="w-full"
      >
        Set Budget
      </Button>
    </Layout>
  );
}
