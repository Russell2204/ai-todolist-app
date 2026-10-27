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
  Eye,
  EyeOff,
  User,
  Sparkles,
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
  } = useTodo();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState(userModel);
  const [autoAnalyze, setAutoAnalyze] = useState(autoAnalyzeOnAdd);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    setModelInput(userModel);
    setAutoAnalyze(autoAnalyzeOnAdd);
    // Check initial reduced motion setting
    const savedMotion = localStorage.getItem('nordic_reduce_motion') === 'true';
    setReduceMotion(savedMotion);
  }, [userModel, autoAnalyzeOnAdd]);

  const toggleReduceMotion = (enabled: boolean) => {
    setReduceMotion(enabled);
    localStorage.setItem('nordic_reduce_motion', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-gentle-rise">
      <div className="relative w-full max-w-lg bg-[#1A1C1A] border border-[#282C27] rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242823]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#232622] border border-[#2B2F2A] text-[#7E9F74] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#E1E3DA]">
                Настройки профиля и AI
              </h2>
              <p className="text-xs text-[#8C9287]">
                Безопасное облачное хранение данных
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8C9287] hover:text-[#E1E3DA] hover:bg-[#232622] transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account Info */}
        {user ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141614] border border-[#242823] text-xs">
            <div className="w-8 h-8 rounded-lg bg-[#232622] text-[#7E9F74] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#E1E3DA] truncate">
                {user.name || 'Пользователь'}
              </div>
              <div className="text-[#8C9287] truncate text-[11px]">{user.email}</div>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#7E9F74]/15 text-[#7E9F74]">
              Подключено
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#232622] border border-[#2B2F2A] text-xs flex items-center justify-between text-[#E1E3DA]">
            <span>Войдите в аккаунт для облачной синхронизации.</span>
            <a
              href="/auth/sign-in"
              className="text-[#7E9F74] font-semibold underline ml-2 shrink-0 hover:text-[#8EB382]"
            >
              Войти
            </a>
          </div>
        )}

        {/* API Key Status Indicator */}
        <div className="p-3 rounded-xl bg-[#141614] border border-[#242823] text-xs leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#7E9F74] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-medium text-[#E1E3DA] block">
              {hasUserDbKey
                ? 'Персональный ключ активен'
                : hasServerKey
                ? 'Используется системный ключ'
                : 'Ключ Gemini не сохранен'}
            </span>
            <span className="text-[#8C9287] text-[11px]">
              {hasUserDbKey
                ? 'Ваш ключ надежно привязан к личному профилю и используется для индивидуальных запросов.'
                : 'Вы можете указать личный ключ ниже для доступа к индивидуальным квотам.'}
            </span>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#C4C8BE]">
            {hasUserDbKey ? 'Обновить Google Gemini API ключ' : 'Личный Google Gemini API ключ'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={hasUserDbKey ? '•••••••••••••••• (ключ сохранен)' : 'AIzaSy...'}
              className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74]"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9287] hover:text-[#E1E3DA] p-1 cursor-pointer"
              title={showKey ? 'Скрыть ключ' : 'Показать ключ'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C9287] pt-0.5">
            <span>Бесплатный ключ в Google AI Studio:</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[#7CA3AC] hover:underline inline-flex items-center gap-1 font-medium"
            >
              Получить ключ <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Model Picker */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#C4C8BE] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#7CA3AC]" />
            Модель нейросети
          </label>
          <select
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74] cursor-pointer"
          >
            <option value="gemini-2.5-flash">
              gemini-2.5-flash (Рекомендуется — высокая скорость и точность)
            </option>
            <option value="gemini-1.5-flash">gemini-1.5-flash (Flash 1.5)</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash (Flash 2.0)</option>
          </select>
        </div>

        {/* Toggles: Auto-Analyze & Reduced Motion */}
        <div className="space-y-2 pt-1">
          {/* Auto-analyze */}
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141614] border border-[#242823] text-xs cursor-pointer">
            <div>
              <span className="font-medium block text-[#E1E3DA]">
                AI авто-анализ при добавлении
              </span>
              <span className="text-[11px] text-[#8C9287]">
                Автоматически определять дедлайны и квадранты из текста
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="w-4 h-4 rounded accent-[#7E9F74] cursor-pointer"
            />
          </label>

          {/* Reduced Motion Toggle (Anti-Stress / High Performance) */}
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#141614] border border-[#242823] text-xs cursor-pointer">
            <div>
              <span className="font-medium block text-[#E1E3DA]">
                Режим тишины (без анимаций)
              </span>
              <span className="text-[11px] text-[#8C9287]">
                Отключает всплывания и микро-сдвиги для экономии ресурсов
              </span>
            </div>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => toggleReduceMotion(e.target.checked)}
              className="w-4 h-4 rounded accent-[#7E9F74] cursor-pointer"
            />
          </label>
        </div>

        {/* Test Connection Button */}
        <div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium bg-[#232622] hover:bg-[#2B2F2A] text-[#C4C8BE] hover:text-[#E1E3DA] border border-[#2B2F2A] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7CA3AC]" />
                <span>Проверка связи с моделью...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#7CA3AC]" />
                <span>Проверить статус подключения</span>
              </>
            )}
          </button>

          {testResult && (
            <div
              className={`mt-2 p-2.5 rounded-xl border text-xs flex items-start gap-2 animate-gentle-rise ${
                testResult.success
                  ? 'bg-[#7E9F74]/15 border-[#7E9F74]/30 text-[#E1E3DA]'
                  : 'bg-[#B86E53]/15 border-[#B86E53]/30 text-[#E1E3DA]'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#7E9F74] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#B86E53] shrink-0 mt-0.5" />
              )}
              <span className="break-words">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#242823] mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-[#8C9287] hover:text-[#E1E3DA] hover:bg-[#232622] transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#7E9F74] text-[#111211] hover:bg-[#8EB382] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Сохранить настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
}
