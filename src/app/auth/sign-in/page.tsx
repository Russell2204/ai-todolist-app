'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signInWithEmail } from './actions';
import { Sparkles, Key, ArrowRight, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-white transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-7 sm:p-8 flex flex-col gap-6">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Вход в Smart ToDoList</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Авторизуйтесь через Neon Auth для доступа к вашим задачам и личному Google Gemini ключу
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Электронная почта (Email)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {state?.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Вход...</span>
              </>
            ) : (
              <>
                <span>Войти в аккаунт</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Нет аккаунта? </span>
          <Link
            href="/auth/sign-up"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </main>
  );
}
