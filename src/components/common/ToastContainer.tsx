import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { systemToast, dismissSystemToast } = useBroker();

  if (!systemToast) return null;

  const getToastIcon = () => {
    switch (systemToast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorderAndBg = () => {
    switch (systemToast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/95 text-slate-100 shadow-emerald-950/50';
      case 'warning':
        return 'border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-amber-950/50';
      case 'error':
        return 'border-rose-500/40 bg-slate-900/95 text-slate-100 shadow-rose-950/50';
      case 'info':
      default:
        return 'border-sky-500/40 bg-slate-900/95 text-slate-100 shadow-sky-950/50';
    }
  };

  return (
    <aside 
      aria-label="Notification"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      <div
        className={`pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${getBorderAndBg()}`}
        role="alert"
      >
        <div className="pt-0.5">{getToastIcon()}</div>
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-semibold tracking-tight text-white">
            {systemToast.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
            {systemToast.message}
          </p>
        </div>
        <button
          onClick={dismissSystemToast}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
