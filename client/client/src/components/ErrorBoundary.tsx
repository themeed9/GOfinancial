import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleFullReset = () => {
    try {
      localStorage.removeItem("budget-storage");
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 z-50">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-xs">
            The app ran into an unexpected issue. You can try again or reset your data if the problem persists.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={this.handleReset}
              className="w-full py-4 rounded-full bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2"
              data-testid="button-retry"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={this.handleFullReset}
              className="w-full py-4 rounded-full bg-red-50 text-red-600 text-sm font-semibold"
              data-testid="button-full-reset"
            >
              Reset All Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
