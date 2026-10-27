'use client';

import React, { useState, useEffect } from 'react';
import { useTodo } from '@/context/TodoContext';
import {
  X,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Database,
  User,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    user,
    hasServerKey,
    hasUserDbKey,
    userModel,
    autoAnalyzeOnAdd,
    saveUserDbKey,
    addToast,
  } = useTodo();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState(userModel);
  const [autoAnalyze, setAutoAnalyze] = useState(autoAnalyzeOnAdd);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    setModelInput(userModel);
    setAutoAnalyze(autoAnalyzeOnAdd);
  }, [userModel, autoAnalyzeOnAdd]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveUserDbKey(apiKeyInput, modelInput, autoAnalyze);
    setIsSaving(false);
    if (success) {
      setApiKeyInput('');
      onClose();
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || undefined,
          model: modelInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Подключение успешно! Модель отвечает.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Ошибка проверки ключа',
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Сетевая ошибка';
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Настройки Gemini AI & Профиль
              </h2>
              <p className="text-xs text-slate-500">
                Ключ сохраняется в защищенной базе данных Neon PostgreSQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Info */}
        {user ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white truncate">
                {user.name || 'Пользователь'}
              </div>
              <div className="text-slate-400 truncate text-[11px]">{user.email}</div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Авторизован
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
            <span>Вы не авторизованы. Войдите, чтобы сохранять ключ и задачи в Neon DB.</span>
            <a
              href="/auth/sign-in"
              className="font-semibold underline ml-2 shrink-0 hover:text-amber-900"
            >
              Войти
            </a>
          </div>
        )}

        {/* Database Key Status Banner */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs leading-relaxed ${
            hasUserDbKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : hasServerKey
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}
        >
          <Database className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">
              {hasUserDbKey
                ? 'Личный ключ активен в Neon DB'
                : hasServerKey
                ? 'Используется системный серверный ключ'
                : 'Ключ Gemini еще не сохранен'}
            </span>
            <span>
              {hasUserDbKey
                ? 'Ваш личный Google Gemini API ключ привязан к вашей учетной записи и хранится в таблице user_settings базы Neon.'
                : hasServerKey
                ? 'Вы можете указать личный ключ ниже, чтобы использовать персональные квоты Gemini.'
                : 'Введите ваш ключ Google Gemini API ниже. Он сохранится в базе данных Neon для вашего пользователя.'}
            </span>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {hasUserDbKey ? 'Обновить GEMINI_API_KEY в базе данных' : 'Личный GEMINI_API_KEY'}
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={hasUserDbKey ? '•••••••••••••••• (ключ сохранен в БД)' : 'AIzaSy...'}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Бесплатный ключ в Google AI Studio:</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Получить ключ <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Model Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            Модель Gemini
          </label>
          <select
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="gemini-2.5-flash">
              gemini-2.5-flash (Рекомендуется — быстрый, точный, structured JSON)
            </option>
            <option value="gemini-1.5-flash">gemini-1.5-flash (Flash 1.5)</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash (Flash 2.0)</option>
          </select>
        </div>

        {/* Auto-analyze Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div>
            <span className="font-semibold block text-slate-800 dark:text-slate-200">
              AI Auto-fill по умолчанию
            </span>
            <span className="text-[11px] text-slate-400">
              Автоматически парсить дедлайны и приоритет при добавлении задачи
            </span>
          </div>
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Test Connection Button */}
        <div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Проверка подключения к Gemini...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Проверить статус API-ключа</span>
              </>
            )}
          </button>

          {testResult && (
            <div
              className={`mt-2 p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span className="break-words">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Сохранить в Neon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
