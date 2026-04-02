import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useBudgetStore } from "@/store/budgetStore";
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

function App() {
  const { activeAccount, monthlyBudget } = useBudgetStore();
  const hasExistingData = activeAccount.length > 0 && monthlyBudget > 0;
  const [onboardingDone, setOnboardingDone] = useState(hasExistingData);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {onboardingDone ? (
            <Router />
          ) : (
            <OnboardingFlow onComplete={() => setOnboardingDone(true)} />
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
