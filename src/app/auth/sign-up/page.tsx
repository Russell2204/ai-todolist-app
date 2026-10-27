'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUpWithEmail } from './actions';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#111211] text-[#E1E3DA] transition-colors">
      <div className="w-full max-w-md bg-[#1A1C1A] border border-[#282C27] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 animate-gentle-rise">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#232622] border border-[#2B2F2A] flex items-center justify-center text-[#7E9F74] mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7E9F74]" />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#E1E3DA]">
            Создание профиля
          </h1>
          <p className="text-xs text-[#8C9287] mt-1 max-w-xs leading-relaxed">
            Синхронизация ваших задач и настроек на всех устройствах
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-[#C4C8BE] font-medium mb-1">
              Ваше имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Руслан"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74] text-sm"
            />
          </div>

          <div>
            <label className="block text-[#C4C8BE] font-medium mb-1">
              Электронная почта (Email)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74] text-sm"
            />
          </div>

          <div>
            <label className="block text-[#C4C8BE] font-medium mb-1">
              Пароль (от 8 символов)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Минимум 8 знаков"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74] text-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8C9287] bg-[#141614] p-2.5 rounded-xl border border-[#242823]">
            <ShieldCheck className="w-4 h-4 text-[#7E9F74] shrink-0" />
            <span>Ваши задачи и персональные настройки защищены</span>
          </div>

          {state?.error && (
            <div className="p-3 rounded-xl bg-[#B86E53]/15 border border-[#B86E53]/30 text-[#E1E3DA] text-xs font-medium">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-1.5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#7E9F74] hover:bg-[#8EB382] text-[#111211] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
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
        <div className="pt-3 border-t border-[#242823] text-center text-xs text-[#8C9287]">
          <span>Уже есть профиль? </span>
          <Link
            href="/auth/sign-in"
            className="font-medium text-[#7E9F74] hover:text-[#8EB382] hover:underline"
          >
            Войти
          </Link>
        </div>
      </div>
    </main>
  );
}
