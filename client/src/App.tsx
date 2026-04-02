import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Toaster } from "@/components/ui/toast";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useToast } from "@/hooks/useToast";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import YearScreen from "@/pages/YearScreen";
import MonthScreen from "@/pages/MonthScreen";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/year/:year" component={YearScreen} />
      <Route path="/year/:year/month/:month" component={MonthScreen} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { toasts, removeToast } = useToast();
  const { monthlyBudget, accountName } = useBudgetStore();
  const hasExistingData = monthlyBudget > 0 || accountName.length > 0;
  const [onboardingDone, setOnboardingDone] = useState(hasExistingData);

  return (
    <>
      <Toaster toasts={toasts} onClose={removeToast} />
      {onboardingDone ? (
        <Router />
      ) : (
        <OnboardingFlow onComplete={() => setOnboardingDone(true)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
