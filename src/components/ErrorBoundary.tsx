import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Sanvektro Runtime Boundary Caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full rounded-2xl bg-[#0d121e] border border-rose-500/30 p-6 shadow-2xl text-center">
            
            <div className="w-12 h-12 aspect-square rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-lg font-bold text-white mb-2 font-['Plus_Jakarta_Sans']">
              Sanvektro Session Recovered
            </h1>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              A state anomaly was safely intercepted by the Error Boundary. Your financial calculations remain protected.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-rose-300 mb-5 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Clean Session</span>
            </button>

            <div className="mt-4 text-[10px] text-slate-500 font-mono">
              Engineered by Saaduddin Mohammed (github.com/saad2134)
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
