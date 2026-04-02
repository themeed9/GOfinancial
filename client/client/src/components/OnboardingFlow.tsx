import { useState } from "react";
import { SplashScreen } from "./SplashScreen";
import { OnboardingSlides } from "./OnboardingSlides";
import { AccountNameModal } from "./AccountNameModal";
import { BudgetModal } from "./BudgetModal";
import { useBudgetStore } from "@/store/budgetStore";

type OnboardingStep = "splash" | "slides" | "account-name" | "budget" | "complete";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("splash");
  const { setActiveAccount, setMonthlyBudget, setProfileName, resetBalance } = useBudgetStore();

  const handleSplashComplete = () => {
    setStep("slides");
  };

  const handleSlidesComplete = () => {
    setStep("account-name");
  };

  const handleSkip = () => {
    setStep("account-name");
  };

  const handleAccountNameSubmit = (name: string) => {
    setActiveAccount(name);
    const cleanName = name.replace(/[-_]?Acc\d{4}$/i, '').replace(/[-_]+$/, '').trim();
    if (cleanName) {
      setProfileName(cleanName);
    }
    setStep("budget");
  };

  const handleAccountClose = () => {
    setStep("slides");
  };

  const handleBudgetBack = () => {
    setStep("account-name");
  };

  const handleBudgetClose = () => {
    setStep("slides");
  };

  const handleBudgetSubmit = (budget: number) => {
    setMonthlyBudget(budget);
    resetBalance();
    setStep("complete");
    onComplete();
  };

  if (step === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (step === "slides") {
    return <OnboardingSlides onComplete={handleSlidesComplete} onSkip={handleSkip} />;
  }

  if (step === "account-name") {
    return (
      <AccountNameModal
        open={true}
        onSubmit={handleAccountNameSubmit}
        onClose={handleAccountClose}
      />
    );
  }

  if (step === "budget") {
    return (
      <BudgetModal
        open={true}
        onSubmit={handleBudgetSubmit}
        onBack={handleBudgetBack}
        onClose={handleBudgetClose}
      />
    );
  }

  return null;
}
