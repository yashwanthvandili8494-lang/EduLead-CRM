import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[EduLead ErrorBoundary] Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      // Clear any corrupted local state while keeping auth if possible
      window.location.href = '/dashboard';
    } catch {
      window.location.reload();
    }
  };

  handleFullReset = () => {
    try {
      localStorage.clear();
      window.location.href = '/login';
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-sm text-slate-400">
                A rendering issue was detected. The application caught it to keep your session safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700 text-left font-mono text-xs text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
              <button
                onClick={this.handleReload}
                className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload</span>
              </button>
            </div>

            <button
              onClick={this.handleFullReset}
              className="text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
            >
              Reset Session & Re-Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
