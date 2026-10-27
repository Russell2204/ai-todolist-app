'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUpWithEmail } from './actions';
import { Sparkles, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-white transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-7 sm:p-8 flex flex-col gap-6">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Создание аккаунта</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Зарегистрируйтесь, чтобы безопасно хранить задачи и личный Gemini ключ в базе данных Neon
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Ваше имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Руслан"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Электронная почта (Email)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Пароль (от 8 символов)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Минимум 8 знаков"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Ваш личный Google Gemini API ключ сохраняется в защищенной БД Neon</span>
          </div>

          {state?.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Регистрация...</span>
              </>
            ) : (
              <>
                <span>Зарегистрироваться</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Уже есть аккаунт? </span>
          <Link
            href="/auth/sign-in"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Войти
          </Link>
        </div>
      </div>
    </main>
  );
}
