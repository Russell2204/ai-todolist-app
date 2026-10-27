'use client';

import React from 'react';
import { useTodo } from '@/context/TodoContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useTodo();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#7E9F74] shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-[#B86E53] shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#D6A368] shrink-0" />,
          info: <Info className="w-4 h-4 text-[#7CA3AC] shrink-0" />,
        };

        const borders = {
          success: 'border-l-4 border-l-[#7E9F74] border-t-[#2B2F2A] border-r-[#2B2F2A] border-b-[#2B2F2A]',
          error: 'border-l-4 border-l-[#B86E53] border-t-[#2B2F2A] border-r-[#2B2F2A] border-b-[#2B2F2A]',
          warning: 'border-l-4 border-l-[#D6A368] border-t-[#2B2F2A] border-r-[#2B2F2A] border-b-[#2B2F2A]',
          info: 'border-l-4 border-l-[#7CA3AC] border-t-[#2B2F2A] border-r-[#2B2F2A] border-b-[#2B2F2A]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-[#232622] text-[#E1E3DA] shadow-xl transition-all duration-200 animate-gentle-rise ${
              borders[toast.type]
            }`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-xs min-w-0">
              <div className="font-medium text-[#E1E3DA]">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] text-[#8C9287] mt-0.5 break-words line-clamp-3">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8C9287] hover:text-[#E1E3DA] p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
