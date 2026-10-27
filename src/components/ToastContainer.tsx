'use client';

import React from 'react';
import { useTodo } from '@/context/TodoContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useTodo();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        };

        const bgStyles = {
          success: 'bg-emerald-950/90 border-emerald-800 text-emerald-100',
          error: 'bg-rose-950/90 border-rose-800 text-rose-100',
          warning: 'bg-amber-950/90 border-amber-800 text-amber-100',
          info: 'bg-slate-900/95 border-slate-750 text-slate-100',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              bgStyles[toast.type]
            }`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm min-w-0">
              <div className="font-semibold">{toast.title}</div>
              {toast.message && (
                <div className="text-xs opacity-85 mt-0.5 break-words line-clamp-3">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 p-1 rounded-lg transition-opacity"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
