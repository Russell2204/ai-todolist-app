'use client';

import React from 'react';
import Link from 'next/link';
import { useTodo } from '@/context/TodoContext';
import {
  Sparkles,
  ListOrdered,
  Grid2X2,
  SlidersHorizontal,
  Loader2,
  LogOut,
  LogIn,
} from 'lucide-react';
import { signOut } from '@/app/auth/sign-out/actions';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const {
    viewMode,
    setViewMode,
    prioritizeAllTasks,
    isPrioritizing,
    prioritizeCooldown,
    hasServerKey,
    hasUserDbKey,
    user,
    isLoadingUser,
  } = useTodo();

  const isKeyConfigured = Boolean(hasUserDbKey || hasServerKey);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#111211]/90 border-b border-[#222521] transition-colors">
      <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 h-12 sm:h-13 flex items-center justify-between gap-3">
        {/* Left: Minimalist Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#1A1C1A] border border-[#2B2F2A] flex items-center justify-center text-[#7E9F74] group-hover:border-[#7E9F74] transition-colors">
              <span className="w-2 h-2 rounded-full bg-[#7E9F74]" />
            </div>
            <span className="font-semibold text-sm sm:text-base tracking-tight text-[#E1E3DA] group-hover:text-white transition-colors">
              SmartToDo
            </span>
          </Link>
        </div>

        {/* Center: Segmented Switcher [ Список | Матрица ] */}
        <div className="flex items-center bg-[#141614] p-1 rounded-xl border border-[#222521] text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#232622] text-[#E1E3DA] shadow-xs font-semibold'
                : 'text-[#8C9287] hover:text-[#E1E3DA]'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Список</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-[#232622] text-[#E1E3DA] shadow-xs font-semibold'
                : 'text-[#8C9287] hover:text-[#E1E3DA]'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Матрица</span>
          </button>
        </div>

        {/* Right: AI Prioritize Action & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Focus Button */}
          <button
            type="button"
            onClick={prioritizeAllTasks}
            disabled={isPrioritizing || prioritizeCooldown > 0}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1A1C1A] text-[#7CA3AC] hover:text-[#90BAC4] hover:bg-[#232622] border border-[#282C27] hover:border-[#383F35] transition-all disabled:opacity-40 cursor-pointer"
            title={
              prioritizeCooldown > 0
                ? `Повтор через ${prioritizeCooldown}с`
                : 'Упорядочить задачи по важности через AI'
            }
          >
            {isPrioritizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Анализ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Упорядочить</span>
              </>
            )}
          </button>

          {/* Settings Trigger with status dot */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-[#1A1C1A] border border-[#282C27] text-[#8C9287] hover:text-[#E1E3DA] hover:bg-[#232622] transition-colors cursor-pointer"
            title={isKeyConfigured ? 'Настройки (ключ подключен)' : 'Настройки (ключ не настроен)'}
            aria-label="Настройки"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span
              className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                isKeyConfigured ? 'bg-[#7E9F74]' : 'bg-[#D6A368]'
              }`}
            />
          </button>

          {/* User Account / Auth Status */}
          {isLoadingUser ? (
            <div className="w-8 h-8 rounded-xl bg-[#1A1C1A] animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-1">
              <span
                className="hidden md:inline text-xs font-medium text-[#C4C8BE] max-w-[100px] truncate"
                title={user.email}
              >
                {user.name || 'Профиль'}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-[#1A1C1A] border border-[#282C27] text-[#8C9287] hover:text-[#B86E53] hover:bg-[#B86E53]/10 transition-colors cursor-pointer"
                title="Выйти из аккаунта"
                aria-label="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium bg-[#7E9F74] text-[#111211] hover:bg-[#8EB382] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
