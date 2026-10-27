'use client';

import React, { useState } from 'react';
import { useTodo } from '@/context/TodoContext';
import { Sparkles, Plus, Loader2, Calendar, Clock, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { PriorityLevel, EisenhowerQuadrant } from '@/types/todo';

export function SmartTaskInput() {
  const {
    addTask,
    parseAndAddTask,
    isParsingNLP,
    autoAnalyzeOnAdd,
    saveUserDbKey,
    allTags,
  } = useTodo();

  const [inputVal, setInputVal] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [localAutoFill, setLocalAutoFill] = useState(autoAnalyzeOnAdd);

  // Manual extra parameters when AI auto-fill is off or user wants custom control
  const [manualPriority, setManualPriority] = useState<PriorityLevel>('MEDIUM');
  const [manualQuadrant, setManualQuadrant] = useState<EisenhowerQuadrant>('SCHEDULE');
  const [manualMinutes, setManualMinutes] = useState<number>(30);
  const [manualDueDate, setManualDueDate] = useState<string>('');
  const [manualTagInput, setManualTagInput] = useState<string>('');

  const toggleAutoFill = () => {
    const nextVal = !localAutoFill;
    setLocalAutoFill(nextVal);
    saveUserDbKey(undefined as any, undefined, nextVal).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isParsingNLP) return;

    if (localAutoFill) {
      const textToParse = inputVal;
      setInputVal('');
      await parseAndAddTask(textToParse);
    } else {
      const tags = manualTagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addTask({
        title: inputVal.trim(),
        priority: manualPriority,
        quadrant: manualQuadrant,
        estimatedMinutes: Number(manualMinutes) || 30,
        dueDate: manualDueDate ? new Date(manualDueDate).toISOString() : undefined,
        tags,
      });

      setInputVal('');
      setManualTagInput('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-3 sm:p-4 transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        {/* Main Input Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isParsingNLP}
              placeholder={
                localAutoFill
                  ? '✨ Введите задачу своими словами (например: "Сдать отчет к пятнице до 17:00")'
                  : 'Добавьте новую задачу...'
              }
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                isParsingNLP
                  ? 'border-purple-500/50 ai-shimmer text-slate-400'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
            {isParsingNLP && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">AI анализирует...</span>
              </div>
            )}
          </div>

          {/* Add / Submit Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() || isParsingNLP}
            className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-sm ${
              !inputVal.trim() || isParsingNLP
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        {/* Toolbar Row: AI Toggle & Expand Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
          {/* AI Auto-fill Toggle */}
          <button
            type="button"
            onClick={toggleAutoFill}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              localAutoFill
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Автоматически определять дедлайн, приоритет, категорию и время через Gemini AI"
          >
            <Sparkles className={`w-3.5 h-3.5 ${localAutoFill ? 'text-purple-500 animate-spin-slow' : ''}`} />
            <span>AI Auto-fill</span>
            <span
              className={`w-2 h-2 rounded-full ml-0.5 ${
                localAutoFill ? 'bg-purple-500' : 'bg-slate-400'
              }`}
            />
          </button>

          {/* Manual parameters toggle when AI is off */}
          {!localAutoFill && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Детальные параметры</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <div className="text-[11px] text-slate-400 ml-auto hidden sm:block">
            {localAutoFill ? 'Нажмите Enter для интеллектуального парсинга' : 'Enter для быстрого сохранения в Neon DB'}
          </div>
        </div>

        {/* Expandable Manual Parameters Form */}
        {!localAutoFill && isExpanded && (
          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
            {/* Priority */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Приоритет</label>
              <select
                value={manualPriority}
                onChange={(e) => setManualPriority(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="CRITICAL">🔥 Критический</option>
                <option value="HIGH">⚡ Высокий</option>
                <option value="MEDIUM">🔹 Средний</option>
                <option value="LOW">◽ Низкий</option>
              </select>
            </div>

            {/* Quadrant */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Квадрант Эйзенхауэра</label>
              <select
                value={manualQuadrant}
                onChange={(e) => setManualQuadrant(e.target.value as EisenhowerQuadrant)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="DO_FIRST">1. Сделать первым (Важно & Срочно)</option>
                <option value="SCHEDULE">2. Запланировать (Важно & Не срочно)</option>
                <option value="DELEGATE">3. Делегировать (Не важно & Срочно)</option>
                <option value="DELETE">4. Устранить (Не важно & Не срочно)</option>
              </select>
            </div>

            {/* Time Estimate */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Оценка времени (мин)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Дедлайн
              </label>
              <input
                type="datetime-local"
                value={manualDueDate}
                onChange={(e) => setManualDueDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Tags Input */}
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" /> Теги (через запятую)
              </label>
              <input
                type="text"
                value={manualTagInput}
                onChange={(e) => setManualTagInput(e.target.value)}
                placeholder="Работа, Отчет, Здоровье..."
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1 self-center">Быстрые:</span>
                  {allTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = manualTagInput ? manualTagInput.split(',').map((t) => t.trim()) : [];
                        if (!current.includes(tag)) {
                          setManualTagInput([...current, tag].join(', '));
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
