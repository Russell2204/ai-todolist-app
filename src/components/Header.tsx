'use client';

import React from 'react';
import Link from 'next/link';
import { useTodo } from '@/context/TodoContext';
import {
  Sparkles,
  ListOrdered,
  Grid2X2,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Loader2,
  CheckCircle,
  Flame,
  User as UserIcon,
  LogOut,
  LogIn,
} from 'lucide-react';
import { signOut } from '@/app/auth/sign-out/actions';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const {
    tasks,
    viewMode,
    setViewMode,
    prioritizeAllTasks,
    isPrioritizing,
    prioritizeCooldown,
    hasServerKey,
    hasUserDbKey,
    user,
    isLoadingUser,
    theme,
    toggleTheme,
  } = useTodo();

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const criticalCount = tasks.filter((t) => !t.isCompleted && (t.priority === 'CRITICAL' || t.priority === 'HIGH')).length;

  const isKeyConfigured = Boolean(hasUserDbKey || hasServerKey);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/80 dark:bg-[#090d16]/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Smart ToDoList
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI-приоритезация по матрице Эйзенхауэра (Neon DB + Vercel)
            </p>
          </div>
        </div>

        {/* View Switcher: List vs Matrix */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Список</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            <span>Матрица 2x2</span>
          </button>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Stats Chips */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {completedCount}/{totalCount}
              </span>
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>{criticalCount} срочных</span>
              </div>
            )}
          </div>

          {/* Magic Sort Button: "Разобрать с AI" */}
          <button
            onClick={prioritizeAllTasks}
            disabled={isPrioritizing || prioritizeCooldown > 0}
            className={`relative group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
              isPrioritizing
                ? 'bg-purple-600/80 text-white cursor-wait ai-shimmer'
                : prioritizeCooldown > 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-95 hover:shadow-purple-500/25 active:scale-[0.98]'
            }`}
            title={
              prioritizeCooldown > 0
                ? `Повторный запуск доступен через ${prioritizeCooldown} сек.`
                : 'Автоматически расставить приоритеты и баллы важности для всех активных задач'
            }
          >
            {isPrioritizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Анализ задач...</span>
              </>
            ) : prioritizeCooldown > 0 ? (
              <>
                <Sparkles className="w-4 h-4 opacity-50" />
                <span>Пауза ({prioritizeCooldown}с)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                <span>Разобрать с AI</span>
              </>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Settings Trigger with DB Key indicator */}
          <button
            onClick={onOpenSettings}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={
              isKeyConfigured
                ? 'Ключ Gemini настроен в базе данных Neon'
                : 'Ключ Gemini отсутствует в профиле, нажмите для добавления'
            }
          >
            <SettingsIcon className="w-4 h-4" />
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                isKeyConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
              }`}
            />
          </button>

          {/* User Account / Auth Status */}
          {isLoadingUser ? (
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div
                className="hidden sm:flex flex-col text-right leading-tight max-w-[120px]"
                title={user.email}
              >
                <span className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                  {user.name || 'Пользователь'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-900/50 transition-colors"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/auth/sign-in"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
